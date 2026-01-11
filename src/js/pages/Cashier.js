import BasePage from "../components/BasePage.js";
import { dataStore } from "../store/index.js";
import toastManager from "../components/ToastManager.js";

export default function CashierPage() {
  return new Cashier().getElement();
}

class Cashier extends BasePage {
  constructor() {
    super();
    this.cart = this.loadCart();
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
        { collection: dataStore.stocks, callback: () => this.validateCart() },
      ]);

      this.items = dataStore.items.data;
      this.validateCart();
      this.render();
    } catch (error) {}
  }

  loadCart() {
    try {
      return JSON.parse(localStorage.getItem("cashier-cart") || "[]");
    } catch {
      return [];
    }
  }

  saveCart() {
    try {
      this.cart.length
        ? localStorage.setItem("cashier-cart", JSON.stringify(this.cart))
        : localStorage.removeItem("cashier-cart");
    } catch (e) {
      console.error("Failed to save cart:", e);
    }
  }

  validateCart() {
    if (!this.items.length) return;

    const valid = this.cart.filter((item) => {
      const product = this.items.find((i) => i.id === item.itemId);
      if (!product) return false;

      const stock = dataStore.stocks.getItemTotal(item.itemId);
      if (item.qty > stock && stock > 0) item.qty = stock;
      return true;
    });

    if (valid.length !== this.cart.length) {
      this.cart = valid;
      this.saveCart();
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-cart me-2"></i>New Sale</h5>
            </div>
            <div class="card-body">
              <div class="border-bottom pb-3 mb-3">
                <label class="form-label fw-semibold">Add Items</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-upc-scan"></i></span>
                  <input type="text" class="form-control" id="searchInput" placeholder="Scan barcode or search product..." autofocus>
                </div>
                <div id="searchResults" class="list-group mt-2"></div>
              </div>

              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style="width: 100px;">Quantity</th>
                      <th style="width: 120px;">Price</th>
                      <th style="width: 150px;">Discount</th>
                      <th class="text-end" style="width: 120px;">Subtotal</th>
                      <th style="width: 50px;"></th>
                    </tr>
                  </thead>
                  <tbody id="cartBody"></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Sale Summary</h6>
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
                  <td class="text-muted">Subtotal:</td>
                  <td class="text-end fw-semibold" id="summarySubtotal">₱0.00</td>
                </tr>
                <tr>
                  <td class="text-muted">Discount:</td>
                  <td class="text-end text-danger fw-semibold" id="summaryDiscount">-₱0.00</td>
                </tr>
                <tr class="border-top">
                  <td class="fw-bold">Total:</td>
                  <td class="text-end fs-5 fw-bold text-primary" id="summaryTotal">₱0.00</td>
                </tr>
              </table>

              <div class="mb-3">
                <label class="form-label">Payment Amount</label>
                <div class="input-group">
                  <span class="input-group-text">₱</span>
                  <input type="number" class="form-control" id="paymentInput" min="0" step="0.01" placeholder="0.00">
                </div>
              </div>

              <div class="mb-3 d-none" id="changeDisplay">
                <div class="alert alert-success mb-0">
                  <div class="d-flex justify-content-between align-items-center">
                    <span>Change:</span>
                    <span class="fw-bold fs-5" id="changeAmount">₱0.00</span>
                  </div>
                </div>
              </div>

              <div class="d-grid gap-2">
                <button type="button" class="btn btn-primary" id="checkoutBtn" disabled>
                  <i class="bi bi-check-circle me-2"></i>Complete Sale
                </button>
                <button type="button" class="btn btn-outline-secondary" id="clearBtn" disabled>
                  Clear Cart
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

    // Search with debounce
    let timeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(timeout);
      const val = e.target.value.trim().toLowerCase();
      if (!val) return (searchResults.innerHTML = "");

      timeout = setTimeout(() => {
        const matches = this.items
          .filter(
            (i) =>
              i.name.toLowerCase().includes(val) ||
              i.sku?.toLowerCase().includes(val),
          )
          .slice(0, 5);

        searchResults.innerHTML = matches.length
          ? matches
              .map((i) => {
                const stock = dataStore.stocks.getItemTotal(i.id);
                const hasStock = stock > 0;
                return `
                <button class="list-group-item list-group-item-action ${hasStock ? "" : "disabled"}" data-add="${i.id}" ${hasStock ? "" : "disabled"}>
                  <div class="d-flex justify-content-between">
                    <div>
                      <div>${i.name} ${hasStock ? "" : '<span class="badge bg-danger ms-2">Out of Stock</span>'}</div>
                      <small class="text-muted">₱${i.price.toFixed(2)} | Stock: ${stock}</small>
                    </div>
                    <i class="bi bi-${hasStock ? "plus" : "x"}-circle${hasStock ? "" : " text-muted"}"></i>
                  </div>
                </button>
              `;
              })
              .join("")
          : '<div class="list-group-item text-muted">No matches</div>';
      }, 500);
    });

    // Add to cart
    searchResults.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add]");
      if (!btn) return;

      const item = this.items.find((i) => i.id === btn.dataset.add);
      if (!item) return;

      const stock = dataStore.stocks.getItemTotal(item.id);
      const existing = this.cart.find((c) => c.itemId === item.id);

      if (existing) {
        if (existing.qty >= stock)
          return toastManager.showWarning("Insufficient stock");
        existing.qty++;
      } else {
        this.cart.push({
          itemId: item.id,
          name: item.name,
          price: parseFloat(item.price),
          qty: 1,
          discountType: "percent",
          discountValue: 0,
        });
      }

      searchInput.value = "";
      searchResults.innerHTML = "";
      searchInput.focus();
      this.updateCart();
      this.saveCart();
    });

    // Cart input changes
    cartBody.addEventListener("input", (e) => {
      const row = e.target.closest("tr");
      if (!row) return;

      const i = parseInt(row.dataset.index);
      const item = this.cart[i];

      if (e.target.dataset.qty !== undefined) {
        const stock = dataStore.stocks.getItemTotal(item.itemId);
        item.qty = Math.max(1, Math.min(stock, parseInt(e.target.value) || 1));
      } else if (e.target.dataset.disc !== undefined) {
        item.discountValue = Math.max(0, parseFloat(e.target.value) || 0);
      }

      this.updateSubtotal(i);
      this.updateSummary();
      this.saveCart();
    });

    // Discount type change
    cartBody.addEventListener("change", (e) => {
      if (e.target.dataset.disctype === undefined) return;
      const i = parseInt(e.target.closest("tr").dataset.index);
      this.cart[i].discountType = e.target.value;
      this.updateSubtotal(i);
      this.updateSummary();
      this.saveCart();
    });

    // Remove item
    cartBody.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove]");
      if (!btn) return;
      this.cart.splice(parseInt(btn.dataset.remove), 1);
      this.updateCart();
      this.saveCart();
    });

    // Payment input
    this.container
      .querySelector("#paymentInput")
      .addEventListener("input", () => this.updatePayment());

    // Clear cart
    this.container.querySelector("#clearBtn").addEventListener("click", () => {
      this.cart = [];
      this.container.querySelector("#paymentInput").value = "";
      this.updateCart();
      this.saveCart();
      searchInput.focus();
    });

    // Checkout
    this.container
      .querySelector("#checkoutBtn")
      .addEventListener("click", () => this.checkout());
  }

  updateCart() {
    const cartBody = this.container.querySelector("#cartBody");

    cartBody.innerHTML = this.cart.length
      ? this.cart
          .map((item, i) => {
            const stock = dataStore.stocks.getItemTotal(item.itemId);
            return `
            <tr data-index="${i}">
              <td class="align-middle">${item.name}</td>
              <td>
                <input type="number" class="form-control" value="${item.qty}" min="1" max="${stock}" data-qty>
              </td>
              <td class="align-middle">₱${item.price.toFixed(2)}</td>
              <td>
                <div class="input-group input-group-sm">
                  <select class="form-select" style="max-width: 70px;" data-disctype>
                    <option value="percent" ${item.discountType === "percent" ? "selected" : ""}>%</option>
                    <option value="fixed" ${item.discountType === "fixed" ? "selected" : ""}>₱</option>
                  </select>
                  <input type="number" class="form-control" value="${item.discountValue}" min="0" step="0.01" data-disc>
                </div>
              </td>
              <td class="text-end align-middle fw-semibold" data-subtotal="${i}">₱${this.calcItemTotal(item).toFixed(2)}</td>
              <td>
                <button class="btn btn-sm btn-outline-danger" data-remove="${i}">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          `;
          })
          .join("")
      : '<tr><td colspan="6" class="text-center text-muted py-4">No items added yet</td></tr>';

    this.updateSummary();
    this.updateButtons();
  }

  updateSubtotal(i) {
    const el = this.container.querySelector(`[data-subtotal="${i}"]`);
    if (el) el.textContent = `₱${this.calcItemTotal(this.cart[i]).toFixed(2)}`;
  }

  calcItemTotal(item) {
    const subtotal = item.price * item.qty;
    const disc =
      item.discountType === "percent"
        ? subtotal * (item.discountValue / 100)
        : Math.min(item.discountValue, subtotal);
    return subtotal - disc;
  }

  updateSummary() {
    const items = this.cart.length;
    const units = this.cart.reduce((s, i) => s + i.qty, 0);
    const subtotal = this.cart.reduce((s, i) => s + i.price * i.qty, 0);
    const total = this.cart.reduce((s, i) => s + this.calcItemTotal(i), 0);

    this.container.querySelector("#summaryItems").textContent = items;
    this.container.querySelector("#summaryUnits").textContent = units;
    this.container.querySelector("#summarySubtotal").textContent =
      `₱${subtotal.toFixed(2)}`;
    this.container.querySelector("#summaryDiscount").textContent =
      `-₱${(subtotal - total).toFixed(2)}`;
    this.container.querySelector("#summaryTotal").textContent =
      `₱${total.toFixed(2)}`;

    this.updatePayment();
  }

  updatePayment() {
    const total = this.cart.reduce((s, i) => s + this.calcItemTotal(i), 0);
    const payment =
      parseFloat(this.container.querySelector("#paymentInput").value) || 0;
    const change = payment - total;

    const changeDisplay = this.container.querySelector("#changeDisplay");
    const checkoutBtn = this.container.querySelector("#checkoutBtn");

    if (payment >= total && this.cart.length > 0) {
      changeDisplay.classList.remove("d-none");
      this.container.querySelector("#changeAmount").textContent =
        `₱${change.toFixed(2)}`;
      checkoutBtn.disabled = false;
    } else {
      changeDisplay.classList.add("d-none");
      checkoutBtn.disabled = true;
    }
  }

  updateButtons() {
    const isEmpty = this.cart.length === 0;
    this.container.querySelector("#clearBtn").disabled = isEmpty;
    if (isEmpty) {
      this.container.querySelector("#checkoutBtn").disabled = true;
      this.container.querySelector("#changeDisplay").classList.add("d-none");
    }
  }

  updateSearchResults() {
    const input = this.container.querySelector("#searchInput");
    if (input?.value.trim()) input.dispatchEvent(new Event("input"));
  }

  async checkout() {
    const btn = this.container.querySelector("#checkoutBtn");
    const orig = btn.innerHTML;
    btn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
    btn.disabled = true;

    try {
      // Validate stock
      for (const item of this.cart) {
        const stock = dataStore.stocks.getItemTotal(item.itemId);
        if (item.qty > stock)
          throw new Error(`Insufficient stock for ${item.name}`);
      }

      await Promise.all(
        this.cart.map((i) => dataStore.stocks.reduceStock(i.itemId, i.qty)),
      );

      const total = this.cart.reduce((s, i) => s + this.calcItemTotal(i), 0);
      const payment = parseFloat(
        this.container.querySelector("#paymentInput").value,
      );
      const change = payment - total;

      toastManager.showSuccess(
        `Sale completed! Total: ₱${total.toFixed(2)} | Change: ₱${change.toFixed(2)}`,
        { duration: 8000 },
      );

      this.cart = [];
      this.container.querySelector("#paymentInput").value = "";
      this.updateCart();
      this.saveCart();
      this.container.querySelector("#searchInput").focus();
    } catch (error) {
      toastManager.showError(`Checkout failed: ${error.message}`);
    } finally {
      btn.innerHTML = orig;
      btn.disabled = false;
    }
  }
}
