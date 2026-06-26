/**
 * ReceiptsAI — App Router
 *
 * Handles navigation, sidebar rendering, page switching,
 * and auth guard. This is the entry point after all modules load.
 */

const PAGES = ['dashboard', 'comprobantes', 'conductores', 'configuracion'];
let currentPage = null;

/**
 * Navigate to a page by name.
 */
function navigateTo(page) {
  if (page === 'login' || page === 'register') {
    window.location.hash = `#${page}`;
    return;
  }
  window.location.hash = `#${page}`;
}

/**
 * Render the sidebar navigation.
 */
function renderSidebar(current) {
  const navItems = [
    { id: 'dashboard',     label: 'Dashboard',        icon: '📊' },
    { id: 'comprobantes',  label: 'Comprobantes',     icon: '📄' },
    { id: 'conductores',   label: 'Conductores',      icon: '👤' },
    { id: 'configuracion', label: 'Configuración',    icon: '⚙️' },
  ];

  return `
    <div class="sidebar">
      <div class="sidebar-logo">
        <img src="assets/logo.svg" alt="" onerror="this.style.display='none'">
        ReceiptsAI
      </div>
      <nav class="sidebar-nav">
        ${navItems.map(item => `
          <a href="#${item.id}" class="${current === item.id ? 'active' : ''}" data-page="${item.id}">
            <span class="icon">${item.icon}</span>
            ${item.label}
          </a>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <span style="font-size:0.8rem;color:var(--text-muted)">${getStoredUser()?.role || ''}</span>
        <button class="btn btn-sm btn-outline" id="logoutBtn">Salir</button>
      </div>
    </div>
  `;
}

/**
 * Render the app layout (sidebar + header + main content area).
 */
function renderAppLayout(page) {
  const user = getStoredUser();
  const app = document.getElementById('app');
  app.className = '';
  app.innerHTML = `
    ${renderSidebar(page)}
    <div class="header">
      <div class="header-title" id="pageTitle">${getPageTitle(page)}</div>
      <div class="header-user">
        <span>${user ? user.user_id?.slice(0, 8) + '...' : ''}</span>
        <div class="avatar">${user ? user.user_id?.slice(0, 1).toUpperCase() : '?'}</div>
      </div>
    </div>
    <div class="main-content">
      <div class="page active" id="pageContainer"></div>
    </div>
    <div class="toast-container" id="toastContainer"></div>
  `;

  // Sidebar nav clicks
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const page = a.dataset.page;
      if (page) navigateTo(page);
    });
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', logout);

  return document.getElementById('pageContainer');
}

/**
 * Route handler — called on hash change and on initial load.
 */
function route() {
  let hash = window.location.hash.replace('#', '') || 'dashboard';

  // If not logged in, force to login
  if (!isLoggedIn()) {
    if (hash === 'register') {
      renderAuthPage();
      return;
    }
    renderAuthPage();
    return;
  }

  // If logged in but hash is login/register, redirect to dashboard
  if (hash === 'login' || hash === 'register') {
    hash = 'dashboard';
    window.location.hash = '#dashboard';
  }

  // Validate page
  if (!PAGES.includes(hash)) {
    hash = 'dashboard';
    window.location.hash = '#dashboard';
  }

  currentPage = hash;
  const container = renderAppLayout(hash);

  // Render the appropriate page
  switch (hash) {
    case 'dashboard':
      renderDashboard(container);
      break;
    case 'comprobantes':
      renderComprobantes(container);
      break;
    case 'conductores':
      renderConductores(container);
      break;
    case 'configuracion':
      renderConfiguracion(container);
      break;
  }
}

/**
 * Get page title for the header.
 */
function getPageTitle(page) {
  const titles = {
    dashboard: 'Dashboard',
    comprobantes: 'Comprobantes',
    conductores: 'Conductores',
    configuracion: 'Configuración',
  };
  return titles[page] || 'ReceiptsAI';
}

/**
 * Show a toast notification.
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Format currency amounts.
 */
function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '$0.00';
  return '$' + parseFloat(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format date for display.
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Format datetime for display.
 */
function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// --- Initialize ---
window.addEventListener('hashchange', route);
document.addEventListener('DOMContentLoaded', route);

// Also export for other modules
window.showToast = showToast;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.navigateTo = navigateTo;
