import BaseModal from "../../BaseModal.js";

export default class AddItemModal extends BaseModal {
  constructor(categories, onSave) {
    super({ size: "modal-dialog-centered" });
    this.categories = categories;
    this.onSave = onSave;
  }

  getModalContent() {
    const categoryOptions = this.categories
      .map(
        (cat) =>
          `<option value="${cat.id}">${this.sanitizeHTML(cat.name)}</option>`,
      )
      .join("");

    return `
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-plus-circle me-2"></i>Add New Product
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <form id="addProductForm" novalidate>
          <div class="mb-3">
            <label for="productName" class="form-label">Name <span class="text-danger">*</span></label>
            <input 
              type="text" 
              class="form-control" 
              id="productName" 
              required
            >
            <div class="invalid-feedback">Name is required.</div>
          </div>

          <div class="mb-3">
            <label for="productCategory" class="form-label">Category</label>
            <select class="form-select" id="productCategory">
              <option value="">Uncategorized</option>
              ${categoryOptions}
            </select>
          </div>
          
          <div class="mb-3">
            <label for="productSku" class="form-label">SKU</label>
            <input 
              type="text" 
              class="form-control" 
              id="productSku"
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
                value="0" 
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
                value="5" 
                min="0" 
                required
              >
              <span class="input-group-text">unit(s)</span>
            </div>
            <div class="invalid-feedback">Please enter a valid minimum stock level.</div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="submit" form="addProductForm" class="btn btn-primary" id="saveBtn">
          Add Product
        </button>
      </div>
    `;
  }

  attachEventListeners() {
    const form = this.modal.querySelector("#addProductForm");
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

      const newItem = {
        name: this.modal.querySelector("#productName").value.trim(),
        category: this.modal.querySelector("#productCategory").value || null,
        sku: this.modal.querySelector("#productSku").value.trim(),
        price: parseFloat(this.modal.querySelector("#productPrice").value) || 0,
        minStock:
          parseInt(this.modal.querySelector("#productMinStock").value) || 0,
        totalStock: 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      this.setLoading(saveBtn, true, "Adding...", saveBtn.innerHTML);

      try {
        await this.onSave(newItem);
        this.hide();
      } catch (error) {
        this.setLoading(
          saveBtn,
          false,
          "",
          '<i class="bi bi-plus-lg me-2"></i>Add Product',
        );
      }
    });

    const inputs = form.querySelectorAll("input[required]");
    inputs.forEach((input) => {
      input.addEventListener("blur", validateForm);
      input.addEventListener("input", () =>
        input.classList.remove("is-invalid"),
      );
    });
  }

  static show(categories, onSave) {
    return new AddItemModal(categories, onSave).create().show();
  }
}
