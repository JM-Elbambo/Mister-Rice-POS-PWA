import { db } from "../firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { categoriesCollection } from "./collections/categories.js";
import { itemsCollection } from "./collections/items.js";
import { stocksCollection } from "./collections/stocks.js";

class DataStore {
  constructor() {
    this.collections = {
      categories: categoriesCollection,
      items: itemsCollection,
      stocks: stocksCollection,
    };
  }

  get categories() {
    return this.collections.categories;
  }

  get items() {
    return this.collections.items;
  }

  get stocks() {
    return this.collections.stocks;
  }

  async init() {
    console.log("Initializing data store...");
  }

  async checkAccess() {
    try {
      // Check access by retrieving a test document
      const testDocRef = doc(db, "_accessCheck/ping");
      await getDoc(testDocRef);
      return true;
    } catch (error) {
      if (error.code === "permission-denied") {
        return false;
      }
      return false; // other errors (e.g., network)
    }
  }
}

export const dataStore = new DataStore();
