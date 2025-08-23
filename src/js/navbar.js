const navLinks = [
  { path: './pos.html', label: 'Point of Sale', icon: 'fa-cash-register' },
  { path: './inventory.html', label: 'Inventory', icon: 'fa-boxes' },
  { path: './transactions.html', label: 'Transactions', icon: 'fa-receipt' },
];

export function getNavbarHTML(activePath = '/pos.html') {
  const linksHTML = navLinks.map(link => `
    <li class="nav-item">
      <a class="nav-link ${link.path === activePath ? 'active' : ''}" href="${link.path}">
        <i class="fas ${link.icon} me-1"></i>${link.label}
      </a>
    </li>
  `).join('');
  const activeLink = navLinks.find(link => link.path === activePath) || navLinks[0];

  return `
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="#"><i class="fas fa-store me-2"></i>Rice Store POS</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          ${linksHTML}
        </ul>
        <div class="d-flex align-items-center">
          <span class="badge bg-success me-3">Online</span>
          <button class="btn theme-toggle" title="Toggle Theme">
            <i class="fas fa-sun"></i>
          </button>
        </div>
      </div>
    </div>
  </nav>

  <header class="page-header text-white py-3 mb-4">
    <div class="container">
      <div class="row align-items-center">
        <div class="col">
          <h1 class="mb-0">
            <i class="fas ${activeLink.icon} me-2"></i>${activeLink.label}
          </h1>
        </div>
      </div>
    </div>
  </header>
  `;
}
