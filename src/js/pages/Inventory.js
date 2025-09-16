import QuickStats from "../components/QuickStats.js";
import Table from "../components/Table.js";
import Pagination from "../components/Pagination.js";
import TableFilter from "../components/TableFilter.js";

export default function InventoryPage() {
  const main = document.createElement("main");
  main.className = "container";

  // --- Sample inventory data ---
  const originalData = Array.from({ length: 100 }, (_, i) => {
    const categories = ["Electronics", "Clothing", "Food", "Books", "Sports"];
    const statuses = ["In Stock", "Low Stock", "Out of Stock"];
    const stock = Math.floor(Math.random() * 50);
    const minStock = Math.floor(Math.random() * 10) + 5;

    return {
      id: i + 1,
      name: `Product ${i + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      barcode: `BC${String(i + 1).padStart(6, "0")}`,
      price: (Math.random() * 100 + 10).toFixed(2),
      stock,
      minStock,
      status:
        stock === 0
          ? "Out of Stock"
          : stock <= minStock
          ? "Low Stock"
          : "In Stock",
    };
  });

  let filteredData = [...originalData];

  // --- Quick Stats ---
  function updateStats() {
    const totalProducts = filteredData.length;
    const inStock = filteredData.filter(
      (item) => item.status === "In Stock"
    ).length;
    const lowStock = filteredData.filter(
      (item) => item.status === "Low Stock"
    ).length;
    const outOfStock = filteredData.filter(
      (item) => item.status === "Out of Stock"
    ).length;

    const stats = [
      {
        title: "Total Products",
        value: totalProducts,
        id: "totalProducts",
        bgClass: "bg-primary",
        textClass: "text-white",
        icon: "bi-box-seam",
      },
      {
        title: "In Stock",
        value: inStock,
        id: "inStockCount",
        bgClass: "bg-success",
        textClass: "text-white",
        icon: "bi-check-circle",
      },
      {
        title: "Low Stock",
        value: lowStock,
        id: "lowStockCount",
        bgClass: "bg-warning",
        textClass: "text-dark",
        icon: "bi-exclamation-triangle",
      },
      {
        title: "Out of Stock",
        value: outOfStock,
        id: "outOfStockCount",
        bgClass: "bg-danger",
        textClass: "text-white",
        icon: "bi-x-circle",
      },
    ];

    return QuickStats(stats);
  }

  let statsComponent = updateStats();
  main.appendChild(statsComponent);

  // --- Filters ---
  const filter = TableFilter({
    searchPlaceholder: "Search products...",
    filters: [
      {
        id: "category",
        label: "All Categories",
        options: [
          { value: "Electronics", label: "Electronics" },
          { value: "Clothing", label: "Clothing" },
          { value: "Food", label: "Food" },
          { value: "Books", label: "Books" },
          { value: "Sports", label: "Sports" },
        ],
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
      { value: "name", label: "Sort by Name" },
      { value: "price", label: "Sort by Price" },
      { value: "stock", label: "Sort by Stock" },
      { value: "category", label: "Sort by Category" },
    ],
    onFilter: handleFilterChange,
  });

  main.appendChild(filter);

  // --- Table and Pagination ---
  const headers = [
    "Product Name",
    "Category",
    "Barcode",
    "Price",
    "Stock Qty",
    "Min Stock",
    "Status",
  ];
  const itemsPerPage = 10;
  let currentTable;
  let paginationWrapper;
  let paginationEl;

  const actions = [
    { label: "View", onClick: (row) => alert(`Viewing ${row[0]}`) },
    { label: "Edit", onClick: (row) => alert(`Editing ${row[0]}`) },
    { label: "Delete", onClick: (row) => alert(`Deleting ${row[0]}`) },
  ];

  function applyFilters(data, { search, filters, sort }) {
    let result = [...data];

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower) ||
          item.barcode.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((item) => item[key] === value);
      }
    });

    // Apply sorting
    if (sort) {
      result.sort((a, b) => {
        switch (sort) {
          case "price":
            return parseFloat(a.price) - parseFloat(b.price);
          case "stock":
            return a.stock - b.stock;
          case "category":
            return a.category.localeCompare(b.category);
          case "name":
          default:
            return a.name.localeCompare(b.name);
        }
      });
    }

    return result;
  }

  function handleFilterChange(filterData) {
    filteredData = applyFilters(originalData, filterData);

    // Update stats
    const newStats = updateStats();
    main.replaceChild(newStats, statsComponent);
    statsComponent = newStats;

    // Update pagination
    updatePagination();

    // Reset to page 1 or render current page
    if (paginationEl.getCurrentPage() > 1) {
      paginationEl.goToPage(1);
    } else {
      renderPage(1);
    }
  }

  function updatePagination() {
    if (paginationWrapper) paginationWrapper.remove();

    paginationWrapper = document.createElement("div");
    paginationWrapper.className = "d-flex justify-content-end";

    paginationEl = Pagination({
      totalItems: filteredData.length,
      itemsPerPage,
      onPageChange: renderPage,
    });

    paginationWrapper.appendChild(paginationEl);
    main.appendChild(paginationWrapper);
  }

  function renderPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);

    // Convert data to table format
    const rows = pageData.map((item) => [
      item.name,
      item.category,
      item.barcode,
      item.price,
      item.stock,
      item.minStock,
      item.status,
    ]);

    // Define column formatters
    const formatters = {
      2: (barcode) => `<code class="text-muted small">${barcode}</code>`, // Barcode column
      6: (status) =>
        `<span class="badge bg-${getStatusColor(status)}">${status}</span>`, // Status column
    };

    if (currentTable) currentTable.remove();
    currentTable = Table(headers, rows, actions, formatters);
    main.insertBefore(currentTable, paginationWrapper);
  }

  function getStatusColor(status) {
    switch (status) {
      case "In Stock":
        return "success";
      case "Low Stock":
        return "warning";
      case "Out of Stock":
        return "danger";
      default:
        return "secondary";
    }
  }

  // Initial render
  updatePagination();
  renderPage(1);

  return main;
}
