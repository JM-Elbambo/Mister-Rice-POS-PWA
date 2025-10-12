import { BaseCollection } from "./baseCollection.js";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase.js";

class StocksCollection extends BaseCollection {
  constructor() {
    super("stocks");

    this.query = query(
      collection(db, this.collectionName),
      where("remaining", ">", 0)
    );
    this.itemTotals = new Map();
  }

  async fetch() {
    if (this.loading) return this.data;

    this.loading = true;
    this.error = null;
    this.notify();

    try {
      const q = query(
        collection(db, this.collectionName),
        where("remaining", ">", 0)
      );
      const snapshot = await getDocs(q);
      this.data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.error = null;
    } catch (error) {
      console.error(`Error fetching ${this.collectionName}:`, error);
      this.error = error;
    } finally {
      this.loading = false;
      this.notify();
    }

    return this.data;
  }

  async addStock(itemId, quantity, cost, purchaseDate = new Date()) {
    const stockData = {
      itemId,
      quantity: parseFloat(quantity),
      remaining: parseFloat(quantity),
      cost: parseFloat(cost),
      purchaseDate: purchaseDate.toISOString(),
      createdAt: new Date().toISOString(),
    };

    return await this.add(stockData);
  }

  async reduceStock(itemId, quantityToReduce) {
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
        })
      )
    );

    return updates;
  }

  getAvailableByItem(itemId) {
    return this.data
      .filter((s) => s.itemId === itemId)
      .sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));
  }

  syncItemTotals() {
    this.itemTotals = new Map();

    for (const stock of this.data) {
      if (!stock.itemId) continue;

      const current = this.itemTotals.get(stock.itemId) ?? 0;
      this.itemTotals.set(stock.itemId, current + (stock.remaining ?? 0));
    }
  }
}

export const stocksCollection = new StocksCollection();
