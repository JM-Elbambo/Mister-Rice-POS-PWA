import BaseModal from "../BaseModal.js";

export default class ManageStockModal extends BaseModal {
  constructor(item, onStockIn, onStockOut) {
    super({ size: "modal-dialog-centered" });
    this.item = item;
    this.onStockIn = onStockIn;
    this.onStockOut = onStockOut;
    this.isStockIn = true;
  }

  getModalContent() {
    return `
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-box-seam me-2"></i>Manage Stock
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div class="alert alert-info mb-4">
          <i class="bi bi-info-circle me-2"></i>
          <strong>${this.sanitizeHTML(this.item.name)}</strong>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-6">
            <div class="text-center p-3 bg-primary bg-opacity-10 rounded">
              <div class="text-muted small mb-1">Current Stock</div>
              <div class="h4 mb-0">${this.item.totalStock || 0}</div>
            </div>
          </div>
          <div class="col-6">
            <div class="text-center p-3 bg-warning bg-opacity-10 rounded">
              <div class="text-muted small mb-1">Min Stock</div>
              <div class="h4 mb-0">${this.item.minStock || 5}</div>
            </div>
          </div>
        </div>

        <form id="stockForm" novalidate>
          <div class="btn-group w-100 mb-4" role="group">
            <input type="radio" class="btn-check" name="stockDir" id="stockInRadio" value="in" checked>
            <label class="btn btn-outline-success w-50" for="stockInRadio">
              <i class="bi bi-plus-circle me-1"></i>Stock In
            </label>
            <input type="radio" class="btn-check" name="stockDir" id="stockOutRadio" value="out">
            <label class="btn btn-outline-danger w-50" for="stockOutRadio">
              <i class="bi bi-dash-circle me-1"></i>Stock Out
            </label>
          </div>

          <div id="positiveFields">
            <div class="mb-3">
              <label for="quantity" class="form-label">Quantity <span class="text-danger">*</span></label>
              <input type="number" class="form-control" id="quantity" min="1" step="1" required>
              <div class="invalid-feedback">Must be greater than 0</div>
            </div>
            <div class="mb-3">
              <label for="cost" class="form-label">Unit Cost <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text">₱</span>
                <input type="number" class="form-control" id="cost" value="0" min="0" step="0.01" required>
              </div>
              <div class="invalid-feedback">Must be 0 or greater</div>
            </div>
            <div class="mb-3">
              <label for="purchaseDate" class="form-label">Purchase Date <span class="text-danger">*</span></label>
              <input type="date" class="form-control" id="purchaseDate" value="${
                new Date().toISOString().split("T")[0]
              }" max="${new Date().toISOString().split("T")[0]}" required>
              <div class="invalid-feedback">Required</div>
            </div>
          </div>

          <div id="negativeFields" class="d-none">
            <div class="mb-3">
              <label for="negativeQty" class="form-label">Quantity <span class="text-danger">*</span></label>
              <input type="number" class="form-control" id="negativeQty" min="1" max="${
                this.item.totalStock || 0
              }" step="1">
              <div class="invalid-feedback">Must be between 1 and ${
                this.item.totalStock || 0
              }</div>
            </div>
            <div class="mb-3">
              <label for="reason" class="form-label">Reason <span class="text-danger">*</span></label>
              <select class="form-select" id="reason">
                <option value="">Select reason...</option>
                <option value="damaged">Damaged</option>
                <option value="expired">Expired</option>
                <option value="missing">Missing</option>
                <option value="other">Other</option>
              </select>
              <div class="invalid-feedback">Please select a reason</div>
            </div>
          </div>

          <div id="preview" class="alert mt-3">
            <div id="previewCost" class="d-flex justify-content-between mb-2">
              <span class="fw-semibold">Total Cost:</span>
              <span id="previewCostValue" class="fw-bold"></span>
            </div>
            <div class="d-flex justify-content-between">
              <span class="fw-semibold">Change:</span>
              <span id="previewChange" class="fw-bold"></span>
            </div>
            <div class="d-flex justify-content-between">
              <span class="fw-semibold">New Total:</span>
              <span id="previewTotal" class="fw-bold"></span>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="submit" form="stockForm" id="submitBtn"></button>
      </div>
    `;
  }

  attachEventListeners() {
    const form = this.modal.querySelector("#stockForm");
    const submitBtn = this.modal.querySelector("#submitBtn");
    const stockInRadio = this.modal.querySelector("#stockInRadio");
    const stockOutRadio = this.modal.querySelector("#stockOutRadio");
    const positiveFields = this.modal.querySelector("#positiveFields");
    const negativeFields = this.modal.querySelector("#negativeFields");
    const preview = this.modal.querySelector("#preview");
    const previewChange = this.modal.querySelector("#previewChange");
    const previewTotal = this.modal.querySelector("#previewTotal");
    const previewCost = this.modal.querySelector("#previewCost");
    const previewCostValue = this.modal.querySelector("#previewCostValue");

    const qtyInput = this.modal.querySelector("#quantity");
    const costInput = this.modal.querySelector("#cost");
    const negativeQtyInput = this.modal.querySelector("#negativeQty");

    const updateMode = () => {
      const checkedStockDir = this.modal.querySelector(
        'input[name="stockDir"]:checked',
      );
      if (!checkedStockDir) return;

      this.isStockIn = checkedStockDir.value === "in";

      if (this.isStockIn === true) {
        positiveFields.classList.remove("d-none");
        negativeFields.classList.add("d-none");
        submitBtn.className = "btn btn-success";
        submitBtn.innerHTML = "Add Stock";
      } else {
        positiveFields.classList.add("d-none");
        negativeFields.classList.remove("d-none");
        submitBtn.className = "btn btn-danger";
        submitBtn.innerHTML = "Reduce Stock";
      }
      updatePreview();
    };

    const updatePreview = () => {
      const current = this.item.totalStock || 0;

      // Stock in
      if (this.isStockIn === true) {
        previewCost.classList.remove("d-none");
        const qty = parseInt(qtyInput.value) || 0;
        const cost = parseFloat(costInput.value) || 0;

        if (qty > 0 && cost >= 0) {
          const newTotal = current + qty;
          const totalCost = qty * cost;

          previewCostValue.textContent = `₱${totalCost.toFixed(2)}`;

          previewChange.textContent = `+${qty} units`;
          previewTotal.textContent = `${newTotal} units`;
          preview.className = "alert alert-success";
        } else {
          preview.className = "d-none";
        }

        // Stock out
      } else {
        previewCost.classList.add("d-none");
        const qty = parseInt(negativeQtyInput.value) || 0;

        if (qty > 0) {
          if (qty > current) {
            previewChange.textContent = `-${qty} units`;
            previewTotal.textContent = `Quantity exceeds current stock`;
            preview.className = "alert alert-danger";
          } else {
            const newTotal = current - qty;

            previewChange.textContent = `-${qty} units`;
            previewTotal.textContent = `${newTotal} units`;
            preview.className = `alert ${
              newTotal <= this.item.minStock ? "alert-danger" : "alert-warning"
            }`;
          }
        } else {
          preview.className = "d-none";
        }
      }
    };

    stockInRadio.addEventListener("change", updateMode);
    stockOutRadio.addEventListener("change", updateMode);
    qtyInput?.addEventListener("input", updatePreview);
    costInput?.addEventListener("input", updatePreview);
    negativeQtyInput?.addEventListener("input", updatePreview);

    const validateForm = () => {
      let isValid = true;

      if (this.isStockIn === true) {
        const qty = parseInt(qtyInput.value) || 0;
        const cost = parseFloat(costInput.value);
        const date = this.modal.querySelector("#purchaseDate").value;

        [qtyInput, costInput].forEach((input) =>
          input.classList.remove("is-invalid"),
        );

        if (qty < 1) {
          qtyInput.classList.add("is-invalid");
          isValid = false;
        }
        if (cost === undefined || cost < 0) {
          costInput.classList.add("is-invalid");
          isValid = false;
        }
        if (!date) {
          this.modal.querySelector("#purchaseDate").classList.add("is-invalid");
          isValid = false;
        }
      } else {
        const qty = parseInt(negativeQtyInput.value) || 0;
        const reason = this.modal.querySelector("#reason").value;

        [negativeQtyInput, this.modal.querySelector("#reason")].forEach(
          (input) => input.classList.remove("is-invalid"),
        );

        if (qty < 1 || qty > (this.item.totalStock || 0)) {
          negativeQtyInput.classList.add("is-invalid");
          isValid = false;
        }
        if (!reason) {
          this.modal.querySelector("#reason").classList.add("is-invalid");
          isValid = false;
        }
      }

      return isValid;
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      const loadingMsg = this.isStockIn
        ? "Adding stock..."
        : "Reducing stock...";
      this.setLoading(submitBtn, true, loadingMsg, submitBtn.innerHTML);

      try {
        if (this.isStockIn === true) {
          await this.onStockIn(
            this.item,
            parseFloat(qtyInput.value),
            parseFloat(costInput.value),
            new Date(this.modal.querySelector("#purchaseDate").value),
          );
        } else {
          await this.onStockOut(
            this.item,
            parseFloat(negativeQtyInput.value),
            this.modal.querySelector("#reason").value,
          );
        }
        this.hide();
      } catch (error) {
        this.setLoading(submitBtn, false, "", submitBtn.innerHTML);
        updateMode();
      }
    });

    updateMode();
  }

  static show(item, onStockIn, onStockOut) {
    return new ManageStockModal(item, onStockIn, onStockOut).create().show();
  }
}
