import QuickStats from "../components/QuickStats.js";
import Table from "../components/Table.js";
import Pagination from "../components/Pagination.js";

export default function InventoryPage() {
  const main = document.createElement("main");
  main.className = "container";

  // --- Quick Stats ---
  const inventoryStats = [
    {
      title: "Total Products",
      value: 24,
      id: "totalProducts",
      bgClass: "bg-primary",
      textClass: "text-white",
      icon: "bi-box-seam",
    },
    {
      title: "In Stock",
      value: 18,
      id: "inStockCount",
      bgClass: "bg-success",
      textClass: "text-white",
      icon: "bi-check-circle",
    },
    {
      title: "Low Stock",
      value: 4,
      id: "lowStockCount",
      bgClass: "bg-warning",
      textClass: "text-dark",
      icon: "bi-exclamation-triangle",
    },
    {
      title: "Out of Stock",
      value: 2,
      id: "outOfStockCount",
      bgClass: "bg-danger",
      textClass: "text-white",
      icon: "bi-x-circle",
    },
  ];

  main.appendChild(QuickStats(inventoryStats));

  // --- Table with Pagination ---
  const headers = ["ID", "Name", "Stock"];
  const data = Array.from({ length: 100 }, (_, i) => [
    i + 1,
    `Product ${i + 1}`,
    Math.floor(Math.random() * 20),
  ]);

  const actions = [
    { label: "View", onClick: (row) => alert(`Viewing ${row[1]}`) },
    { label: "Edit", onClick: (row) => alert(`Editing ${row[1]}`) },
    { label: "Delete", onClick: (row) => alert(`Deleting ${row[1]}`) },
  ];

  const itemsPerPage = 10;
  let currentTable;

  const paginationWrapper = document.createElement("div");
  paginationWrapper.className = "d-flex justify-content-end";

  const paginationEl = Pagination({
    totalItems: data.length,
    itemsPerPage,
    onPageChange: renderPage,
  });

  paginationWrapper.appendChild(paginationEl);
  main.appendChild(paginationWrapper);

  function renderPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const rows = data.slice(start, end);

    if (currentTable) currentTable.remove();

    currentTable = Table(headers, rows, actions);

    // always keep table above pagination
    main.insertBefore(currentTable, paginationWrapper);
  }

  renderPage(1); // initial render

  return main;
}
