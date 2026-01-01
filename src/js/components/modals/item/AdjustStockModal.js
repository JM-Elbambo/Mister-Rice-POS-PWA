import BaseModal from "../BaseModal.js";

export default class AdjustStockModal extends BaseModal {
  constructor(item, stockBatches, onAdjust) {
    super({ size: "modal-dialog-centered" });
    this.item = item;
    this.stockBatches = stockBatches;
    this.onAdjust = onAdjust;
    this.isAddition = true;
  }

  getModalContent() {
    return `
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-box-seam me-2"></i>Adjust Stock
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
            <input type="radio" class="btn-check" name="type" id="addRadio" value="add" checked>
            <label class="btn btn-outline-success w-50" for="addRadio">
              <i class="bi bi-plus-circle me-1"></i>Add
            </label>
            <input type="radio" class="btn-check" name="type" id="subtractRadio" value="subtract">
            <label class="btn btn-outline-danger w-50" for="subtractRadio">
              <i class="bi bi-dash-circle me-1"></i>Subtract
            </label>
          </div>

          <div class="mb-3">
            <label for="quantity" class="form-label">Quantity <span class="text-danger">*</span></label>
            <input type="number" class="form-control" id="quantity" min="1" step="1" required>
            <div class="invalid-feedback" id="qtyError">Must be greater than 0</div>
          </div>

          <div class="mb-3">
            <label for="reason" class="form-label">Reason <span class="text-danger">*</span></label>
            <select class="form-select" id="reason" required>
              <option value="">Select reason...</option>
              <option value="correction">Correction</option>
              <option value="recovered">Recovered</option>
              <option value="damaged">Damaged</option>
              <option value="expired">Expired</option>
              <option value="missing">Missing</option>
              <option value="other">Other</option>
            </select>
            <div class="invalid-feedback">Please select a reason</div>
          </div>

          <div id="preview">
            <div class="d-flex justify-content-between mb-2">
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
        <button type="submit" form="stockForm" class="btn btn-success" id="submitBtn">
          <i class="bi bi-check-lg me-2"></i>Adjust Stock
        </button>
      </div>
    `;
  }

  attachEventListeners() {
    const form = this.modal.querySelector("#stockForm");
    const submitBtn = this.modal.querySelector("#submitBtn");
    const qtyInput = this.modal.querySelector("#quantity");
    const reasonSelect = this.modal.querySelector("#reason");
    const preview = this.modal.querySelector("#preview");
    const previewChange = this.modal.querySelector("#previewChange");
    const previewTotal = this.modal.querySelector("#previewTotal");
    const qtyError = this.modal.querySelector("#qtyError");

    const reasonOptions = {
      add: ["correction", "recovered", "other"],
      subtract: ["damaged", "expired", "missing", "other"],
    };

    const updateMode = () => {
      const checked = this.modal.querySelector('input[name="type"]:checked');
      this.isAddition = checked?.value === "add";

      const options = reasonOptions[this.isAddition ? "add" : "subtract"];
      reasonSelect.innerHTML =
        '<option value="">Select reason...</option>' +
        options
          .map((v) => {
            const labels = {
              correction: "Correction",
              recovered: "Recovered",
              damaged: "Damaged",
              expired: "Expired",
              missing: "Missing",
              other: "Other",
            };
            return `<option value="${v}">${labels[v]}</option>`;
          })
          .join("");

      // Update button appearance
      if (this.isAddition) {
        submitBtn.className = "btn btn-success";
        submitBtn.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Add Stock';
      } else {
        submitBtn.className = "btn btn-danger";
        submitBtn.innerHTML =
          '<i class="bi bi-dash-circle me-2"></i>Subtract Stock';
      }

      qtyInput.classList.remove("is-invalid");
      reasonSelect.classList.remove("is-invalid");
      updatePreview();
    };

    const updatePreview = () => {
      const qty = parseInt(qtyInput.value) || 0;
      const current = this.item.totalStock || 0;

      if (this.isAddition) {
        // Adding stock
        preview.className = "alert alert-success";
        if (this.stockBatches.length === 0) {
          previewChange.textContent = "";
          previewTotal.textContent = "No purchase orders available";
        } else {
          const newTotal = current + qty;
          previewChange.textContent = `+${qty} units`;
          previewTotal.textContent = `${newTotal} units`;
        }
      } else {
        // Subtracting stock
        preview.className = "alert alert-danger";
        if (current === 0 || qty > current) {
          previewChange.textContent = "";
          previewTotal.textContent = "Exceeds current stock";
        } else {
          const newTotal = current - qty;
          qtyError.textContent = "Must be greater than 0";
          previewChange.textContent = `-${qty} units`;
          previewTotal.textContent = `${newTotal} units`;
        }
      }
    };

    this.modal
      .querySelectorAll('input[name="type"]')
      .forEach((r) => r.addEventListener("change", updateMode));
    qtyInput.addEventListener("input", updatePreview);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const qty = parseInt(qtyInput.value) || 0;
      const reason = reasonSelect.value;
      const current = this.item.totalStock || 0;

      qtyInput.classList.remove("is-invalid");
      reasonSelect.classList.remove("is-invalid");

      let isValid = true;

      if (qty < 1) {
        isValid = false;
        qtyInput.classList.add("is-invalid");
        qtyError.textContent = "Must be greater than 0";
      } else if (this.isAddition) {
        if (this.stockBatches.length === 0) {
          isValid = false;
          qtyInput.classList.add("is-invalid");
          qtyError.textContent =
            "Cannot add stock without existing purchase orders";
        }
      } else {
        if (qty > current) {
          isValid = false;
          qtyInput.classList.add("is-invalid");
          qtyError.textContent = `Cannot exceed current stock of ${current} units`;
        }
      }

      if (!reason) {
        isValid = false;
        reasonSelect.classList.add("is-invalid");
      }

      if (!isValid) return;

      this.setLoading(submitBtn, true, "Adjusting...", submitBtn.innerHTML);

      try {
        await this.onAdjust(this.item, this.isAddition ? qty : -qty, reason);
        this.hide();
      } catch (error) {
        const originalBtn = this.isAddition
          ? '<i class="bi bi-plus-circle me-2"></i>Add Stock'
          : '<i class="bi bi-dash-circle me-2"></i>Subtract Stock';
        this.setLoading(submitBtn, false, "", originalBtn);
      }
    });

    updateMode();
  }

  static show(item, stockBatches, onAdjust) {
    return new AdjustStockModal(item, stockBatches, onAdjust).create().show();
  }
}
