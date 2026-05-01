import BaseModal from "../BaseModal.js";
import { formatDateTime } from "../../utils.js";

export default class TransactionDetailModal extends BaseModal {
  constructor(tx) {
    super({ size: "modal-dialog-centered modal-lg" });
    this.tx = tx;
  }

  getModalContent() {
    const tx = this.tx;
    const date = formatDateTime(tx.createdAt);

    const rowsHtml = (tx.items || [])
      .map((item) => {
        const sub = item.price * item.qty;
        const disc =
          item.discountType === "percent"
            ? sub * (item.discountValue / 100)
            : Math.min(item.discountValue || 0, sub);
        return `
          <tr>
            <td>${this.sanitizeHTML(item.name)}</td>
            <td class="text-center">${item.qty}</td>
            <td class="text-end">₱${item.price.toFixed(2)}</td>
            <td class="text-end text-danger">${disc > 0 ? `-₱${disc.toFixed(2)}` : "—"}</td>
            <td class="text-end fw-semibold">₱${(sub - disc).toFixed(2)}</td>
          </tr>`;
      })
      .join("");

    return `
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-receipt me-2"></i>Transaction Details
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div class="row g-2 mb-3 text-muted small">
          <div class="col-6"><i class="bi bi-calendar me-1"></i>${date}</div>
          <div class="col-6 text-end"><code class="bg-body-secondary px-2 py-1 rounded">${tx.id}</code></div>
        </div>

        <div class="table-responsive mb-3">
          <table class="table table-sm table-hover">
            <thead class="table-light">
              <tr>
                <th>Product</th>
                <th class="text-center">Qty</th>
                <th class="text-end">Unit Price</th>
                <th class="text-end">Discount</th>
                <th class="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>

        <div class="row justify-content-end">
          <div class="col-md-5">
            <table class="table table-sm table-borderless mb-0">
              <tr><td class="text-muted">Subtotal</td><td class="text-end">₱${(tx.subtotal || 0).toFixed(2)}</td></tr>
              <tr><td class="text-muted">Discount</td><td class="text-end text-danger">-₱${(tx.discount || 0).toFixed(2)}</td></tr>
              <tr class="border-top fw-bold"><td>Total</td><td class="text-end text-primary">₱${(tx.total || 0).toFixed(2)}</td></tr>
              <tr><td class="text-muted">Payment</td><td class="text-end">₱${(tx.payment || 0).toFixed(2)}</td></tr>
              <tr><td class="text-muted">Change</td><td class="text-end">₱${(tx.change || 0).toFixed(2)}</td></tr>
            </table>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>`;
  }

  static show(tx) {
    return new TransactionDetailModal(tx).create().show();
  }
}
