// pages/InventoryPage.js
import QuickStats from "../components/QuickStats.js";

export default function InventoryPage() {
  const main = document.createElement("main");
  main.className = "container";

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

  return main;
}
