import { categoriesCollection } from "./collections/categories.js";
import { itemsCollection } from "./collections/items.js";

class DataStore {
  constructor() {
    this.collections = {
      categories: categoriesCollection,
      items: itemsCollection,
    };
  }

  // Convenient getters
  get categories() {
    return this.collections.categories;
  }
  get inventory() {
    return this.collections.items;
  }

  // Initialize all collections
  async init() {
    console.log("Initializing data store...");
    // Only fetch critical data on init
    // Other data loads on-demand
  }

  // Start real-time listeners for all collections
  startListening() {
    Object.values(this.collections).forEach((collection) => {
      collection.listen();
    });
  }

  // Stop all listeners
  stopListening() {
    Object.values(this.collections).forEach((collection) => {
      collection.stopListening();
    });
  }

  // Cleanup everything
  cleanup() {
    Object.values(this.collections).forEach((collection) => {
      collection.cleanup();
    });
  }
}

export const dataStore = new DataStore();
