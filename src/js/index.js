// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import * as bootstrap from "bootstrap";

import { initRouter } from "./router";

window.bootstrap = bootstrap;

document.addEventListener("DOMContentLoaded", () => {
  initRouter();
});
