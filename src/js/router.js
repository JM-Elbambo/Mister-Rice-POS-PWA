import { auth } from "./firebase";
import { dataStore } from "./store/index";

// Pages
import SigninPage from "./pages/Signin";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import DashboardPage from "./pages/Dashboard";
import CashierPage from "./pages/Cashier";
import InventoryPage from "./pages/Inventory";
import PurchaseOrderPage from "./pages/PurchaseOrderPage";
// import TransactionsPage from "./pages/Transactions";

// Components
import Navbar from "./components/Navbar";

const routes = {
  "/signin": SigninPage,
  "/unauthorized": UnauthorizedPage,
  "/dashboard": DashboardPage,
  "/cashier": CashierPage,
  //   "/transactions": TransactionsPage,
  "/inventory": InventoryPage,
  "/purchase-order": PurchaseOrderPage,
};

const routesWithoutAccess = new Set(["/signin", "/unauthorized"]);

export function initRouter() {
  // Set up listeners
  window.addEventListener("hashchange", router);
  auth.onAuthStateChanged((user) => {
    if (user) {
      dataStore.checkAccess().then((hasAccess) => {
        {
          location.hash = hasAccess ? "" : "/unauthorized";
          return;
        }
      });
    }
    router();
  });
}

export function navigate(path) {
  location.hash = path;
}

function router() {
  const user = auth.currentUser;
  let path = location.hash.replace("#", "") || "/dashboard";

  // Redirect away from signin if already logged in
  if (user && path === "/signin") {
    path = "/dashboard";
  }

  // Redirect to signin if not logged in
  if (!user && path !== "/signin") {
    path = "/signin";
  }

  const page = routes[path] || DashboardPage;
  const app = document.getElementById("app");

  // Render page
  app.innerHTML = "";
  app.appendChild(Navbar(path, !routesWithoutAccess.has(path)));
  app.appendChild(page());
}
