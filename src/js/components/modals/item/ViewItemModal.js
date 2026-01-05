import toastManager from "../../ToastManager.js";
import BaseModal from "../../BaseModal.js";
import { formatCurrency, timestampToDateString } from "../../../utils.js";

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

        <div class="container-fluid mb-3">

          <div class="row mb-2">
            <div class="col-lg-3 col-5 text-muted">SKU</div>
            <div class="col">
              <code class="bg-body-secondary px-2 py-1 rounded">
                ${this.sanitizeHTML(this.item.sku || "N/A")}
              </code>
              ${this.item.sku ? '<button id="copySkuBtn" class="btn btn-sm btn-outline-secondary ms-2"><i class="bi bi-copy"></i></button>' : ""}
            </div>
          </div>

          <div class="row mb-2">
            <div class="col-lg-3 col-5 text-muted">Category</div>
            <div class="col">
              <span class="badge bg-secondary">
                <i class="bi bi-tag me-1"></i>${this.sanitizeHTML(this.item.categoryName || "Uncategorized")}
              </span>
            </div>
          </div>

          <div class="row mb-2">
            <div class="col-lg-3 col-5 text-muted">Min. Stock Level</div>
            <div class="col">
              <span class="fw-semibold">${this.item.minStock}</span> <small>unit(s)</small>
            </div>
          </div>

          <div class="row mb-2">
            <div class="col-lg-3 col-5 text-muted">Selling Price</div>
            <div class="col fw-semibold">
              ₱${formatCurrency(this.item.price)}
            </div>
          </div>

        </div>
        
        <button type="button" class="btn btn-outline-primary w-100" id="editBtn">
          <i class="bi bi-pencil me-2"></i>Edit Product
        </button>
      </div>
    `;
  }

  getStockTab() {
    const avgCost = this.calculateAvgCost();
    const stockCost = this.item.totalStock * avgCost;
    const status = this.getStatus();

    return `
      <div class="d-none" data-tab-content="stock">
        <div class="row g-3 mb-3 justify-content-center">
          <div class="col-lg-4 col-6">
            <div class="text-center p-3 bg-body-secondary rounded h-100 d-flex flex-column justify-content-center">
              <div class="text-muted small mb-1">Total Stock</div>
              <div class="h2 mb-0">${this.item.totalStock}</div>
              <small class="text-muted">unit(s)</small>
            </div>
          </div>
          <div class="col-lg-4 col-6">
            <div class="text-center p-3 bg-body-secondary rounded h-100 d-flex flex-column justify-content-center">
              <div class="text-muted small mb-1">Status</div>
              <span class="badge bg-${status.color} fs-6">
                <i class="bi ${status.icon} me-1"></i>${status.label}
              </span>
            </div>
          </div>
        </div>

        <div class="container-fluid mb-3">
          <div class="row mb-2">
            <div class="col-lg-3 col-5 text-muted">Active Purchase Orders</div>
            <div class="col">
              <span class="fw-semibold">${this.stockBatches.length}</span> <small>PO(s)</small>
            </div>
          </div>

          <div class="row mb-2">
            <div class="col-lg-3 col-5 text-muted">Avg. Unit Cost</div>
            <div class="col fw-semibold">₱${formatCurrency(avgCost)}</div>
          </div>

          <div class="row mb-2">
            <div class="col-lg-3 col-5 text-muted">Total Stock Cost</div>
            <div class="col fw-semibold">₱${formatCurrency(stockCost)}</div>
          </div>
        </div>

        <button class="btn btn-outline-primary w-100" id="adjustStockBtn">
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
                <th>Id</th>
                <th class="text-end">Remaining Qty</th>
                <th class="text-end">Received Qty</th>
                <th class="text-end">Unit Cost</th>
                <th class="text-end">Purchase Date</th>
              </tr>
            </thead>
            <tbody>
              ${this.stockBatches
                .reverse()
                .map(
                  (batch) => `
                <tr>
                  <td><code class="text-muted">${batch.poId}</code></td>
                  <td class="text-end">${batch.remainingQty}</td>
                  <td class="text-end">${batch.receivedQty}</td>
                  <td class="text-end">₱${formatCurrency(batch.unitCost)}</td>
                  <td class="text-end">${timestampToDateString(batch.purchaseDate)}</td>
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
      (sum, batch) => sum + batch.remainingQty * batch.unitCost,
      0,
    );
    const totalQty = this.stockBatches.reduce(
      (sum, batch) => sum + batch.remainingQty,
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
