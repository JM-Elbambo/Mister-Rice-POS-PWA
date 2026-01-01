import toastManager from "../../ToastManager.js";
import BaseModal from "../BaseModal.js";

export default class ViewItemModal extends BaseModal {
  constructor(item, stockBatches, onEdit, onAdjustStock) {
    super({ size: "modal-dialog-centered modal-lg" });
    this.item = item;
    this.stockBatches = stockBatches || [];
    this.onEdit = onEdit;
    this.onAdjustStock = onAdjustStock;
    this.activeTab = "info";
  }

  getModalContent() {
    return `
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-box-seam me-2"></i>${this.sanitizeHTML(this.item.name)}
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <ul class="nav nav-tabs mb-3" role="tablist">
          <li class="nav-item">
            <button class="nav-link active" data-tab="info">
              <i class="bi bi-info-circle me-1"></i>Product Info
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" data-tab="stock">
              <i class="bi bi-boxes me-1"></i>Stock
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" data-tab="po">
              <i class="bi bi-list-ul me-1"></i>Purchase Orders
            </button>
          </li>
        </ul>

        <div class="tab-content">
          ${this.getInfoTab()}
          ${this.getStockTab()}
          ${this.getPurchaseOrdersTab()}
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          Close
        </button>
      </div>
    `;
  }

  getInfoTab() {
    return `
      <div data-tab-content="info">
        <table class="table table-borderless">
          <tbody>
            <tr>
              <td class="text-muted" style="width: 140px;">Product Name</td>
              <td class="fw-semibold">${this.sanitizeHTML(this.item.name)}</td>
            </tr>
            <tr>
              <td class="text-muted">SKU</td>
              <td>
                <code class="bg-body-secondary px-2 py-1 rounded">${this.sanitizeHTML(this.item.sku || "N/A")}</code>
                ${this.item.sku ? '<button id="copySkuBtn" class="btn btn-sm btn-outline-secondary ms-2"><i class="bi bi-copy"></i></button>' : ""}
              </td>
            </tr>
            <tr>
              <td class="text-muted">Category</td>
              <td>
                <span class="badge bg-secondary">
                  <i class="bi bi-tag me-1"></i>${this.sanitizeHTML(this.item.categoryName || "Uncategorized")}
                </span>
              </td>
            </tr>
            <tr>
              <td class="text-muted">Selling Price</td>
              <td class="fs-5 text-success fw-semibold">₱${this.formatCurrency(this.item.price)}</td>
            </tr>
            <tr>
              <td class="text-muted">Min. Stock Level</td>
              <td>${this.item.minStock} <small class="text-muted">units</small></td>
            </tr>
          </tbody>
        </table>
        
        <div class="d-grid">
          <button type="button" class="btn btn-outline-primary" id="editBtn">
            <i class="bi bi-pencil me-2"></i>Edit Product
          </button>
        </div>
      </div>
    `;
  }

  getStockTab() {
    const avgCost = this.calculateAvgCost();
    const stockValue = this.item.totalStock * avgCost;
    const status = this.getStatus();

    return `
      <div class="d-none" data-tab-content="stock">
        <div class="row g-3 mb-4 justify-content-center">
          <div class="col-md-5">
            <div class="text-center p-4 bg-body-secondary rounded h-100 d-flex flex-column justify-content-center">
              <div class="text-muted small mb-2">Total Stock</div>
              <div class="h2 mb-0">${this.item.totalStock}</div>
              <small class="text-muted">units</small>
            </div>
          </div>
          <div class="col-md-5">
            <div class="text-center p-4 bg-body-secondary rounded h-100 d-flex flex-column justify-content-center">
              <div class="text-muted small mb-2">Status</div>
              <span class="badge bg-${status.color} fs-6">
                <i class="bi ${status.icon} me-1"></i>${status.label}
              </span>
            </div>
          </div>
        </div>

        <table class="table table-borderless">
          <tbody>
            <tr>
              <td class="text-muted" style="width: 160px;">Avg. Unit Cost</td>
              <td class="fw-semibold">₱${this.formatCurrency(avgCost)}</td>
            </tr>
            <tr>
              <td class="text-muted">Total Stock Value</td>
              <td class="fs-5 text-primary fw-semibold">₱${this.formatCurrency(stockValue)}</td>
            </tr>
            <tr>
              <td class="text-muted">Active Purchase Orders</td>
              <td>${this.stockBatches.length} <small class="text-muted">PO${this.stockBatches.length !== 1 ? "s" : ""}</small></td>
            </tr>
          </tbody>
        </table>

        <button class="btn btn-outline-primary w-100 mt-3" id="adjustStockBtn">
          <i class="bi bi-box-seam me-2"></i>Adjust Stock
        </button>
      </div>
    `;
  }

  getPurchaseOrdersTab() {
    const ordersHtml = this.stockBatches.length
      ? `
        <div class="table-responsive">
          <table class="table table-sm table-hover">
            <thead class="table-light">
              <tr>
                <th>PO Number</th>
                <th class="text-end">Qty Remaining</th>
                <th class="text-end">Unit Cost</th>
                <th>Date Received</th>
              </tr>
            </thead>
            <tbody>
              ${this.stockBatches
                .map(
                  (batch) => `
                <tr>
                  <td><code class="text-muted">${batch.id.slice(0, 8)}</code></td>
                  <td class="text-end">${batch.remaining}</td>
                  <td class="text-end">₱${this.formatCurrency(batch.cost)}</td>
                  <td>${new Date(batch.purchaseDate).toLocaleDateString()}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `
      : '<p class="text-muted text-center py-4">No purchase orders available</p>';

    return `
      <div class="d-none" data-tab-content="po">
        ${ordersHtml}
      </div>
    `;
  }

  calculateAvgCost() {
    if (!this.stockBatches.length) return 0;

    const totalCost = this.stockBatches.reduce(
      (sum, batch) => sum + batch.remaining * batch.cost,
      0,
    );
    const totalQty = this.stockBatches.reduce(
      (sum, batch) => sum + batch.remaining,
      0,
    );

    return totalQty > 0 ? totalCost / totalQty : 0;
  }

  getStatus() {
    if (this.item.totalStock === 0) {
      return { label: "Out of Stock", color: "danger", icon: "bi-x-circle" };
    }
    if (this.item.totalStock <= this.item.minStock) {
      return {
        label: "Low Stock",
        color: "warning",
        icon: "bi-exclamation-triangle",
      };
    }
    return { label: "In Stock", color: "success", icon: "bi-check-circle" };
  }

  attachEventListeners() {
    const tabs = this.modal.querySelectorAll("[data-tab]");
    const contents = this.modal.querySelectorAll("[data-tab-content]");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;
        this.activeTab = target;

        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        contents.forEach((c) => {
          c.classList.toggle("d-none", c.dataset.tabContent !== target);
        });
      });
    });

    const editBtn = this.modal.querySelector("#editBtn");
    editBtn?.addEventListener("click", () => {
      this.hide();
      if (this.onEdit) setTimeout(() => this.onEdit(this.item), 150);
    });

    const adjustStockBtn = this.modal.querySelector("#adjustStockBtn");
    adjustStockBtn?.addEventListener("click", () => {
      this.hide();
      if (this.onAdjustStock)
        setTimeout(() => this.onAdjustStock(this.item), 150);
    });

    const copyBtn = this.modal.querySelector("#copySkuBtn");
    copyBtn?.addEventListener("click", () => {
      navigator.clipboard
        .writeText(this.item.sku)
        .then(() => toastManager.showSuccess("SKU copied!"))
        .catch(() => toastManager.showError("Failed to copy SKU"));
    });
  }

  static show(item, stockBatches, onEdit, onAdjustStock) {
    return new ViewItemModal(item, stockBatches, onEdit, onAdjustStock)
      .create()
      .show();
  }
}
