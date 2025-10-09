import BaseModal from "../BaseModal.js";

export default class EditItemModal extends BaseModal {
  constructor(item, categories, onSave) {
    super({ size: "modal-dialog-centered" });
    this.item = item;
    this.categories = categories;
    this.onSave = onSave;
  }

  getModalHTML() {
    const categoryOptions = this.categories
      .map(
        (cat) =>
          `<option value="${cat.id}" ${
            cat.id === this.item.category ? "selected" : ""
          }>${this.sanitizeHTML(cat.name)}</option>`
      )
      .join("");

    return `
      <div class="modal-dialog ${this.config.size}">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil-square me-2"></i>Edit Product
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="editProductForm" novalidate>
              <div class="mb-3">
                <label for="productName" class="form-label">Product Name <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="productName" 
                  value="${this.sanitizeHTML(this.item.name)}" 
                  required
                >
                <div class="invalid-feedback">Product name is required.</div>
              </div>

              <div class="mb-3">
                <label for="productCategory" class="form-label">Category</label>
                <select class="form-select" id="productCategory">
                  <option value="">Uncategorized</option>
                  ${categoryOptions}
                </select>
              </div>
              
              <div class="mb-3">
                <label for="productBarcode" class="form-label">Barcode</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="productBarcode" 
                  value="${this.sanitizeHTML(this.item.barcode || "")}"
                >
              </div>

              <div class="mb-3">
                <label for="productPrice" class="form-label">Price <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="productPrice" 
                    value="${this.item.price || 0}" 
                    step="0.1" 
                    min="0" 
                    required
                  >
                </div>
                <div class="invalid-feedback">Please enter a valid price.</div>
              </div>

              <div class="mb-3">
                <label for="productMinStock" class="form-label">Minimum Stock <span class="text-danger">*</span></label>
                <div class="input-group">
                  <input 
                    type="number" 
                    class="form-control" 
                    id="productMinStock" 
                    value="${this.item.minStock || 5}" 
                    min="0" 
                    required
                  >
                  <span class="input-group-text">units</span>
                </div>
                <div class="invalid-feedback">Please enter a valid minimum stock level.</div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" form="editProductForm" class="btn btn-primary" id="saveBtn">
              <i class="bi bi-check-lg me-2"></i>Save Changes
            </button>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const form = this.modal.querySelector("#editProductForm");
    const saveBtn = this.modal.querySelector("#saveBtn");

    const validateForm = () => {
      const inputs = form.querySelectorAll("input[required]");
      let isValid = true;

      inputs.forEach((input) => {
        input.classList.remove("is-invalid");

        if (
          !input.value.trim() ||
          (input.type === "number" && parseFloat(input.value) < 0)
        ) {
          input.classList.add("is-invalid");
          isValid = false;
        }
      });

      return isValid;
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      const updatedItem = {
        name: this.modal.querySelector("#productName").value.trim(),
        category: this.modal.querySelector("#productCategory").value || null,
        barcode: this.modal.querySelector("#productBarcode").value.trim(),
        price: parseFloat(this.modal.querySelector("#productPrice").value) || 0,
        minStock:
          parseInt(this.modal.querySelector("#productMinStock").value) || 0,
        lastUpdated: new Date().toISOString(),
      };

      try {
        this.setLoading(saveBtn, true, "Saving...", saveBtn.innerHTML);
        await this.onSave(this.item.id, updatedItem);
        this.hide();
      } catch (error) {
        this.showError("Failed to update product. Please try again.");
        this.setLoading(
          saveBtn,
          false,
          "",
          '<i class="bi bi-check-lg me-2"></i>Save Changes'
        );
      }
    });

    const inputs = form.querySelectorAll("input[required]");
    inputs.forEach((input) => {
      input.addEventListener("blur", validateForm);
      input.addEventListener("input", () =>
        input.classList.remove("is-invalid")
      );
    });
  }

  static show(item, categories, onSave) {
    return new EditItemModal(item, categories, onSave).create().show();
  }
}
