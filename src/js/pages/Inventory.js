import BasePage from "../components/BasePage.js";
import { dataStore } from "../store/index.js";
import QuickStats from "../components/QuickStats.js";
import Table from "../components/Table.js";
import Pagination from "../components/Pagination.js";
import TableFilter from "../components/TableFilter.js";
import CategoriesModal from "../components/modals/CategoriesModal.js";
import AddItemModal from "../components/modals/item/AddItemModal.js";
import ViewItemModal from "../components/modals/item/ViewItemModal.js";
import EditItemModal from "../components/modals/item/EditItemModal.js";
import AdjustStockModal from "../components/modals/item/AdjustStockModal.js";

export default function InventoryPage() {
  const page = new Inventory();
  return page.getElement();
}

class Inventory extends BasePage {
  constructor() {
    super();
    this.filteredData = [];
    this.filters = { search: "", filters: {}, sort: "name" };
    this.page = 1;
    this.perPage = 10;

    this.statsEl = document.createElement("div");
    this.btnsEl = document.createElement("div");
    this.btnsEl.className = "d-flex justify-content-end mb-3";
    this.filtersEl = document.createElement("div");
    this.tableEl = document.createElement("div");
    this.paginationEl = document.createElement("div");
    this.paginationEl.className =
      "d-flex justify-content-between align-items-center mt-3";

    this.init();
  }

  async init() {
    try {
      await this.initCollections([
        { collection: dataStore.items, callback: () => this.update() },
        { collection: dataStore.categories, callback: () => this.update() },
        { collection: dataStore.stocks, callback: () => this.update() },
      ]);

      this.update();
    } catch (error) {
      // Handled by initCollections
    }
  }

  update(skipFilters = false) {
    if (!this.initialized) return;

    const items = dataStore.items.data.map((item) => ({
      ...item,
      categoryName: dataStore.categories.idNameMap.get(item.category) ?? "None",
      totalStock: dataStore.stocks.getItemTotal(item.id),
    }));

    this.filteredData = this.applyFilters(items, this.filters);
    this.render(skipFilters);
  }

  render(skipFilters = false) {
    // Only append containers on first render
    if (!this.container.contains(this.statsEl)) {
      this.container.innerHTML = "";
      this.container.append(
        this.statsEl,
        this.btnsEl,
        this.filtersEl,
        this.tableEl,
        this.paginationEl,
      );
    }

    this.renderStats();
    this.renderButtons();
    if (!skipFilters) this.renderFilters();
    this.renderTable();
    this.renderPagination();
  }

  renderStats() {
    const total = this.filteredData.length;
    const original = dataStore.items.data.length;
    const counts = ["In Stock", "Low Stock", "Out of Stock"].map(
      (status) =>
        this.filteredData.filter((item) => this.getStatus(item) === status)
          .length,
    );

    this.statsEl.innerHTML = "";
    this.statsEl.appendChild(
      QuickStats([
        {
          title: total === original ? "All Products" : "Filtered Products",
          value: total,
          bgClass: "bg-primary",
          textClass: "text-white",
          icon: "bi-box-seam",
        },
        {
          title: "In Stock",
          value: counts[0],
          bgClass: "bg-success",
          textClass: "text-white",
          icon: "bi-check-circle",
        },
        {
          title: "Low Stock",
          value: counts[1],
          bgClass: "bg-warning",
          textClass: "text-dark",
          icon: "bi-exclamation-triangle",
        },
        {
          title: "Out of Stock",
          value: counts[2],
          bgClass: "bg-danger",
          textClass: "text-white",
          icon: "bi-x-circle",
        },
      ]),
    );
  }

  renderButtons() {
    this.btnsEl.innerHTML = `
      <button class="btn btn-outline-primary bg-body me-2" id="manageCategoriesBtn">
        <i class="bi bi-tags me-2"></i>Manage Categories
      </button>
      <button class="btn btn-outline-primary bg-body" id="addProductBtn">
        <i class="bi bi-plus-lg me-2"></i>Add Product
      </button>
    `;

    this.btnsEl.querySelector("#manageCategoriesBtn").onclick = () =>
      this.showCategoriesModal();
    this.btnsEl.querySelector("#addProductBtn").onclick = () =>
      this.showAddModal();
  }

  renderFilters() {
    this.filtersEl.innerHTML = "";
    this.filtersEl.appendChild(
      TableFilter({
        searchPlaceholder: "Search products...",
        filters: [
          {
            id: "category",
            label: "All Categories",
            options: dataStore.categories.getOptions(),
          },
          {
            id: "status",
            label: "All Status",
            options: [
              { value: "In Stock", label: "In Stock" },
              { value: "Low Stock", label: "Low Stock" },
              { value: "Out of Stock", label: "Out of Stock" },
            ],
          },
        ],
        sortOptions: [
          { value: "name", label: "Name (A-Z)" },
          { value: "name_desc", label: "Name (Z-A)" },
          { value: "price", label: "Price (Low-High)" },
          { value: "price_desc", label: "Price (High-Low)" },
          { value: "totalStock", label: "Stock (Low-High)" },
          { value: "stock_desc", label: "Stock (High-Low)" },
        ],
        onFilter: (f) => {
          this.filters = f;
          this.page = 1;
          this.update(true); // Skip filter re-render
        },
        initialValues: this.filters,
      }),
    );
  }

  renderTable() {
    const start = (this.page - 1) * this.perPage;
    const pageData = this.filteredData.slice(start, start + this.perPage);

    const rows = pageData.map((item) => [
      item.name,
      item.categoryName,
      `₱${parseFloat(item.price || 0).toFixed(2)}`,
      item.totalStock,
      this.getStatus(item),
    ]);

    const actions = [
      {
        label: "View Details",
        onClick: (_, i) => this.showViewModal(pageData[i]),
      },
      {
        label: "Edit Product",
        onClick: (_, i) => this.showEditModal(pageData[i]),
      },
      {
        label: "Adjust Stock",
        onClick: (_, i) => this.showAdjustModal(pageData[i]),
      },
    ];

    const formatters = {
      4: (status) =>
        `<span class="badge bg-${this.getStatusColor(status)}">${status}</span>`,
    };

    this.tableEl.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "table-responsive";
    wrapper.style.overflow = "visible";
    wrapper.appendChild(
      Table(
        ["Product Name", "Category", "Price", "Stock", "Status"],
        rows,
        actions,
        formatters,
      ),
    );

    this.tableEl.appendChild(wrapper);
  }

  renderPagination() {
    this.paginationEl.innerHTML = "";
    if (this.filteredData.length <= this.perPage) return;

    const start = (this.page - 1) * this.perPage + 1;
    const end = Math.min(start + this.perPage - 1, this.filteredData.length);

    const summary = document.createElement("div");
    summary.className = "text-muted small";
    summary.textContent = `${start}-${end} of ${this.filteredData.length}`;

    this.paginationEl.appendChild(summary);
    this.paginationEl.appendChild(
      Pagination({
        totalItems: this.filteredData.length,
        itemsPerPage: this.perPage,
        onPageChange: (p) => {
          this.page = p;
          this.renderTable();
        },
      }),
    );
  }

  applyFilters(data, { search, filters, sort }) {
    let result = [...data];

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(term) ||
          item.categoryName?.toLowerCase().includes(term) ||
          item.sku?.toLowerCase().includes(term),
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (!value) return;
      if (key === "category") {
        result = result.filter((item) => item.categoryName === value);
      } else if (key === "status") {
        result = result.filter((item) => this.getStatus(item) === value);
      }
    });

    if (sort) {
      const [field, desc] = sort.includes("_desc")
        ? [sort.replace("_desc", ""), true]
        : [sort, false];

      result.sort((a, b) => {
        const aVal = field === "price" ? parseFloat(a[field] || 0) : a[field];
        const bVal = field === "price" ? parseFloat(b[field] || 0) : b[field];
        const cmp =
          typeof aVal === "string" ? aVal.localeCompare(bVal) : aVal - bVal;
        return desc ? -cmp : cmp;
      });
    }

    return result;
  }

  showCategoriesModal() {
    CategoriesModal.show(
      this.handleAction(
        (name) => dataStore.categories.addCategory(name),
        (name) => `Category "${name}" added`,
        "Failed to add category",
      ),
      this.handleAction(
        (id, name) => dataStore.categories.updateCategory(id, name),
        (_, name) => `Category "${name}" updated`,
        "Failed to update category",
      ),
      this.handleAction(
        (id) => dataStore.categories.deleteCategory(id),
        (_, name) => `Category "${name}" deleted`,
        "Failed to delete category",
      ),
      () => dataStore.categories.data,
    );
  }

  showAddModal() {
    AddItemModal.show(
      dataStore.categories.data,
      this.handleAction(
        (item) => dataStore.items.addProduct(item),
        (item) => `Product ${item.name} added`,
        "Failed to add product",
      ),
    );
  }

  showViewModal(item) {
    ViewItemModal.show(
      item,
      dataStore.stocks.getAvailableByItem(item.id),
      (i) => this.showEditModal(i),
      (i) => this.showAdjustModal(i),
    );
  }

  showEditModal(item) {
    EditItemModal.show(
      item,
      dataStore.categories.data,
      this.handleAction(
        (id, data) => dataStore.items.updateProduct(id, data),
        () => `Product ${item.name} updated`,
        "Failed to update product",
      ),
    );
  }

  showAdjustModal(item) {
    AdjustStockModal.show(
      item,
      dataStore.stocks.getAvailableByItem(item.id),
      this.handleAction(
        (i, qty, reason) => dataStore.stocks.adjustStock(i.id, qty, reason),
        (_, qty) =>
          `Adjusted ${item.name} by ${qty > 0 ? "+" : ""}${qty} unit(s)`,
        "Failed to adjust stock",
      ),
    );
  }

  getStatus(item) {
    if (item.totalStock > item.minStock) return "In Stock";
    if (item.totalStock > 0) return "Low Stock";
    return "Out of Stock";
  }

  getStatusColor(status) {
    const colors = {
      "In Stock": "success",
      "Low Stock": "warning",
      "Out of Stock": "danger",
    };
    return colors[status] || "secondary";
  }
}
