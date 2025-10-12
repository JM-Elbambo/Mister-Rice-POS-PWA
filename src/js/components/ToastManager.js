class ToastManager {
  constructor() {
    this.container = null;
    this.toastCount = 0;
    this.setupContainer();
  }

  setupContainer() {
    // Create toast container if it doesn't exist
    this.container = document.getElementById("toast-container");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "toast-container";
      this.container.className =
        "toast-container position-fixed top-0 end-0 p-3";
      this.container.style.zIndex = "1055";
      document.body.appendChild(this.container);
    }
  }

  /* Show a toast notification
   * type: "success", "error", "warning", "info", "primary"
   * options: { duration, title, action, persistent }
   */
  show(message, type = "info", options = {}) {
    const {
      duration = 5000,
      title = null,
      action = null,
      persistent = false,
    } = options;

    this.toastCount++;
    const toastId = `toast-${this.toastCount}`;

    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0`;
    toast.id = toastId;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    const icon = this.getIcon(type);
    const titleHtml = title ? `<strong class="me-2">${title}</strong>` : "";

    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center">
          <i class="bi ${icon} me-2 fs-5"></i>
          <div class="flex-grow-1">
            ${titleHtml}${message}
          </div>
          ${
            action
              ? `<button class="btn btn-sm btn-outline-light ms-2" id="${toastId}-action">
            ${action.label}
          </button>`
              : ""
          }
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      ${
        !persistent && duration > 0
          ? `<div class="toast-progress">
        <div class="toast-progress-bar bg-white" style="animation: toast-progress ${duration}ms linear;"></div>
      </div>`
          : ""
      }
    `;

    // Add action handler
    if (action && action.onClick) {
      toast
        .querySelector(`#${toastId}-action`)
        ?.addEventListener("click", () => {
          action.onClick();
          window.bootstrap.Toast.getInstance(toast)?.hide();
        });
    }

    // Add CSS for progress bar if needed
    if (!document.getElementById("toast-progress-styles")) {
      const style = document.createElement("style");
      style.id = "toast-progress-styles";
      style.textContent = `
        .toast-progress {
          height: 3px;
          background: rgba(255,255,255,0.2);
        }
        .toast-progress-bar {
          height: 100%;
          width: 0%;
        }
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `;
      document.head.appendChild(style);
    }

    this.container.appendChild(toast);

    // Initialize Bootstrap toast
    const bsToast = new window.bootstrap.Toast(toast, {
      delay: persistent ? false : duration,
      autohide: !persistent,
    });

    // Show toast
    bsToast.show();

    // Auto-remove from DOM after hiding
    toast.addEventListener("hidden.bs.toast", () => {
      toast.remove();
    });

    return bsToast;
  }

  showSuccess(message, options = {}) {
    return this.show(message, "success", {
      title: "Success",
      ...options,
    });
  }

  showError(message, options = {}) {
    return this.show(message, "danger", {
      title: "Error",
      duration: 8000, // Longer duration for errors
      ...options,
    });
  }

  showWarning(message, options = {}) {
    return this.show(message, "warning", {
      title: "Warning",
      ...options,
    });
  }

  info(message, options = {}) {
    return this.show(message, "info", {
      title: "Info",
      ...options,
    });
  }

  getIcon(type) {
    const iconMap = {
      success: "bi-check-circle-fill",
      error: "bi-exclamation-triangle-fill",
      danger: "bi-exclamation-triangle-fill",
      warning: "bi-exclamation-triangle-fill",
      info: "bi-info-circle-fill",
      primary: "bi-info-circle-fill",
    };
    return iconMap[type] || "bi-info-circle-fill";
  }

  // Clear all toasts
  clear() {
    const toasts = this.container.querySelectorAll(".toast");
    toasts.forEach((toast) => {
      const bsToast = window.bootstrap.Toast.getInstance(toast);
      if (bsToast) {
        bsToast.hide();
      }
    });
  }
}

// Create singleton instance
const toastManager = new ToastManager();

export default toastManager;
