import { dataStore } from "../store/index.js";
import QuickStats from "../components/QuickStats.js";
import Table from "../components/Table.js";
import Pagination from "../components/Pagination.js";
import TableFilter from "../components/TableFilter.js";
import AddItemModal from "../components/modals/item/AddItemModal.js";
import ViewItemModal from "../components/modals/item/ViewItemModal.js";
import EditItemModal from "../components/modals/item/EditItemModal.js";
import ManageStockModal from "../components/modals/item/ManageStockModal.js";
import toastManager from "../components/ToastManager.js";

export default function InventoryPage() {
  const main = document.createElement("main");
  main.className = "container mb-4";

  const statsContainer = document.createElement("div");
  const addButtonContainer = document.createElement("div");
  addButtonContainer.className = "d-flex justify-content-end mb-3";
  const filtersContainer = document.createElement("div");
  const tableContainer = document.createElement("div");
  const paginationContainer = document.createElement("div");
  paginationContainer.className =
    "d-flex justify-content-between align-items-center mt-3";

  main.appendChild(statsContainer);
  main.appendChild(addButtonContainer);
  main.appendChild(filtersContainer);
  main.appendChild(tableContainer);
  main.appendChild(paginationContainer);

  let filteredData = [];
  let appliedFilters = { search: "", filters: {}, sort: "name" };
  let currentPage = 1;
  let unsubscribeItems = null;
  let unsubscribeCategories = null;
  let unsubscribeStocks = null;
  let initialized = false;

  const itemsPerPage = 10;
  const headers = [
    "Product Name",
    "Category",
    "Price",
    "Stock",
    "Min Stock",
    "Status",
  ];
  const actions = [
    {
      label: "View",
      onClick: showViewItemModal,
      className: "btn-outline-primary btn-sm",
    },
    {
      label: "Edit",
      onClick: showEditItemModal,
      className: "btn-outline-secondary btn-sm",
    },
    {
      label: "Stock",
      onClick: showManageStockModal,
      className: "btn-outline-success btn-sm",
    },
  ];

  async function init() {
    try {
      showLoadingState();

      unsubscribeItems = dataStore.items.subscribe((data, loading, error) => {
        if (error) return showErrorState(error);
        if (loading) return;
        updateData();
      });

      unsubscribeCategories = dataStore.categories.subscribe(
        (data, loading, error) => {
          if (error) return showErrorState(error);
          if (loading) return;
          dataStore.categories.syncIdNameMap();
          updateData();
        },
      );

      unsubscribeStocks = dataStore.stocks.subscribe((data, loading, error) => {
        if (error) return showErrorState(error);
        if (loading) return;
        dataStore.stocks.syncItemTotals();
        updateData();
      });

      dataStore.items.listen();
      dataStore.categories.listen();
      dataStore.stocks.listen();

      await Promise.all([
        dataStore.categories.fetch(),
        dataStore.items.fetch(),
        dataStore.stocks.fetch(),
      ]);
      initialized = true;
      updateData();
    } catch (error) {
      showErrorState(error);
    }
  }

  function updateData() {
    if (!initialized) return;
    if (dataStore.items.data.length >= 0) {
      const mappedData = dataStore.items.data.map((item) => ({
        ...item,
        categoryName:
          dataStore.categories.idNameMap.get(item.category) ?? "Uncategorized",
        totalStock: dataStore.stocks.itemTotals.get(item.id) ?? 0,
      }));
      filteredData = applyFilters(mappedData, appliedFilters);
    }
    renderAll();
  }

  function showLoadingState() {
    main.innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="height: 400px;">
        <div class="text-center">
          <div class="spinner-border text-primary"></div>
          <p class="mt-3 text-muted">Loading inventory...</p>
        </div>
      </div>
    `;
  }

  function showErrorState(error) {
    main.innerHTML = `
      <div class="alert alert-danger text-center">
        <h4>Error Loading Inventory</h4>
        <p>${error?.message || "Unknown error"}</p>
        <button class="btn btn-outline-danger" onclick="location.reload()">Retry</button>
      </div>
    `;
  }

  function renderAll() {
    if (!main.contains(addButtonContainer)) {
      main.innerHTML = "";
      main.appendChild(statsContainer);
      main.appendChild(addButtonContainer);
      main.appendChild(filtersContainer);
      main.appendChild(tableContainer);
      main.appendChild(paginationContainer);
    }

    renderStats();
    renderAddButton();
    renderFilters();
    renderTable();
    renderPagination();
  }

  function renderStats() {
    const total = filteredData.length;
    const original = dataStore.items.data.length;
    const inStock = filteredData.filter(
      (item) => getStatus(item) === "In Stock",
    ).length;
    const lowStock = filteredData.filter(
      (item) => getStatus(item) === "Low Stock",
    ).length;
    const outStock = filteredData.filter(
      (item) => getStatus(item) === "Out of Stock",
    ).length;

    const stats = [
      {
        title: total === original ? "All Products" : "Filtered Products",
        value: total,
        bgClass: "bg-primary",
        textClass: "text-white",
        icon: "bi-box-seam",
      },
      {
        title: "In Stock",
        value: inStock,
        bgClass: "bg-success",
        textClass: "text-white",
        icon: "bi-check-circle",
      },
      {
        title: "Low Stock",
        value: lowStock,
        bgClass: "bg-warning",
        textClass: "text-dark",
        icon: "bi-exclamation-triangle",
      },
      {
        title: "Out of Stock",
        value: outStock,
        bgClass: "bg-danger",
        textClass: "text-white",
        icon: "bi-x-circle",
      },
    ];

    statsContainer.innerHTML = "";
    statsContainer.appendChild(QuickStats(stats));
  }

  function renderAddButton() {
    addButtonContainer.innerHTML = "";
    const btn = document.createElement("button");
    btn.className = "btn btn-primary";
    btn.innerHTML = '<i class="bi bi-plus-lg me-2"></i>Add Product';
    btn.onclick = showAddItemModal;
    addButtonContainer.appendChild(btn);
  }

  function renderFilters() {
    const categoryOptions = dataStore.categories.getOptions();

    filtersContainer.innerHTML = "";
    filtersContainer.appendChild(
      TableFilter({
        searchPlaceholder: "Search products...",
        filters: [
          { id: "category", label: "All Categories", options: categoryOptions },
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
        onFilter: handleFilterChange,
        initialValues: appliedFilters,
      }),
    );
  }

  function renderTable() {
    const start = (currentPage - 1) * itemsPerPage;
    const pageData = filteredData.slice(start, start + itemsPerPage);

    const rows = pageData.map((item) => ({
      data: [
        item.name,
        item.categoryName,
        `$${parseFloat(item.price || 0).toFixed(2)}`,
        item.totalStock,
        item.minStock,
        getStatus(item),
      ],
      original: item,
    }));

    const formatters = {
      1: (barcode) => `<code class="text-muted">${barcode}</code>`,
      5: (status) =>
        `<span class="badge bg-${getStatusColor(status)}">${status}</span>`,
    };

    tableContainer.innerHTML = "";
    tableContainer.appendChild(
      Table(
        headers,
        rows.map((row) => row.data),
        actions.map((action) => ({
          ...action,
          onClick: (rowData, rowIndex) => {
            const item = rows[rowIndex]?.original;
            if (item) action.onClick(item);
          },
        })),
        formatters,
      ),
    );
  }

  function renderPagination() {
    paginationContainer.innerHTML = "";
    if (filteredData.length <= itemsPerPage) return;

    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(start + itemsPerPage - 1, filteredData.length);

    const summary = document.createElement("div");
    summary.className = "text-muted small";
    summary.textContent = `${start}-${end} of ${filteredData.length}`;

    const pagination = Pagination({
      totalItems: filteredData.length,
      itemsPerPage,
      onPageChange: (page) => {
        currentPage = page;
        renderTable();
      },
    });

    paginationContainer.appendChild(summary);
    paginationContainer.appendChild(pagination);
  }

  function applyFilters(data, { search, filters, sort }) {
    let result = [...data];

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(term) ||
          item.categoryName?.toLowerCase().includes(term) ||
          item.barcode?.toLowerCase().includes(term),
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (key === "category") {
          result = result.filter((item) => item.categoryName === value);
        } else if (key === "status") {
          result = result.filter((item) => getStatus(item) === value);
        } else {
          result = result.filter((item) => item[key] === value);
        }
      }
    });

    if (sort) {
      result.sort((a, b) => {
        switch (sort) {
          case "price":
            return parseFloat(a.price || 0) - parseFloat(b.price || 0);
          case "price_desc":
            return parseFloat(b.price || 0) - parseFloat(a.price || 0);
          case "totalStock":
            return (a.totalStock || 0) - (b.totalStock || 0);
          case "stock_desc":
            return (b.totalStock || 0) - (a.totalStock || 0);
          case "category":
            return (a.categoryName || "").localeCompare(b.categoryName || "");
          case "name_desc":
            return (b.name || "").localeCompare(a.name || "");
          case "name":
          default:
            return (a.name || "").localeCompare(b.name || "");
        }
      });
    }

    return result;
  }

  function handleFilterChange(newFilters) {
    appliedFilters = newFilters;
    currentPage = 1;
    updateData();
  }

  async function showAddItemModal() {
    AddItemModal.show(dataStore.categories.data, async (newItem) => {
      try {
        await dataStore.items.addProduct(newItem);
        toastManager.showSuccess("Product added successfully");
      } catch (error) {
        toastManager.showError("Failed to add product");
        throw error;
      }
    });
  }

  async function showViewItemModal(item) {
    ViewItemModal.show(item, showEditItemModal, showManageStockModal);
  }

  async function showEditItemModal(item) {
    EditItemModal.show(
      item,
      dataStore.categories.data,
      async (itemId, updatedData) => {
        try {
          await dataStore.items.updateProduct(itemId, updatedData);
          toastManager.showSuccess("Product updated successfully");
        } catch (error) {
          toastManager.showError("Failed to update product");
          throw error;
        }
      },
    );
  }

  async function showManageStockModal(item) {
    ManageStockModal.show(item, async (item, data) => {
      try {
        if (data.isStockIn === true) {
          await dataStore.stocks.addStock(
            item.id,
            data.quantity,
            data.cost,
            data.purchaseDate,
          );
          toastManager.showSuccess(
            `Added ${data.quantity} units to ${item.name}`,
          );
        } else {
          await dataStore.stocks.reduceStock(
            item.id,
            data.quantity,
            // data.reason
          );
          toastManager.showSuccess(
            `Reduced ${data.quantity} units from ${item.name}`,
          );
        }
      } catch (error) {
        toastManager.showError(error.message || "Failed to update totalStock");
        throw error;
      }
    });
  }

  function getStatus(item) {
    if (item.totalStock > item.minStock) return "In Stock";
    if (item.totalStock > 0 && item.totalStock <= item.minStock)
      return "Low Stock";
    return "Out of Stock";
  }

  function getStatusColor(status) {
    const colors = {
      "In Stock": "success",
      "Low Stock": "warning",
      "Out of Stock": "danger",
    };
    return colors[status] || "secondary";
  }

  function cleanup() {
    if (unsubscribeItems) unsubscribeItems();
    if (unsubscribeCategories) unsubscribeCategories();
    if (unsubscribeStocks) unsubscribeStocks();
    dataStore.items.stopListening();
    dataStore.categories.stopListening();
    dataStore.stocks.stopListening();
  }

  window.addEventListener("beforeunload", cleanup);
  init();
  return main;
}
