// Firebase
import { auth } from "./firebase";
import { navigate } from "./router";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap";

auth.onAuthStateChanged((user) => {
  if (user) {
    navigate("/dashboard");
  } else {
    navigate("/signin");
  }
});
