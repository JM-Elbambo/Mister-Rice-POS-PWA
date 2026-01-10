import { Modal } from "bootstrap";

const navLinks = [
  { path: "/dashboard", label: "Dashboard", icon: "speedometer2" },
  { path: "/cashier", label: "Cashier", icon: "cart-check" },
  { path: "/inventory", label: "Inventory", icon: "box-seam" },
  { path: "/purchase-order", label: "Purchase Order", icon: "cart-plus" },
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

  const actionButtons = `
    ${
      hasAccess
        ? `<span class="badge bg-success d-inline-flex align-items-center online-status">
            <i class="bi bi-wifi me-1"></i>Online
          </span>`
        : ""
    }
    <button class="theme-toggle btn btn-outline-secondary btn-sm" title="Toggle dark/light mode">
      <i class="bi bi-sun-fill light-icon"></i>
      <i class="bi bi-moon-fill dark-icon d-none"></i>
    </button>
    ${
      hasAccess
        ? `<button class="logout-btn btn btn-outline-danger btn-sm">
            <i class="bi bi-box-arrow-right me-1"></i>Logout
          </button>`
        : ""
    }
  `;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <nav class="navbar navbar-expand-xl bg-body border-bottom shadow-sm">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" href="#">
          <i class="bi bi-shop me-2"></i>Mister Rice POS
        </a>
        
        <div class="d-flex d-xl-none gap-2 align-items-center ms-auto">
          ${actionButtons}
          <button class="navbar-toggler ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
        </div>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            ${linksHTML}
          </ul>
          <div class="d-none d-xl-flex gap-3 align-items-center">
            ${actionButtons}
          </div>
        </div>
      </div>
    </nav>

    ${
      hasAccess
        ? `<header class="py-4 mb-4 bg-body border-bottom shadow-sm">
            <div class="container">
              <h1 class="h2 mb-0">
                <i class="bi bi-${activeLink.icon} me-2"></i>${activeLink.label}
              </h1>
            </div>
          </header>`
        : ""
    }
  `;

  initTheme(wrapper);
  if (hasAccess) {
    initOnlineStatus(wrapper);
    initLogout(wrapper);
  }

  return wrapper;
}

function initTheme(wrapper) {
  const toggles = wrapper.querySelectorAll(".theme-toggle");
  const lightIcons = wrapper.querySelectorAll(".light-icon");
  const darkIcons = wrapper.querySelectorAll(".dark-icon");

  let currentTheme = localStorage.getItem("theme") || "light";

  const updateTheme = (theme) => {
    document.documentElement.setAttribute("data-bs-theme", theme);

    const isDark = theme === "dark";
    lightIcons.forEach((icon) => icon.classList.toggle("d-none", isDark));
    darkIcons.forEach((icon) => icon.classList.toggle("d-none", !isDark));

    currentTheme = theme;
    localStorage.setItem("theme", theme);
  };

  updateTheme(currentTheme);

  toggles.forEach((btn) =>
    btn.addEventListener("click", () =>
      updateTheme(currentTheme === "light" ? "dark" : "light"),
    ),
  );
}

function initOnlineStatus(wrapper) {
  const badges = wrapper.querySelectorAll(".online-status");

  const updateStatus = () => {
    badges.forEach((badge) => {
      if (navigator.onLine) {
        badge.className =
          "badge bg-success d-inline-flex align-items-center online-status";
        badge.innerHTML = '<i class="bi bi-wifi me-1"></i>Online';
      } else {
        badge.className =
          "badge bg-warning text-dark d-inline-flex align-items-center online-status";
        badge.innerHTML = '<i class="bi bi-wifi-off me-1"></i>Offline';
      }
    });
  };

  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);
  updateStatus();
}

function initLogout(wrapper) {
  wrapper.querySelectorAll(".logout-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
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

      document.body.insertAdjacentHTML("beforeend", modalHTML);
      const modalEl = document.querySelector("#logoutModal");
      const modal = new Modal(modalEl);
      const confirmBtn = modalEl.querySelector("#confirmLogout");

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
            '<i class="bi bi-exclamation-triangle me-1"></i>Error';
          confirmBtn.classList.replace("btn-danger", "btn-warning");
          setTimeout(() => {
            confirmBtn.innerHTML =
              '<i class="bi bi-box-arrow-right me-1"></i>Sign Out';
            confirmBtn.classList.replace("btn-warning", "btn-danger");
            confirmBtn.disabled = false;
          }, 3000);
        }
      });

      modalEl.addEventListener("hidden.bs.modal", () => modalEl.remove());
      modal.show();
    }),
  );
}
