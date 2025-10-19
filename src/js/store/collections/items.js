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

  getByBarcode(barcode) {
    if (!barcode) return undefined;
    return this.data.find((item) => item.barcode === barcode);
  }

  nameExists(name) {
    return this.getByName(name) !== undefined;
  }

  barcodeExists(barcode) {
    if (!barcode) return false;
    return this.getByBarcode(barcode) !== undefined;
  }

  async addProduct(productData) {
    const trimmedName = productData.name.trim();
    const trimmedBarcode = productData.barcode?.trim() || "";

    if (!trimmedName) {
      throw new Error("Product name cannot be empty.");
    }

    if (this.nameExists(trimmedName)) {
      throw new Error("Product name already exists.");
    }

    if (trimmedBarcode && this.barcodeExists(trimmedBarcode)) {
      throw new Error("Barcode already exists.");
    }

    const processedData = {
      ...productData,
      name: trimmedName,
      barcode: trimmedBarcode,
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

    if (updates.barcode !== undefined) {
      const trimmedBarcode = updates.barcode?.trim() || "";
      if (trimmedBarcode) {
        const existing = this.getByBarcode(trimmedBarcode);
        if (existing && existing.id !== id) {
          throw new Error("Barcode already exists.");
        }
      }
      updates.barcode = trimmedBarcode;
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
