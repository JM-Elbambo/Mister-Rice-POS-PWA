import BasePage from "../components/BasePage.js";
import { dataStore } from "../store/index.js";
import toastManager from "../components/ToastManager.js";
import { Timestamp } from "firebase/firestore";

export default function PurchaseOrderPage() {
  const page = new PurchaseOrder();
  return page.getElement();
}

class PurchaseOrder extends BasePage {
  constructor() {
    super();
    this.cart = [];
    this.items = [];
    this.init();
  }

  async init() {
    try {
      await this.initCollections([
        {
          collection: dataStore.items,
          callback: (data, loading, error) => {
            if (error) return this.showError(error);
            if (!loading) {
              this.items = data;
              if (this.initialized) this.updateSearchResults();
            }
          },
        },
        { collection: dataStore.categories, callback: () => {} },
        { collection: dataStore.stocks, callback: () => {} },
      ]);

      // Set items after collections are initialized
      this.items = dataStore.items.data;
      this.render();
    } catch (error) {
      // Handled by initCollections
    }
  }

  render() {
    const today = new Date().toISOString().split("T")[0];

    this.container.innerHTML = `
      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-cart-plus me-2"></i>New Purchase Order</h5>
            </div>
            <div class="card-body">
              <form id="poForm">
                <div class="row g-3 mb-4">
                  <div class="col-md-6">
                    <label class="form-label">Supplier Name</label>
                    <input type="text" class="form-control" id="supplier" placeholder="None">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Purchase Date <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" id="purchaseDate" value="${today}" max="${today}" required>
                  </div>
                </div>

                <div class="border-top pt-3 mb-3">
                  <label class="form-label fw-semibold">Add Items</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-upc-scan"></i></span>
                    <input type="text" class="form-control" id="searchInput" placeholder="Scan barcode or search product...">
                  </div>
                  <div id="searchResults" class="list-group mt-2"></div>
                </div>

                <div class="table-responsive">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th style="width: 120px;">Quantity</th>
                        <th style="width: 140px;">Unit Cost</th>
                        <th class="text-end" style="width: 120px;">Subtotal</th>
                        <th style="width: 50px;"></th>
                      </tr>
                    </thead>
                    <tbody id="cartBody"></tbody>
                  </table>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Order Summary</h6>
            </div>
            <div class="card-body">
              <table class="table table-borderless table-sm mb-3">
                <tr>
                  <td class="text-muted">Items:</td>
                  <td class="text-end fw-semibold" id="summaryItems">0</td>
                </tr>
                <tr>
                  <td class="text-muted">Total Units:</td>
                  <td class="text-end fw-semibold" id="summaryUnits">0</td>
                </tr>
                <tr>
                  <td class="fw-bold">Total Cost:</td>
                  <td class="text-end fs-5 fw-bold text-primary" id="summaryTotal">₱0.00</td>
                </tr>
              </table>
              <div class="d-grid gap-2">
                <button type="submit" form="poForm" class="btn btn-primary" id="submitBtn" disabled>
                  <i class="bi bi-check-circle me-2"></i>Submit PO
                </button>
                <button type="button" class="btn btn-outline-secondary" id="clearBtn" disabled>
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachListeners();
    this.updateCart();
  }

  attachListeners() {
    const searchInput = this.container.querySelector("#searchInput");
    const searchResults = this.container.querySelector("#searchResults");
    const cartBody = this.container.querySelector("#cartBody");
    const form = this.container.querySelector("#poForm");
    const clearBtn = this.container.querySelector("#clearBtn");

    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      const val = e.target.value.trim().toLowerCase();

      if (!val) {
        searchResults.innerHTML = "";
        return;
      }

      searchTimeout = setTimeout(() => {
        const matches = this.items
          .filter(
            (item) =>
              item.name.toLowerCase().includes(val) ||
              item.sku?.toLowerCase().includes(val),
          )
          .slice(0, 5);

        searchResults.innerHTML = matches.length
          ? matches
              .map(
                (item) => `
              <button type="button" class="list-group-item list-group-item-action" data-add="${item.id}">
                <div class="d-flex justify-content-between">
                  <div>
                    <div>${item.name}</div>
                    <small class="text-muted">SKU: ${item.sku || "N/A"} | Stock: ${dataStore.stocks.itemTotals.get(item.id) ?? 0}</small>
                  </div>
                  <i class="bi bi-plus-circle"></i>
                </div>
              </button>
            `,
              )
              .join("")
          : '<div class="list-group-item text-muted">No matches</div>';
      }, 500);
    });

    searchResults.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add]");
      if (!btn) return;

      const item = this.items.find((i) => i.id === btn.dataset.add);
      if (!item) return;

      const existing = this.cart.find((c) => c.itemId === item.id);
      if (existing) {
        existing.quantity++;
      } else {
        this.cart.push({
          itemId: item.id,
          name: item.name,
          sku: item.sku,
          quantity: 1,
          unitCost: 0,
        });
      }

      searchInput.value = "";
      searchResults.innerHTML = "";
      searchInput.focus();

      this.updateCart();
    });

    cartBody.addEventListener("input", (e) => {
      const target = e.target;
      const row = target.closest("tr");
      if (!row) return;

      const i = parseInt(row.dataset.index);

      if (target.dataset.qty !== undefined) {
        this.cart[i].quantity = Math.max(1, parseInt(target.value) || 1);
      } else if (target.dataset.cost !== undefined) {
        this.cart[i].unitCost = Math.max(0, parseFloat(target.value) || 0);
      }

      this.updateSubtotal(i);
      this.updateSummary();
    });

    cartBody.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove]");
      if (!btn) return;
      this.cart.splice(parseInt(btn.dataset.remove), 1);
      this.updateCart();
    });

    clearBtn.addEventListener("click", () => {
      this.cart = [];
      this.updateCart();
    });

    form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  updateCart() {
    const cartBody = this.container.querySelector("#cartBody");

    cartBody.innerHTML = this.cart.length
      ? this.cart
          .map(
            (item, i) => `
          <tr data-index="${i}">
            <td class="align-middle">
              <div>${item.name}</div>
              ${item.sku ? `<small class="text-muted">SKU: ${item.sku}</small>` : ""}
            </td>
            <td>
              <input type="number" class="form-control" value="${item.quantity}" min="1" data-qty required>
            </td>
            <td>
              <div class="input-group">
                <span class="input-group-text">₱</span>
                <input type="number" class="form-control" value="${item.unitCost}" min="0" step="0.01" data-cost required>
              </div>
            </td>
            <td class="text-end align-middle fw-semibold" data-subtotal="${i}">
              ₱${(item.quantity * item.unitCost).toFixed(2)}
            </td>
            <td>
              <button type="button" class="btn btn-sm btn-outline-danger" data-remove="${i}">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        `,
          )
          .join("")
      : `<tr><td colspan="5" class="text-center text-muted py-4">No items added yet</td></tr>`;

    this.updateSummary();
    this.updateButtons();
  }

  updateSubtotal(index) {
    const subtotalEl = this.container.querySelector(
      `[data-subtotal="${index}"]`,
    );
    if (subtotalEl) {
      const { quantity, unitCost } = this.cart[index];
      subtotalEl.textContent = `₱${(quantity * unitCost).toFixed(2)}`;
    }
  }

  updateSummary() {
    const items = this.cart.length;
    const units = this.cart.reduce((sum, i) => sum + i.quantity, 0);
    const total = this.cart.reduce(
      (sum, i) => sum + i.quantity * i.unitCost,
      0,
    );

    this.container.querySelector("#summaryItems").textContent = items;
    this.container.querySelector("#summaryUnits").textContent = units;
    this.container.querySelector("#summaryTotal").textContent =
      `₱${total.toFixed(2)}`;
  }

  updateButtons() {
    const isEmpty = this.cart.length === 0;
    this.container.querySelector("#submitBtn").disabled = isEmpty;
    this.container.querySelector("#clearBtn").disabled = isEmpty;
  }

  updateSearchResults() {
    const searchInput = this.container.querySelector("#searchInput");
    if (searchInput && searchInput.value.trim()) {
      searchInput.dispatchEvent(new Event("input"));
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const supplier = form.querySelector("#supplier").value.trim() || null;
    const purchaseDate = form.querySelector("#purchaseDate").value;

    if (!this.cart.length) {
      toastManager.showError("Add items to cart");
      return;
    }

    if (this.cart.some((i) => i.unitCost < 0 || i.quantity < 1)) {
      toastManager.showError("Check quantities and costs");
      return;
    }

    const btn = this.container.querySelector("#submitBtn");
    const orig = btn.innerHTML;
    btn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';
    btn.disabled = true;

    try {
      const poId = `PO-${Date.now()}`;
      const timestamp = Timestamp.fromDate(new Date(purchaseDate));

      await Promise.all(
        this.cart.map((item) =>
          dataStore.stocks.addStockByPo({
            itemId: item.itemId,
            poId,
            qty: item.quantity,
            unitCost: item.unitCost,
            purchaseDate: timestamp,
            supplier,
          }),
        ),
      );

      const totalUnits = this.cart.reduce((s, i) => s + i.quantity, 0);
      toastManager.showSuccess(
        `PO ${poId} submitted: ${this.cart.length} items, ${totalUnits} units`,
      );

      this.cart = [];
      form.querySelector("#supplier").value = "";
      form.querySelector("#purchaseDate").value = new Date()
        .toISOString()
        .split("T")[0];
      this.updateCart();
    } catch (error) {
      toastManager.showError(`Failed: ${error.message}`);
    } finally {
      btn.innerHTML = orig;
      btn.disabled = false;
    }
  }
}
