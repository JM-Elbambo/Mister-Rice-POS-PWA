import { BaseCollection } from "./baseCollection.js";

class ItemsCollection extends BaseCollection {
  constructor() {
    super("items");
  }

  // Custom items-specific methods
  processData(rawData) {
    return rawData.map((item) => ({
      ...item,
      price: parseFloat(item.price) || 0,
      stock: parseInt(item.stock) || 0,
      minStock: parseInt(item.minStock) || 5,
      status: this.calculateStatus(item.stock, item.minStock),
    }));
  }

  calculateStatus(stock, minStock) {
    if (stock === 0) return "Out of Stock";
    if (stock <= minStock) return "Low Stock";
    return "In Stock";
  }

  async fetch() {
    const data = await super.fetch();
    console.log(data);
    this.data = this.processData(this.data);

    this.notify();
    return this.data;
  }

  // Custom queries
  getLowStockItems() {
    return this.data.filter((item) => item.status === "Low Stock");
  }

  getOutOfStockItems() {
    return this.data.filter((item) => item.status === "Out of Stock");
  }

  getByCategory(category) {
    return this.data.filter((item) => item.category === category);
  }

  searchProducts(searchTerm) {
    const term = searchTerm.toLowerCase();
    return this.data.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.barcode.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
    );
  }

  // Inventory-specific add with validation
  async addProduct(productData) {
    const processedData = {
      ...productData,
      price: parseFloat(productData.price) || 0,
      stock: parseInt(productData.stock) || 0,
      minStock: parseInt(productData.minStock) || 5,
      createdAt: new Date().toISOString(),
    };

    return await this.add(processedData);
  }

  // Update stock levels
  async updateStock(id, newStock) {
    const item = this.data.find((i) => i.id === id);
    if (!item) throw new Error("Product not found");

    const status = this.calculateStatus(newStock, item.minStock);

    await this.update(id, {
      stock: newStock,
      status,
      lastUpdated: new Date().toISOString(),
    });
  }
}

export const itemsCollection = new ItemsCollection();
