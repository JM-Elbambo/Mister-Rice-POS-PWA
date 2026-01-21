import { BaseCollection } from "./baseCollection.js";
import { collection, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.js";

class StockBatches extends BaseCollection {
  constructor() {
    super("stockBatches");

    this.query = query(
      collection(db, this.collectionName),
      where("remainingQty", ">", 0),
    );

    this.itemTotals = new Map();
    this.itemBatches = new Map();
  }

  processData(rawData) {
    this.data = rawData.sort(
      (a, b) => a.purchaseDate?.toMillis() - b.purchaseDate?.toMillis(),
    );

    this.itemTotals.clear();
    this.itemBatches.clear();

    for (const stock of this.data) {
      if (!stock.itemId || stock.remainingQty <= 0) continue;

      const current = this.itemTotals.get(stock.itemId) ?? 0;
      this.itemTotals.set(stock.itemId, current + stock.remainingQty);

      if (!this.itemBatches.has(stock.itemId)) {
        this.itemBatches.set(stock.itemId, []);
      }
      this.itemBatches.get(stock.itemId).push(stock);
    }
  }

  async addStockByPo(itemId, poId, qty, unitCost) {
    return await this.add({
      itemId: itemId,
      poId: poId,
      receivedQty: parseFloat(qty),
      remainingQty: parseFloat(qty),
      unitCost: parseFloat(unitCost),
    });
  }

  async adjustStock(itemId, quantity) {
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
      updates.push({
        id: batch.id,
        remainingQty: batch.remainingQty + toAdd,
      });

      remainingToAdd -= toAdd;
    }

    if (remainingToAdd > 0) {
      throw new Error(
        `Cannot add ${remainingToAdd} units. All batches are at full capacity.`,
      );
    }

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
      updates.push({
        id: stock.id,
        remainingQty: stock.remainingQty - toDeduct,
      });

      remainingToReduce -= toDeduct;
    }

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
    return this.itemBatches.get(itemId) || [];
  }

  getItemTotal(itemId) {
    return this.itemTotals.get(itemId) ?? 0;
  }
}

export const stockBatchesCollection = new StockBatches();
