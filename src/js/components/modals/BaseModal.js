export default class BaseModal {
  constructor(config = {}) {
    this.config = {
      size: "modal-dialog-centered",
      backdrop: true,
      keyboard: true,
      focus: true,
      ...config,
    };
    this.modal = null;
    this.modalInstance = null;
    this.isLoading = false;
  }

  create() {
    this.modal = document.createElement("div");
    this.modal.className = "modal fade";
    this.modal.setAttribute("tabindex", "-1");

    if (this.config.backdrop === "static") {
      this.modal.setAttribute("data-bs-backdrop", "static");
    }
    if (!this.config.keyboard) {
      this.modal.setAttribute("data-bs-keyboard", "false");
    }

    this.modal.innerHTML = this.getModalHTML();
    this.attachEventListeners();

    document.body.appendChild(this.modal);
    this.modalInstance = new window.bootstrap.Modal(this.modal);

    // Auto-remove modal from DOM when hidden
    this.modal.addEventListener("hidden.bs.modal", () => {
      this.modal?.remove();
    });

    return this;
  }

  show() {
    if (this.modalInstance) {
      this.modalInstance.show();

      // Auto-focus first input when shown
      if (this.config.focus) {
        this.modal.addEventListener("shown.bs.modal", () => {
          const firstInput = this.modal.querySelector(
            "input, select, textarea",
          );
          if (firstInput) {
            firstInput.focus();
          }
        });
      }
    }
    return this;
  }

  hide() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    return this;
  }

  setLoading(
    element,
    isLoading,
    loadingText = "Loading...",
    originalText = "",
  ) {
    if (isLoading) {
      element.disabled = true;
      element.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${loadingText}`;
    } else {
      element.disabled = false;
      element.innerHTML = originalText;
    }
  }

  showError(message, container = null) {
    // Remove existing error
    const existingError = this.modal.querySelector(".alert-danger");
    if (existingError) {
      existingError.remove();
    }

    const errorAlert = document.createElement("div");
    errorAlert.className = "alert alert-danger alert-dismissible";
    errorAlert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const targetContainer =
      container || this.modal.querySelector(".modal-body");
    targetContainer.insertBefore(errorAlert, targetContainer.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorAlert.parentNode) {
        errorAlert.remove();
      }
    }, 5000);
  }

  getModalHTML() {
    return `
      <div class="modal-dialog ${this.config.size}">
        <div class="modal-content">
          ${this.getModalContent()}
        </div>
      </div>
    `;
  }

  getModalContent() {
    throw new Error("getModalContent() must be implemented by subclass");
  }

  attachEventListeners() {
    // To be implemented by child classes if needed
  }

  formatCurrency(amount) {
    return parseFloat(amount || 0).toFixed(2);
  }

  sanitizeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}
