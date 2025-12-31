import { BaseCollection } from "./baseCollection.js";

class ItemsCollection extends BaseCollection {
  constructor() {
    super("items");
  }

  // Get item by name (case-insensitive)
  getByName(name) {
    return this.data.find(
      (item) => item.name.toLowerCase() === name.toLowerCase(),
    );
  }

  getBySku(sku) {
    if (!sku) return undefined;
    return this.data.find((item) => item.sku === sku);
  }

  nameExists(name) {
    return this.getByName(name) !== undefined;
  }

  SkuExists(sku) {
    if (!sku) return false;
    return this.getBySku(sku) !== undefined;
  }

  async addProduct(productData) {
    const trimmedName = productData.name.trim();
    const trimmedSku = productData.sku?.trim() || "";

    if (!trimmedName) {
      throw new Error("Product name cannot be empty.");
    }

    if (this.nameExists(trimmedName)) {
      throw new Error("Product name already exists.");
    }

    if (trimmedSku && this.SkuExists(trimmedSku)) {
      throw new Error("SKU already exists.");
    }

    const processedData = {
      ...productData,
      name: trimmedName,
      sku: trimmedSku,
      price: parseFloat(productData.price) || 0,
      minStock: parseFloat(productData.minStock) || 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.add(processedData);
  }

  async updateProduct(id, updates) {
    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim();
      if (!trimmedName) {
        throw new Error("Name cannot be empty.");
      }
      const existing = this.getByName(trimmedName);
      if (existing && existing.id !== id) {
        throw new Error("Name already exists.");
      }
      updates.name = trimmedName;
    }

    if (updates.sku !== undefined) {
      const trimmedSku = updates.sku?.trim() || "";
      if (trimmedSku) {
        const existing = this.getBySku(trimmedSku);
        if (existing && existing.id !== id) {
          throw new Error("SKU already exists.");
        }
      }
      updates.sku = trimmedSku;
    }

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
