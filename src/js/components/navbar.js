import { Modal } from "bootstrap";

const navLinks = [
  { path: "/dashboard", label: "Dashboard", icon: "speedometer2" },
  { path: "/pos", label: "Point of Sale", icon: "cash-coin" },
  { path: "/inventory", label: "Inventory", icon: "box-seam" },
  { path: "/transactions", label: "Transactions", icon: "receipt" },
];

export default function Navbar(activePath = "/pos", hasAccess = true) {
  const linksHTML = hasAccess
    ? navLinks
        .map(
          (link) => `
        <li class="nav-item">
          <a class="nav-link${
            link.path === activePath ? " active" : ""
          }" href="#${link.path}">
            <i class="bi bi-${link.icon} me-1"></i>${link.label}
          </a>
        </li>
      `,
        )
        .join("")
    : "";

  const activeLink = navLinks.find((l) => l.path === activePath) || navLinks[0];

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <nav class="navbar navbar-expand-lg bg-body border-bottom shadow-sm">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" href="#">
          <i class="bi bi-shop me-2"></i>Mister Rice POS System
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            ${linksHTML}
          </ul>
          <div class="d-flex gap-3">
            ${
              hasAccess
                ? '<span class="badge bg-success d-inline-flex align-items-center">Online</span>'
                : ""
            }
            <button id="themeToggle" class="btn btn-outline-secondary btn-sm">
              <i class="bi bi-sun-fill" id="lightIcon"></i>
              <i class="bi bi-moon-fill d-none" id="darkIcon"></i>
            </button>
            ${
              hasAccess
                ? '<button id="logoutBtn" class="btn btn-outline-danger btn-sm"><i class="bi bi-box-arrow-right me-1"></i>Logout</button>'
                : ""
            }
          </div>
        </div>
      </div>
    </nav>

    ${
      hasAccess
        ? `
            <header class="py-4 mb-4 bg-body border-bottom shadow-sm">
              <div class="container">
                <h1 class="h2 mb-0">
                <i class="bi bi-${activeLink.icon} me-2"></i>${activeLink.label}
                </h1>
              </div>
            </header>
    `
        : ""
    }
  `;

  // Initialize theme system for SPA
  const initTheme = () => {
    const themeToggle = wrapper.querySelector("#themeToggle");
    const lightIcon = wrapper.querySelector("#lightIcon");
    const darkIcon = wrapper.querySelector("#darkIcon");

    if (!themeToggle || !lightIcon || !darkIcon) return;

    // Get saved theme or default to light
    let currentTheme = localStorage.getItem("theme") || "light";

    const updateTheme = (theme) => {
      // Set theme on document root for entire SPA
      document.documentElement.setAttribute("data-bs-theme", theme);

      // Update icons
      if (theme === "dark") {
        lightIcon.classList.add("d-none");
        darkIcon.classList.remove("d-none");
      } else {
        lightIcon.classList.remove("d-none");
        darkIcon.classList.add("d-none");
        theme = "light"; // normalize
      }

      currentTheme = theme;
      localStorage.setItem("theme", theme);
    };

    // Initialize theme
    updateTheme(currentTheme);

    // Theme toggle handler
    themeToggle.addEventListener("click", () => {
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      updateTheme(nextTheme);
    });
  };

  // Initialize logout handler
  const initLogout = () => {
    const logoutBtn = wrapper.querySelector("#logoutBtn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {
      showLogoutModal();
    });
  };

  // Bootstrap confirmation modal for logout
  const showLogoutModal = () => {
    // Remove any existing modal
    const existingModal = document.querySelector("#logoutModal");
    if (existingModal) existingModal.remove();

    // Create modal HTML
    const modalHTML = `
			<div class="modal fade" id="logoutModal" tabindex="-1">
				<div class="modal-dialog modal-dialog-centered modal-sm">
					<div class="modal-content">
						<div class="modal-header border-0 pb-0">
							<h5 class="modal-title">
								<i class="bi bi-box-arrow-right text-danger me-2"></i>Sign Out
							</h5>
							<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
						</div>
						<div class="modal-body pt-2">
							<p class="mb-0 text-muted">Are you sure you want to sign out?</p>
						</div>
						<div class="modal-footer border-0 pt-0">
							<button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
							<button type="button" class="btn btn-danger btn-sm" id="confirmLogout">
								<i class="bi bi-box-arrow-right me-1"></i>Sign Out
							</button>
						</div>
					</div>
				</div>
			</div>
		`;

    // Add modal to DOM
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Initialize Bootstrap modal
    const modalElement = document.querySelector("#logoutModal");
    const modal = new Modal(modalElement);

    // Handle confirm logout
    const confirmBtn = modalElement.querySelector("#confirmLogout");
    confirmBtn.addEventListener("click", async () => {
      confirmBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Signing out...';
      confirmBtn.disabled = true;

      try {
        const { auth } = await import("../firebase.js");
        const { signOut } = await import("firebase/auth");

        await signOut(auth);
        modal.hide();
      } catch (error) {
        console.error("Logout error:", error);
        confirmBtn.innerHTML =
          '<i class="bi bi-exclamation-triangle me-1"></i>Error - Try Again';
        confirmBtn.classList.remove("btn-danger");
        confirmBtn.classList.add("btn-warning");
        setTimeout(() => {
          confirmBtn.innerHTML =
            '<i class="bi bi-box-arrow-right me-1"></i>Sign Out';
          confirmBtn.classList.remove("btn-warning");
          confirmBtn.classList.add("btn-danger");
          confirmBtn.disabled = false;
        }, 3000);
      }
    });

    // Clean up modal after it's hidden
    modalElement.addEventListener("hidden.bs.modal", () => {
      modalElement.remove();
    });

    modal.show();
  };

  initTheme();
  initLogout();
  return wrapper;
}
