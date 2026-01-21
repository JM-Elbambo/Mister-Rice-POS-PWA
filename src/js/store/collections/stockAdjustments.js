import { BaseCollection } from "./baseCollection.js";
import {
  query,
  collection,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase.js";
import { stockBatchesCollection } from "./stockBatches.js";

class StockAdjustmentsCollection extends BaseCollection {
  constructor() {
    super("stockAdjustments");

    this.query = query(
      collection(db, this.collectionName),
      orderBy("createdAt", "desc"),
      limit(100),
    );
  }

  async adjustStock(itemId, quantity, reason) {
    if (quantity === 0) throw new Error("Quantity cannot be zero");

    if (quantity > 0) {
      await stockBatchesCollection.addStock(itemId, quantity);
    } else {
      await stockBatchesCollection.reduceStock(itemId, Math.abs(quantity));
    }

    await this.add({
      itemId: itemId,
      qty: quantity,
      reason: reason,
      createdAt: Timestamp.now(),
    });
  }

  getByItem(itemId) {
    return this.data.filter((adj) => adj.itemId === itemId);
  }
}

export const stockAdjustmentsCollection = new StockAdjustmentsCollection();
