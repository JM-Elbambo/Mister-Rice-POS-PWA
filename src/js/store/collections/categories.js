import { BaseCollection } from "./baseCollection.js";

class CategoriesCollection extends BaseCollection {
  constructor() {
    super("categories");
    this.idNameMap = new Map();
  }

  // Override fetch to sort categories by name
  async fetch() {
    await super.fetch();

    this.data.sort((a, b) => a.name.localeCompare(b.name));
    return this.data;
  }

  // TODO: Use this as persistent listener instead of subscribing to changes manually
  syncIdNameMap() {
    this.idNameMap = new Map(this.data.map((cat) => [cat.id, cat.name]));
  }

  // Get all category names as array
  getNames() {
    return this.data.map((category) => category.name);
  }

  // Get category by name (case-insensitive)
  getByName(name) {
    return this.data.find(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    );
  }

  // Check if category exists
  exists(name) {
    return this.getByName(name) !== undefined;
  }

  // Get categories for dropdown options
  getOptions() {
    return [
      { value: "Uncategorized", label: "Uncategorized" },
      ...this.data.map((category) => ({
        value: category.name,
        label: category.name,
      })),
    ];
  }

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

  async deleteCategory(id) {
    await this.delete(id);
  }
}

export const categoriesCollection = new CategoriesCollection();
