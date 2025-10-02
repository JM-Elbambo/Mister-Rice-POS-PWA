import { BaseCollection } from "./baseCollection.js";

class ItemsCollection extends BaseCollection {
  constructor() {
    super("items");
  }

  processData(rawData) {
    return rawData.map((item) => ({
      ...item,
      price: parseFloat(item.price) || 0,
      totalStock: parseFloat(item.totalStock) || 0,
      minStock: parseFloat(item.minStock) || 5,
    }));
  }

  async fetch() {
    await super.fetch();
    this.data = this.processData(this.data);
    this.notify();
    return this.data;
  }

  async addProduct(productData) {
    const processedData = {
      ...productData,
      price: parseFloat(productData.price) || 0,
      totalStock: 0, // Always start at 0
      minStock: parseFloat(productData.minStock) || 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.add(processedData);
  }

  // Sync totalStock from stocks collection
  async syncTotalStock(id, newStock) {
    await this.update(id, {
      totalStock: newStock,
      lastUpdated: new Date().toISOString(),
    });
  }

  async updateProduct(id, updates) {
    const processedUpdates = {
      ...updates,
      price:
        updates.price !== undefined
          ? parseFloat(updates.price) || 0
          : undefined,
      minStock:
        updates.minStock !== undefined
          ? parseFloat(updates.minStock) || 5
          : undefined,
      lastUpdated: new Date().toISOString(),
    };

    // Remove totalStock from updates - managed by stocks collection
    delete processedUpdates.totalStock;

    await this.update(id, processedUpdates);
  }
}

export const itemsCollection = new ItemsCollection();
