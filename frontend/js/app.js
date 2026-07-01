/**
 * ReceiptsAI — App Router
 *
 * Handles navigation, sidebar rendering, page switching,
 * and auth guard. This is the entry point after all modules load.
 */

const PAGES = ['dashboard', 'comprobantes', 'conductores', 'configuracion', 'pagar'];
const ADMIN_PAGES = ['conductores', 'configuracion'];
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
  const user = getStoredUser();
  const role = user?.role || 'admin';

  const navItems = [
    { id: "dashboard",     label: __("nav.dashboard"),     icon: "dashboard" },
    { id: "pagar",         label: __("nav.a_pagar"),       icon: "wallet" },
    { id: "comprobantes",  label: __("nav.comprobantes"),  icon: "receipt" },
  ];

  // Only admin/boss can see Conductores and Configuración
  if (role === "admin") {
    navItems.push({ id: "conductores",   label: __("nav.conductores"),   icon: "users" });
    navItems.push({ id: "configuracion", label: __("nav.configuracion"), icon: "settings" });
  }
  return `
    <div class="sidebar">
      <div class="sidebar-logo">
        <img src="assets/logo.svg" alt="" onerror="this.style.display='none'">
        ReceiptsAI
      </div>
      <nav class="sidebar-nav">
        ${navItems.map(item => `
          <a href="#${item.id}" class="${current === item.id ? 'active' : ''}" data-page="${item.id}">
            <span class="icon">${ICON[item.icon]}</span>
            ${item.label}
          </a>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <div style="font-size:0.8rem;color:var(--text-muted);">${getStoredUser()?.role || ''}</div>
        <button class="btn btn-sm btn-outline" id="logoutBtn">${__('nav.salir')}</button>

      </div>
    </div>
  `;
}

/**
 * Render the app layout (sidebar + header + main content area).
 */
function renderAppLayout(page) {
  const user = getStoredUser();
  const displayName = user?.company_name || user?.user_id?.slice(0, 8) || '';
  const avatarLetter = user?.company_name
    ? user.company_name.charAt(0).toUpperCase()
    : user?.user_id?.slice(0, 1).toUpperCase() || '?';

  const app = document.getElementById('app');
  app.className = '';
  app.innerHTML = `
    ${renderSidebar(page)}
    <div class="header">
      <div class="header-title" id="pageTitle">${getPageTitle(page)}</div>
      <div class="header-right">
        ${renderLangToggle()}
        <div class="header-user">
          <span>${displayName}</span>
          <div class="avatar">${avatarLetter}</div>
        </div>
      </div>
    </div>
    <div class="main-content">
      <div class="page active" id="pageContainer"></div>
    </div>
    <div class="toast-container" id="toastContainer"></div>
  `;

  // Language toggle event handlers
  initLangToggle();

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

  const user = getStoredUser();
  const role = user?.role || 'admin';

  // Validate page — drivers cannot access admin pages
  if (!PAGES.includes(hash) || (role !== 'admin' && ADMIN_PAGES.includes(hash))) {
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
    case 'pagar':
      renderPagar(container);
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
    dashboard: __('dashboard.title'),
    comprobantes: __('receipts.title'),
    conductores: __('drivers.title'),
    configuracion: __('settings.title'),
    pagar: __('pay.title'),

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
  const lang = typeof getLang === 'function' ? getLang() : 'es';
  const locale = lang === 'en' ? 'en-US' : 'es-MX';
  return parseFloat(amount).toLocaleString(locale, { style: 'currency', currency: lang === 'en' ? 'USD' : 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format date for display.
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const lang = typeof getLang === 'function' ? getLang() : 'es';
  return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Format datetime for display.
 */
function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const lang = typeof getLang === 'function' ? getLang() : 'es';
  return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
window.route = route;
