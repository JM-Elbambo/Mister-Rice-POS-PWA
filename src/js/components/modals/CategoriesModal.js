import BaseModal from "./BaseModal.js";

export default class CategoriesModal extends BaseModal {
  constructor(onCreate, onUpdate, onDelete, onRefresh) {
    super({ size: "modal-dialog-centered modal-lg" });
    this.onCreate = onCreate;
    this.onUpdate = onUpdate;
    this.onDelete = onDelete;
    this.onRefresh = onRefresh;
    this.categories = onRefresh();
    this.editingId = null;
  }

  getModalContent() {
    const categoriesList = this.categories.length
      ? this.categories.map((cat) => this.getCategoryItem(cat)).join("")
      : '<p class="text-muted text-center py-4">No categories yet</p>';

    return `
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-tags me-2"></i>Manage Categories
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-md-7">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="bi bi-list-ul me-2"></i>All Categories
                </h6>
              </div>
              <div class="card-body" style="max-height: 400px; overflow-y: auto;">
                <div id="categoriesList">${categoriesList}</div>
              </div>
            </div>
          </div>
          
          <div class="col-md-5">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="bi bi-plus-circle me-2"></i>Add New Category
                </h6>
              </div>
              <div class="card-body">
                <form id="addCategoryForm" novalidate>
                  <div class="mb-3">
                    <label for="categoryName" class="form-label">
                      Name <span class="text-danger">*</span>
                    </label>
                    <input type="text" class="form-control" id="categoryName" required>
                    <div class="invalid-feedback">Name is required.</div>
                  </div>
                  <button type="submit" class="btn btn-primary w-100" id="addBtn">
                    <i class="bi bi-plus-lg me-2"></i>Add Category
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          <i class="bi bi-x-lg me-2"></i>Close
        </button>
      </div>
    `;
  }

  getCategoryItem(cat) {
    return `
      <div class="d-flex justify-content-between align-items-center p-3 bg-body-secondary rounded mb-2" data-category-id="${cat.id}">
        <div class="d-flex align-items-center gap-2 flex-grow-1">
          <i class="bi bi-tag text-primary"></i>
          <span class="fw-semibold category-name">${this.sanitizeHTML(cat.name)}</span>
          <input type="text" class="form-control form-control-sm d-none category-input" value="${this.sanitizeHTML(cat.name)}">
        </div>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary edit-btn" title="Edit">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-success d-none save-btn" title="Save">
            <i class="bi bi-check-lg"></i>
          </button>
          <button class="btn btn-outline-secondary d-none cancel-btn" title="Cancel">
            <i class="bi bi-x-lg"></i>
          </button>
          <button class="btn btn-outline-danger delete-btn" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const form = this.modal.querySelector("#addCategoryForm");
    const addBtn = this.modal.querySelector("#addBtn");
    const categoryInput = this.modal.querySelector("#categoryName");
    const categoriesList = this.modal.querySelector("#categoriesList");

    // Add category
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = categoryInput.value.trim();

      if (!name) {
        categoryInput.classList.add("is-invalid");
        return;
      }

      categoryInput.classList.remove("is-invalid");
      this.setLoading(addBtn, true, "Adding...", addBtn.innerHTML);

      try {
        await this.onCreate(name);
        categoryInput.value = "";
        await this.refreshList();
      } catch (error) {
      } finally {
        this.setLoading(
          addBtn,
          false,
          "",
          '<i class="bi bi-plus-lg me-2"></i>Add Category',
        );
      }
    });

    categoryInput.addEventListener("input", () =>
      categoryInput.classList.remove("is-invalid"),
    );

    // Event delegation for category actions
    categoriesList.addEventListener("click", async (e) => {
      const item = e.target.closest("[data-category-id]");
      if (!item) return;

      const categoryId = item.dataset.categoryId;
      const category = this.categories.find((c) => c.id === categoryId);
      if (!category) return;

      if (e.target.closest(".edit-btn")) {
        this.enterEditMode(item, category);
      } else if (e.target.closest(".save-btn")) {
        await this.saveEdit(item, category);
      } else if (e.target.closest(".cancel-btn")) {
        this.cancelEdit(item, category);
      } else if (e.target.closest(".delete-btn")) {
        this.showDeleteConfirmation(categoryId, category.name);
      }
    });
  }

  enterEditMode(item, category) {
    if (this.editingId && this.editingId !== category.id) {
      const prevItem = this.modal.querySelector(
        `[data-category-id="${this.editingId}"]`,
      );
      if (prevItem) {
        const prevCategory = this.categories.find(
          (c) => c.id === this.editingId,
        );
        if (prevCategory) this.cancelEdit(prevItem, prevCategory);
      }
    }

    this.editingId = category.id;
    const nameSpan = item.querySelector(".category-name");
    const input = item.querySelector(".category-input");
    const editBtn = item.querySelector(".edit-btn");
    const saveBtn = item.querySelector(".save-btn");
    const cancelBtn = item.querySelector(".cancel-btn");
    const deleteBtn = item.querySelector(".delete-btn");

    nameSpan.classList.add("d-none");
    input.classList.remove("d-none");
    editBtn.classList.add("d-none");
    saveBtn.classList.remove("d-none");
    cancelBtn.classList.remove("d-none");
    deleteBtn.classList.add("d-none");

    input.focus();
    input.select();
  }

  cancelEdit(item, category) {
    this.editingId = null;
    const nameSpan = item.querySelector(".category-name");
    const input = item.querySelector(".category-input");
    const editBtn = item.querySelector(".edit-btn");
    const saveBtn = item.querySelector(".save-btn");
    const cancelBtn = item.querySelector(".cancel-btn");
    const deleteBtn = item.querySelector(".delete-btn");

    input.value = category.name;
    nameSpan.classList.remove("d-none");
    input.classList.add("d-none");
    editBtn.classList.remove("d-none");
    saveBtn.classList.add("d-none");
    cancelBtn.classList.add("d-none");
    deleteBtn.classList.remove("d-none");
  }

  async saveEdit(item, category) {
    const input = item.querySelector(".category-input");
    const newName = input.value.trim();

    if (!newName) {
      input.classList.add("is-invalid");
      return;
    }

    if (newName === category.name) {
      this.cancelEdit(item, category);
      return;
    }

    const saveBtn = item.querySelector(".save-btn");
    const originalHTML = saveBtn.innerHTML;

    saveBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm"></span>';
    saveBtn.disabled = true;

    try {
      await this.onUpdate(category.id, newName);
      this.editingId = null;
      await this.refreshList();
    } catch (error) {
      saveBtn.innerHTML = originalHTML;
      saveBtn.disabled = false;
    }
  }

  showDeleteConfirmation(categoryId, categoryName) {
    const confirmModal = document.createElement("div");
    confirmModal.className = "modal fade";
    confirmModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title">
              <i class="bi bi-trash text-danger me-2"></i>Delete Category
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body pt-2">
            <p class="mb-2">Delete <strong>${this.sanitizeHTML(categoryName)}</strong>?</p>
            <p class="text-muted small mb-0">
              Products using this category will become uncategorized.
            </p>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger btn-sm" id="confirmDeleteBtn">
              <i class="bi bi-trash me-1"></i>Delete
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(confirmModal);
    const bsModal = new window.bootstrap.Modal(confirmModal);
    const confirmBtn = confirmModal.querySelector("#confirmDeleteBtn");

    confirmBtn.addEventListener("click", async () => {
      confirmBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Deleting...';
      confirmBtn.disabled = true;

      try {
        await this.onDelete(categoryId, categoryName);
        bsModal.hide();
        await this.refreshList();
      } catch (error) {
        confirmBtn.innerHTML = '<i class="bi bi-trash me-1"></i>Delete';
        confirmBtn.disabled = false;
      }
    });

    confirmModal.addEventListener("hidden.bs.modal", () =>
      confirmModal.remove(),
    );
    bsModal.show();
  }

  async refreshList() {
    this.categories = await this.onRefresh();
    const categoriesList = this.modal.querySelector("#categoriesList");

    categoriesList.innerHTML = this.categories.length
      ? this.categories.map((cat) => this.getCategoryItem(cat)).join("")
      : '<p class="text-muted text-center py-4">No categories yet</p>';
  }

  static show(onCreate, onUpdate, onDelete, onRefresh) {
    return new CategoriesModal(onCreate, onUpdate, onDelete, onRefresh)
      .create()
      .show();
  }
}
