import { dataStore } from "../store/index.js";
import toastManager from "../components/ToastManager.js";

export default function PurchaseOrderPage() {
  const main = document.createElement("main");
  main.className = "container mb-4";

  let cart = [];
  let items = [];
  let unsubItems = null;

  async function init() {
    try {
      unsubItems = dataStore.items.subscribe((data, loading, error) => {
        if (error) return showError(error);
        if (!loading) items = data;
      });

      dataStore.items.listen();
      await Promise.all([
        dataStore.items.fetch(),
        dataStore.categories.fetch(),
        dataStore.stocks.fetch(),
      ]);
      renderInitial();
    } catch (error) {
      showError(error);
    }
  }

  function renderInitial() {
    main.innerHTML = `
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
                    <input type="date" class="form-control" id="purchaseDate" value="${new Date().toISOString().split("T")[0]}" max="${new Date().toISOString().split("T")[0]}" required>
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
                    <tbody id="cartBody">
                      <tr>
                        <td colspan="5" class="text-center text-muted py-4">
                          No items added yet
                        </td>
                      </tr>
                    </tbody>
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

    attachListeners();
  }

  function renderCart() {
    const cartBody = main.querySelector("#cartBody");

    cartBody.innerHTML = cart.length
      ? cart
          .map(
            (item, i) => `
      <tr data-cart-item="${i}">
        <td class="align-middle">
          <div>${item.name}</div>
          ${item.sku ? `<small class="text-muted">SKU: ${item.sku}</small>` : ""}
        </td>
        <td>
          <input type="number" class="form-control" value="${item.quantity}" min="1" data-qty="${i}" required>
        </td>
        <td>
          <div class="input-group">
            <span class="input-group-text">₱</span>
            <input type="number" class="form-control" value="${item.unitCost}" min="0" step="0.01" data-cost="${i}" required>
          </div>
        </td>
        <td class="text-end align-middle fw-semibold" data-subtotal="${i}">₱${(item.quantity * item.unitCost).toFixed(2)}</td>
        <td>
          <button type="button" class="btn btn-sm btn-outline-danger" data-remove="${i}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `,
          )
          .join("")
      : `
      <tr>
        <td colspan="5" class="text-center text-muted py-4">
          No items added yet
        </td>
      </tr>
    `;

    updateButtons();
  }

  function updateSummary() {
    const summaryItems = main.querySelector("#summaryItems");
    const summaryUnits = main.querySelector("#summaryUnits");
    const summaryTotal = main.querySelector("#summaryTotal");

    if (summaryItems) summaryItems.textContent = cart.length;
    if (summaryUnits)
      summaryUnits.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
    if (summaryTotal)
      summaryTotal.textContent = `₱${cart.reduce((sum, i) => sum + i.quantity * i.unitCost, 0).toFixed(2)}`;
  }

  function updateButtons() {
    const submitBtn = main.querySelector("#submitBtn");
    const clearBtn = main.querySelector("#clearBtn");

    if (submitBtn) submitBtn.disabled = cart.length === 0;
    if (clearBtn) clearBtn.disabled = cart.length === 0;
  }

  function attachListeners() {
    const searchInput = main.querySelector("#searchInput");
    const searchResults = main.querySelector("#searchResults");
    const cartBody = main.querySelector("#cartBody");
    const form = main.querySelector("#poForm");

    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      const val = e.target.value.trim().toLowerCase();

      if (!val) {
        searchResults.innerHTML = "";
        return;
      }

      searchTimeout = setTimeout(() => {
        const matches = items
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

      const item = items.find((i) => i.id === btn.dataset.add);
      if (!item) return;

      const existing = cart.find((c) => c.itemId === item.id);
      if (existing) {
        existing.quantity++;
      } else {
        cart.push({
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

      renderCart();
      updateSummary();
    });

    cartBody.addEventListener("input", (e) => {
      const qtyInput = e.target.closest("[data-qty]");
      const costInput = e.target.closest("[data-cost]");

      if (qtyInput) {
        const i = parseInt(qtyInput.dataset.qty);
        cart[i].quantity = Math.max(1, parseInt(qtyInput.value) || 1);

        const subtotal = main.querySelector(`[data-subtotal="${i}"]`);
        if (subtotal) {
          subtotal.textContent = `₱${(cart[i].quantity * cart[i].unitCost).toFixed(2)}`;
        }
        updateSummary();
      } else if (costInput) {
        const i = parseInt(costInput.dataset.cost);
        cart[i].unitCost = Math.max(0, parseFloat(costInput.value) || 0);

        const subtotal = main.querySelector(`[data-subtotal="${i}"]`);
        if (subtotal) {
          subtotal.textContent = `₱${(cart[i].quantity * cart[i].unitCost).toFixed(2)}`;
        }
        updateSummary();
      }
    });

    cartBody.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove]");
      if (!btn) return;
      cart.splice(parseInt(btn.dataset.remove), 1);
      renderCart();
      updateSummary();
    });

    main.querySelector("#clearBtn")?.addEventListener("click", () => {
      cart = [];
      renderCart();
      updateSummary();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const supplier = form.querySelector("#supplier").value.trim() || null;
      const purchaseDate = form.querySelector("#purchaseDate").value;

      if (!cart.length) {
        toastManager.showError("Add items to cart");
        return;
      }

      const invalidItem = cart.find((i) => i.unitCost < 0 || i.quantity < 1);
      if (invalidItem) {
        toastManager.showError("Check quantities and costs");
        return;
      }

      const btn = main.querySelector("#submitBtn");
      const orig = btn.innerHTML;
      btn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';
      btn.disabled = true;

      try {
        const poId = `PO-${Date.now()}`;
        const timestamp = new Date(purchaseDate);

        await Promise.all(
          cart.map((item) =>
            dataStore.stocks.addStockFromPo({
              itemId: item.itemId,
              poId,
              qty: item.quantity,
              unitCost: item.unitCost,
              purchaseDate: timestamp.toISOString(),
              supplier,
            }),
          ),
        );

        toastManager.showSuccess(
          `PO ${poId} submitted: ${cart.length} items, ${cart.reduce((s, i) => s + i.quantity, 0)} units`,
        );

        cart = [];
        form.querySelector("#supplier").value = "";
        form.querySelector("#purchaseDate").value = new Date()
          .toISOString()
          .split("T")[0];
        renderCart();
        updateSummary();
      } catch (error) {
        toastManager.showError(`Failed: ${error.message}`);
      } finally {
        btn.innerHTML = orig;
        btn.disabled = false;
      }
    });
  }

  function showError(error) {
    main.innerHTML = `
      <div class="alert alert-danger">
        <h4>Error</h4>
        <p>${error?.message || "Unknown error"}</p>
      </div>
    `;
  }

  function cleanup() {
    if (unsubItems) unsubItems();
    dataStore.items.stopListening();
  }

  window.addEventListener("beforeunload", cleanup);
  init();
  return main;
}
