import { BaseCollection } from "./baseCollection.js";
import { collection, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.js";

class StocksCollection extends BaseCollection {
  constructor() {
    super("stocks");

    // Only fetch active stock (remainingQty > 0)
    this.query = query(
      collection(db, this.collectionName),
      where("remainingQty", ">", 0),
    );

    this.itemTotals = new Map();
    this.itemBatches = new Map(); // Cache batches by itemId
  }

  processData(rawData) {
    // Sort once during processing
    this.data = rawData.sort(
      (a, b) => a.purchaseDate.toMillis() - b.purchaseDate.toMillis(),
    );

    // Clear and rebuild maps
    this.itemTotals.clear();
    this.itemBatches.clear();

    for (const stock of this.data) {
      if (!stock.itemId || stock.remainingQty <= 0) continue;

      // Build totals map
      const current = this.itemTotals.get(stock.itemId) ?? 0;
      this.itemTotals.set(stock.itemId, current + stock.remainingQty);

      // Build batches map for quick lookup
      if (!this.itemBatches.has(stock.itemId)) {
        this.itemBatches.set(stock.itemId, []);
      }
      this.itemBatches.get(stock.itemId).push(stock);
    }
  }

  async addStockByPo({ itemId, poId, qty, unitCost, purchaseDate, supplier }) {
    const stockData = {
      itemId,
      poId,
      receivedQty: parseFloat(qty),
      remainingQty: parseFloat(qty),
      unitCost: parseFloat(unitCost),
      purchaseDate,
      supplier: supplier || null,
    };

    return await this.add(stockData);
  }

  async adjustStock(itemId, quantity, reason) {
    if (quantity > 0) {
      return await this.addStock(itemId, quantity);
    } else {
      return await this.reduceStock(itemId, Math.abs(quantity));
    }
  }

  async addStock(itemId, quantityToAdd) {
    const batches = this.getAvailableByItem(itemId).reverse();

    if (batches.length === 0) {
      throw new Error("No existing batches found. Cannot add stock.");
    }

    let remainingToAdd = quantityToAdd;
    const updates = [];

    for (const batch of batches) {
      if (remainingToAdd <= 0) break;

      const capacity = batch.receivedQty - batch.remainingQty;
      if (capacity <= 0) continue;

      const toAdd = Math.min(capacity, remainingToAdd);
      const newRemaining = batch.remainingQty + toAdd;

      updates.push({
        id: batch.id,
        remainingQty: newRemaining,
      });

      remainingToAdd -= toAdd;
    }

    if (remainingToAdd > 0) {
      throw new Error(
        `Cannot add ${remainingToAdd} units. All batches are at full capacity.`,
      );
    }

    // Batch update
    await Promise.all(
      updates.map((u) =>
        updateDoc(doc(db, this.collectionName, u.id), {
          remainingQty: u.remainingQty,
        }),
      ),
    );

    return updates;
  }

  async reduceStock(itemId, quantityToReduce) {
    const stocks = this.getAvailableByItem(itemId);

    if (stocks.length === 0) {
      throw new Error("No stock available for this item");
    }

    const totalAvailable = stocks.reduce((sum, s) => sum + s.remainingQty, 0);
    if (quantityToReduce > totalAvailable) {
      throw new Error(
        `Insufficient stock. Available: ${totalAvailable}, Requested: ${quantityToReduce}`,
      );
    }

    let remainingToReduce = quantityToReduce;
    const updates = [];

    for (const stock of stocks) {
      if (remainingToReduce <= 0) break;

      const toDeduct = Math.min(stock.remainingQty, remainingToReduce);
      const newRemaining = stock.remainingQty - toDeduct;

      updates.push({
        id: stock.id,
        remainingQty: newRemaining,
      });

      remainingToReduce -= toDeduct;
    }

    // Batch update
    await Promise.all(
      updates.map((u) =>
        updateDoc(doc(db, this.collectionName, u.id), {
          remainingQty: u.remainingQty,
        }),
      ),
    );

    return updates;
  }

  getAvailableByItem(itemId) {
    // Use cached map for O(1) lookup instead of filtering entire array
    return this.itemBatches.get(itemId) || [];
  }

  // Get total stock for a single item (O(1) lookup)
  getItemTotal(itemId) {
    return this.itemTotals.get(itemId) ?? 0;
  }
}

export const stocksCollection = new StocksCollection();
