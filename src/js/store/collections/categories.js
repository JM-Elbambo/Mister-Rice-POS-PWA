import { BaseCollection } from "./baseCollection.js";

class CategoriesCollection extends BaseCollection {
  constructor() {
    super("categories");
  }

  // Process data after fetching - just clean names and sort
  processData(rawData) {
    return rawData
      .map((item) => ({
        ...item,
        name: (item.name || "").trim(),
      }))
      .filter((item) => item.name) // Remove empty names
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // Override fetch to include processing
  async fetch() {
    const data = await super.fetch();
    this.data = this.processData(this.data);
    this.notify();
    return this.data;
  }

  // Get all category names as array
  getNames() {
    return this.data.map((category) => category.name);
  }

  // Get category by name (case-insensitive)
  getByName(name) {
    return this.data.find(
      (category) => category.name.toLowerCase() === name.toLowerCase()
    );
  }

  // Check if category exists
  exists(name) {
    return this.getByName(name) !== undefined;
  }

  // Get categories for dropdown options
  getOptions() {
    return this.data.map((category) => ({
      value: category.name,
      label: category.name,
    }));
  }

  // Add new category
  async addCategory(name) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new Error("Category name cannot be empty");
    }

    if (this.exists(trimmedName)) {
      throw new Error("Category already exists");
    }

    return await this.add({ name: trimmedName });
  }

  // Update category name
  async updateCategory(id, newName) {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      throw new Error("Category name cannot be empty");
    }

    const existing = this.getByName(trimmedName);
    if (existing && existing.id !== id) {
      throw new Error("Category name already exists");
    }

    await this.update(id, { name: trimmedName });
  }

  // Delete category
  async deleteCategory(id) {
    await this.delete(id);
  }
}

export const categoriesCollection = new CategoriesCollection();
