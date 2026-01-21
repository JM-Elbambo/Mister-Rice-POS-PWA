import { db } from "../firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { categoriesCollection } from "./collections/categories.js";
import { itemsCollection } from "./collections/items.js";
import { stockBatchesCollection } from "./collections/stockBatches.js";
import { purchaseOrdersCollection } from "./collections/purchaseOrders.js";

class DataStore {
  constructor() {
    this.collections = {
      categories: categoriesCollection,
      items: itemsCollection,
      stockBatches: stockBatchesCollection,
      purchaseOrders: purchaseOrdersCollection,
    };
  }

  get categories() {
    return this.collections.categories;
  }

  get items() {
    return this.collections.items;
  }

  get stockBatches() {
    return this.collections.stockBatches;
  }

  get purchaseOrders() {
    return this.collections.purchaseOrders;
  }

  async init() {
    console.log("Initializing data store...");
  }

  async checkAccess() {
    try {
      const testDocRef = doc(db, "_accessCheck/ping");
      await getDoc(testDocRef);
      return true;
    } catch (error) {
      if (error.code === "permission-denied") {
        return false;
      }
      return false;
    }
  }
}

export const dataStore = new DataStore();
