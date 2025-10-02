import { BaseCollection } from "./baseCollection.js";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase.js";

class StocksCollection extends BaseCollection {
  constructor() {
    super("stocks");
  }

  processData(rawData) {
    return (
      rawData
        // .filter((stock) => (parseFloat(stock.remaining) || 0) > 0)
        .map((stock) => ({
          ...stock,
          quantity: parseFloat(stock.quantity) || 0,
          remaining: parseFloat(stock.remaining) || 0,
          cost: parseFloat(stock.cost) || 0,
          purchaseDate: stock.purchaseDate || new Date().toISOString(),
        }))
    );
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
      this.data = this.processData(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
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

  listen() {
    if (this.unsubscribe) return;

    const q = query(
      collection(db, this.collectionName),
      where("remaining", ">", 0)
    );

    this.unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        this.data = this.processData(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        this.loading = false;
        this.error = null;
        this.notify();
      },
      (error) => {
        console.error(`${this.collectionName} listener error:`, error);
        this.error = error;
        this.notify();
      }
    );
  }

  async getByItem(itemId) {
    const q = query(
      collection(db, this.collectionName),
      where("itemId", "==", itemId),
      where("remaining", ">", 0)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));
  }

  getAvailableByItem(itemId) {
    return this.data
      .filter((s) => s.itemId === itemId)
      .sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));
  }

  async addStock(itemId, quantity, cost, purchaseDate = new Date()) {
    const stockData = {
      itemId,
      quantity: parseInt(quantity),
      remaining: parseInt(quantity),
      cost: parseFloat(cost),
      purchaseDate: purchaseDate.toISOString(),
      createdAt: new Date().toISOString(),
    };

    return await this.add(stockData);
  }

  async reduceStock(itemId, quantityToReduce, reason = "adjustment") {
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

  getTotalRemaining(itemId) {
    return this.data
      .filter((s) => s.itemId === itemId)
      .reduce((sum, s) => sum + s.remaining, 0);
  }
}

export const stocksCollection = new StocksCollection();
