import { BaseCollection } from "./baseCollection.js";
import { collection, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.js";

class StocksCollection extends BaseCollection {
  constructor() {
    super("stocks");

    this.query = query(
      collection(db, this.collectionName),
      where("remainingQty", ">", 0),
    );
    this.itemTotals = new Map();
  }

  processData(rawData) {
    this.data = rawData.sort(
      (a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate),
    );
    this.itemTotals = new Map();

    for (const stock of this.data) {
      if (!stock.itemId) continue;
      const current = this.itemTotals.get(stock.itemId) ?? 0;
      this.itemTotals.set(stock.itemId, current + (stock.remainingQty ?? 0));
    }
  }

  async addStockFromPo({
    itemId,
    poId,
    qty,
    unitCost,
    purchaseDate,
    supplier,
  }) {
    const stockData = {
      itemId,
      poId,
      receivedQty: parseFloat(qty),
      remainingQty: parseFloat(qty),
      unitCost: parseFloat(unitCost),
      purchaseDate,
      supplier,
    };

    return await this.add(stockData);
  }

  async adjustStock(itemId, quantity, reason) {
    if (quantity > 0) {
      return await this.addToExistingBatches(itemId, quantity);
    } else {
      return await this.reduceStock(itemId, Math.abs(quantity), reason);
    }
  }

  async addToExistingBatches(itemId, quantityToAdd) {
    const batches = this.getAvailableByItem(itemId).sort(
      (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate),
    ); // Latest first

    if (batches.length === 0) {
      throw new Error("No existing batches found. Cannot add stock.");
    }

    let remaining = quantityToAdd;
    const updates = [];

    for (const batch of batches) {
      if (remaining <= 0) break;

      const capacity = batch.quantity - batch.remaining;
      if (capacity <= 0) continue; // Skip full batches

      const toAdd = Math.min(capacity, remaining);
      const newRemaining = batch.remaining + toAdd;

      updates.push({
        id: batch.id,
        remaining: newRemaining,
      });

      remaining -= toAdd;
    }

    if (remaining > 0) {
      throw new Error(
        `Cannot add ${remaining} units. All batches are at full capacity.`,
      );
    }

    await Promise.all(
      updates.map((u) =>
        updateDoc(doc(db, this.collectionName, u.id), {
          remaining: u.remaining,
          lastUpdated: new Date().toISOString(),
        }),
      ),
    );

    return updates;
  }

  async reduceStock(itemId, quantityToReduce, reason) {
    const stocks = this.getAvailableByItem(itemId);
    let remaining = quantityToReduce;
    const updates = [];

    for (const stock of stocks) {
      if (remaining <= 0) break;

      const toDeduct = Math.min(stock.remaining, remaining);
      const newRemaining = stock.remaining - toDeduct;

      updates.push({
        id: stock.id,
        remaining: newRemaining,
      });

      remaining -= toDeduct;
    }

    if (remaining > 0) {
      throw new Error("Insufficient stock to reduce");
    }

    await Promise.all(
      updates.map((u) =>
        updateDoc(doc(db, this.collectionName, u.id), {
          remaining: u.remaining,
          lastUpdated: new Date().toISOString(),
        }),
      ),
    );

    return updates;
  }

  getAvailableByItem(itemId) {
    return this.data.filter((s) => s.itemId === itemId);
  }
}

export const stocksCollection = new StocksCollection();
