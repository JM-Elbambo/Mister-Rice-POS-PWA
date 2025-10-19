import toastManager from "../../ToastManager.js";
import BaseModal from "../BaseModal.js";

export default class ViewItemModal extends BaseModal {
  constructor(item, onEdit, onManageStock) {
    super({ size: "modal-dialog-centered modal-lg" });
    this.item = item;
    this.onEdit = onEdit;
    this.onManageStock = onManageStock;
  }

  getModalContent() {
    const statusBadge = this.getStatusBadge(this.item.status);

    return `
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-eye me-2"></i>Product Details
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-md-8">
            <div class="card">
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-borderless mb-0">
                    <tbody>
                      <tr>
                        <td class="fw-semibold text-muted" style="width: 140px;">Product Name:</td>
                        <td>${this.sanitizeHTML(this.item.name)}</td>
                      </tr>
                      <tr>
                        <td class="fw-semibold text-muted">Category:</td>
                        <td>
                          <span class="badge bg-secondary">
                            <i class="bi bi-tag me-1"></i>
                            ${this.sanitizeHTML(
                              this.item.categoryName || "Uncategorized",
                            )}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td class="fw-semibold text-muted">Barcode:</td>
                        <td>
                          <code class="bg-body-secondary px-2 py-1 rounded">${this.sanitizeHTML(
                            this.item.barcode,
                          )}</code>
                          <button id="copyBarcodeBtn" class="btn btn-sm btn-outline-secondary ms-2" title="Copy to clipboard">
                            <i class="bi bi-copy"></i>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td class="fw-semibold text-muted">Selling Price:</td>
                        <td class="h6 mb-0 text-success">
                          <i class="bi bi-currency-dollar me-1"></i>$${this.formatCurrency(
                            this.item.price,
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td class="fw-semibold text-muted">Current Stock:</td>
                        <td>
                          <span class="h6 mb-0">${this.item.totalStock}</span>
                          <small class="text-muted ms-1">units</small>
                        </td>
                      </tr>
                      <tr>
                        <td class="fw-semibold text-muted">Minimum Stock:</td>
                        <td>
                          <span class="h6 mb-0">${this.item.minStock}</span>
                          <small class="text-muted ms-1">units</small>
                        </td>
                      </tr>
                      <tr>
                        <td class="fw-semibold text-muted">Status:</td>
                        <td>${statusBadge}</td>
                      </tr>
                      <tr>
                        <td class="fw-semibold text-muted">Total Value:</td>
                        <td class="h6 mb-0 text-primary">
                          <i class="bi bi-calculator me-1"></i>$${this.formatCurrency(
                            this.item.totalStock * this.item.price,
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="bi bi-gear me-2"></i>Actions
                </h6>
              </div>
              <div class="card-body">
                <div class="d-grid gap-2">
                  <button type="button" class="btn btn-outline-primary" id="editBtn">
                    <i class="bi bi-pencil-square me-2"></i>Edit Product
                  </button>
                  <button type="button" class="btn btn-outline-success" id="manageStockBtn" disabled>
                    <i class="bi bi-box-seam me-2"></i>Manage Stock (Coming Soon!)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          Close
        </button>
      </div>
    `;
  }

  getStatusBadge() {
    const statusBadge =
      this.item.totalStock === 0
        ? { label: "Out of Stock", class: "bg-danger", icon: "bi-x-circle" }
        : this.item.totalStock <= this.item.minStock
          ? {
              label: "Low Stock",
              class: "bg-warning text-dark",
              icon: "bi-exclamation-triangle",
            }
          : { label: "In Stock", class: "bg-success", icon: "bi-check-circle" };

    return `<span class="badge ${statusBadge.class}">
      <i class="${statusBadge.icon} me-1"></i>${statusBadge.label || "Unknown"}
    </span>`;
  }

  attachEventListeners() {
    const editBtn = this.modal.querySelector("#editBtn");
    // const manageStockBtn = this.modal.querySelector("#manageStockBtn");

    if (editBtn) {
      editBtn.addEventListener("click", () => {
        this.hide();
        if (this.onEdit) setTimeout(() => this.onEdit(this.item), 150);
      });
    }

    // if (manageStockBtn) {
    //   manageStockBtn.addEventListener("click", () => {
    //     this.hide();
    //     if (this.onManageStock)
    //       setTimeout(() => this.onManageStock(this.item), 150);
    //   });
    // }

    const copyBtn = this.modal.querySelector("#copyBarcodeBtn");
    if (copyBtn) {
      copyBtn.addEventListener("click", (e) => {
        e.preventDefault();
        navigator.clipboard
          .writeText(this.item.barcode)
          .then(() => {
            toastManager.showSuccess("Barcode copied to clipboard!");
          })
          .catch(() => {
            toastManager.showError("Failed to copy barcode.");
          });
      });
    }
  }

  static show(item, onEdit, onManageStock) {
    return new ViewItemModal(item, onEdit, onManageStock).create().show();
  }
}
