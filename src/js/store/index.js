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

  get inventory() {
    return this.collections.items;
  }

  get stocks() {
    return this.collections.stocks;
  }

  async init() {
    console.log("Initializing data store...");
  }

  startListening() {
    Object.values(this.collections).forEach((collection) => {
      collection.listen();
    });
  }

  stopListening() {
    Object.values(this.collections).forEach((collection) => {
      collection.stopListening();
    });
  }

  cleanup() {
    Object.values(this.collections).forEach((collection) => {
      collection.cleanup();
    });
  }
}

export const dataStore = new DataStore();
