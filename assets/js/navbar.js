document.addEventListener("DOMContentLoaded", () => {
  const navbarPlaceholder = document.getElementById("component-navbar");
  if (!navbarPlaceholder) return;

  // Load the navbar HTML
  fetch("/components/navbar.html")
    .then(response => response.text())
    .then(html => {
      navbarPlaceholder.innerHTML = html;

      // Highlight the active link based on current URL
      const currentPath = window.location.pathname;
      const links = navbarPlaceholder.querySelectorAll("a.nav-link");

      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        if (link.getAttribute("href") === currentPath) {
          link.classList.add("active");
          break;
        }
      }
    })
    .catch(error => console.error("Failed to load navbar:", error));
});
