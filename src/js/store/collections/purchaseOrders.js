import { BaseCollection } from "./baseCollection.js";
import { query, collection, orderBy } from "firebase/firestore";
import { db } from "../../firebase.js";

class PurchaseOrdersCollection extends BaseCollection {
  constructor() {
    super("purchaseOrders");

    this.query = query(
      collection(db, this.collectionName),
      orderBy("purchaseDate", "desc"),
    );
  }

  async addPurchaseOrder(purchaseDate, supplier) {
    return await this.add({
      purchaseDate: purchaseDate,
      supplier: supplier || null,
    });
  }
}

export const purchaseOrdersCollection = new PurchaseOrdersCollection();
