import { BaseCollection } from "./baseCollection.js";
import {
  collection,
  query,
  where,
  updateDoc,
  doc,
  or,
} from "firebase/firestore";
import { db } from "../../firebase.js";
import { daysAgo } from "../../utils.js";

class StocksCollection extends BaseCollection {
  constructor() {
    super("stocks");

    this.query = query(
      collection(db, this.collectionName),
      or(
        where("remainingQty", ">", 0),
        where("purchaseDate", ">=", daysAgo(90)),
      ),
    );
    this.itemTotals = new Map();
  }

  processData(rawData) {
    this.data = rawData.sort(
      (a, b) => a.purchaseDate.toMillis() - b.purchaseDate.toMillis(),
    );
    this.itemTotals = new Map();

    for (const stock of this.data) {
      if (!stock.itemId) continue;
      const current = this.itemTotals.get(stock.itemId) ?? 0;
      this.itemTotals.set(stock.itemId, current + (stock.remainingQty ?? 0));
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
      supplier,
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
    const batches = this.getAvailableByItem(itemId).sort(
      (a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate),
    ); // Latest first

    if (batches.length === 0) {
      throw new Error("No existing batches found. Cannot add stock.");
    }

    let remainingToAdd = quantityToAdd;
    const updates = [];

    for (const batch of batches) {
      if (remainingToAdd <= 0) break;

      const capacity = batch.receivedQty - batch.remainingQty;
      if (capacity <= 0) continue; // Skip full batches

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

    if (remainingToReduce > 0) {
      throw new Error("Insufficient stock to reduce");
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
    return this.data.filter((s) => s.itemId === itemId);
  }
}

export const stocksCollection = new StocksCollection();
