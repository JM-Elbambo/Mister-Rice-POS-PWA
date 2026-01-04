import toastManager from "../components/ToastManager.js";

export default class BasePage {
  constructor() {
    this.container = document.createElement("main");
    this.container.className = "container";
    this.subscriptions = [];
    this.initialized = false;
    this.loading = false;
    this.error = null;

    window.addEventListener("beforeunload", () => this.cleanup());
  }

  subscribe(collection, callback) {
    const unsubscribe = collection.subscribe(callback);
    this.subscriptions.push(unsubscribe);
    return unsubscribe;
  }

  async initCollections(collections) {
    this.showLoading();

    try {
      collections.forEach(({ collection, callback }) => {
        this.subscribe(collection, callback);

        // Only listen if not already listening
        if (!collection.unsubscribe) {
          collection.listen();
        }
      });

      // Fetch only if data is empty (use cache otherwise)
      const fetchPromises = collections
        .filter(({ collection }) => collection.data.length === 0)
        .map(({ collection }) => collection.fetch());

      if (fetchPromises.length > 0) {
        await Promise.all(fetchPromises);
      }

      this.initialized = true;
      this.loading = false;
    } catch (error) {
      this.showError(error);
      throw error;
    }
  }

  showLoading(message = "Loading...") {
    this.loading = true;
    this.container.innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="height: 400px;">
        <div class="text-center">
          <div class="spinner-border text-primary"></div>
          <p class="mt-3 text-muted">${message}</p>
        </div>
      </div>
    `;
  }

  showError(error) {
    this.loading = false;
    this.error = error;
    this.container.innerHTML = `
      <div class="alert alert-danger text-center">
        <h4>Error</h4>
        <p>${error?.message || "Unknown error"}</p>
        <button class="btn btn-outline-danger" onclick="location.reload()">Retry</button>
      </div>
    `;
  }

  handleAction(action, successMsg, errorPrefix = "Action failed") {
    return async (...args) => {
      try {
        if (!navigator.onLine) {
          action(...args).catch((error) => {
            console.error("Background sync error:", error);
            toastManager.showError(`${errorPrefix}: ${error.message}`);
          });

          const msg =
            typeof successMsg === "function" ? successMsg(...args) : successMsg;
          toastManager.showSuccess(msg + " (Will sync when online)");
          return;
        }

        await action(...args);
        const msg =
          typeof successMsg === "function" ? successMsg(...args) : successMsg;
        toastManager.showSuccess(msg);
      } catch (error) {
        toastManager.showError(`${errorPrefix}: ${error.message}`);
        throw error;
      }
    };
  }

  cleanup() {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions = [];
  }

  render() {
    throw new Error("render() must be implemented by child class");
  }

  getElement() {
    return this.container;
  }
}
