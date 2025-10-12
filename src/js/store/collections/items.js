import { BaseCollection } from "./baseCollection.js";

class ItemsCollection extends BaseCollection {
  constructor() {
    super("items");
  }

  async addProduct(productData) {
    const processedData = {
      ...productData,
      price: parseFloat(productData.price) || 0,
      minStock: parseFloat(productData.minStock) || 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.add(processedData);
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

    await this.update(id, processedUpdates);
  }
}

export const itemsCollection = new ItemsCollection();
