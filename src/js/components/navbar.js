const navLinks = [
	{ path: "/pos", label: "Point of Sale", icon: "cash" },
	{ path: "/inventory", label: "Inventory", icon: "box-seam" },
	{ path: "/transactions", label: "Transactions", icon: "receipt" },
];

export default function Navbar(activePath = "/pos", hideLinks = false) {
	const linksHTML = hideLinks
		? ""
		: navLinks
				.map(
					(link) => `
        <li class="nav-item">
          <a class="nav-link${
				link.path === activePath ? " active" : ""
			}" href="#${link.path}">
            <i class="bi bi-${link.icon} me-1"></i>${link.label}
          </a>
        </li>
      `
				)
				.join("");

	const activeLink =
		navLinks.find((l) => l.path === activePath) || navLinks[0];
	const iconClass = hideLinks ? "person" : activeLink.icon;
	const pageTitle = hideLinks ? "Welcome" : activeLink.label;

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
          <div class="d-flex align-items-center gap-3">
            ${!hideLinks ? '<span class="badge bg-success">Online</span>' : ""}
            <button id="themeToggle" class="btn btn-outline-secondary btn-sm rounded-pill">
              <i class="bi bi-sun-fill" id="lightIcon"></i>
              <i class="bi bi-moon-fill d-none" id="darkIcon"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>

    ${
		!hideLinks
			? `
            <header class="py-4 mb-4 bg-body border-bottom shadow-sm">
              <div class="container">
                <h1 class="h2 mb-0">
                <i class="bi bi-${iconClass} me-2"></i>${pageTitle}
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
			document.body.className = "bg-body-secondary";

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

	initTheme();
	return wrapper;
}
