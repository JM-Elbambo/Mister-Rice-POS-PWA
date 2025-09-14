import { auth } from "./firebase";

// Pages
import SigninPage from "./pages/signin";
import DashboardPage from "./pages/dashboard";
// import POSPage from "./components/pos";
// import TransactionsPage from "./components/transactions";
// import InventoryPage from "./components/inventory";

// Components
import Navbar from "./components/navbar";

const routes = {
	"/signin": SigninPage,
	"/dashboard": DashboardPage,
	//   "/pos": POSPage,
	//   "/transactions": TransactionsPage,
	//   "/inventory": InventoryPage,
};

function router() {
	const path = location.hash.replace("#", "") || "/signin";
	const page = routes[path] || DashboardPage;
	const app = document.getElementById("app");
	const user = auth.currentUser;

	app.innerHTML = "";

	// Redirect away from signin if already logged in
	if (path === "/signin" && user) {
		location.hash = "/dashboard";
		return;
	}

	// Redirect to signin if not logged in
	if (path !== "/signin" && !user) {
		location.hash = "/signin";
		return;
	}

	const hideLinks = path === "/signin";

	// Render navbar (always present, hide links on signin)
	app.appendChild(Navbar(path, hideLinks));

	// Render page content
	app.appendChild(page());
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);

export function navigate(path) {
	location.hash = path;
}
