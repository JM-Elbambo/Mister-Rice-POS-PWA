import { BaseCollection } from "./baseCollection.js";
import { query, collection, orderBy, where, limit } from "firebase/firestore";
import { db } from "../../firebase.js";

class TransactionsCollection extends BaseCollection {
  constructor() {
    super("transactions");
    this._setDefaultQuery();
  }

  _setDefaultQuery(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    this.query = query(
      collection(db, this.collectionName),
      where("createdAt", ">=", since.toISOString()),
      orderBy("createdAt", "desc"),
      limit(500),
    );
  }

  async record({
    cart,
    calcItemTotal,
    subtotal,
    discount,
    total,
    payment,
    change,
  }) {
    return await this.add({
      items: cart.map((i) => ({
        itemId: i.itemId,
        name: i.name,
        qty: i.qty,
        price: i.price,
        discountType: i.discountType,
        discountValue: i.discountValue,
        subtotal: calcItemTotal(i),
      })),
      subtotal,
      discount,
      total,
      payment,
      change,
      itemCount: cart.length,
      unitCount: cart.reduce((s, i) => s + i.qty, 0),
      createdAt: new Date().toISOString(),
    });
  }

  getSummary() {
    return {
      count: this.data.length,
      revenue: this.data.reduce((s, t) => s + (t.total || 0), 0),
      units: this.data.reduce((s, t) => s + (t.unitCount || 0), 0),
      avgOrder: this.data.length
        ? this.data.reduce((s, t) => s + (t.total || 0), 0) / this.data.length
        : 0,
    };
  }
}

export const transactionsCollection = new TransactionsCollection();
