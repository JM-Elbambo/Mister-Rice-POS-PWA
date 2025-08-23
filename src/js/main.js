// CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';

// JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Modules
import { getNavbarHTML } from './navbar.js';


function loadNavBar() {
  const navbarContainer = document.getElementById('component-navbar');
  if (!navbarContainer) return;

  navbarContainer.innerHTML = getNavbarHTML(window.location.pathname);

  // Attach event listener dynamically
  const toggleBtn = navbarContainer.querySelector('.theme-toggle');
  toggleBtn.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const themeIcon = document.getElementById('theme-icon');
    
    body.setAttribute('data-bs-theme', newTheme);
    themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

loadNavBar();
