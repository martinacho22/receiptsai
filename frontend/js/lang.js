/**
 * ReceiptsAI — Language / Internationalization Module
 *
 * Provides __() for translating UI strings and a language toggle.
 * Supports: 'es' (Spanish, default) and 'en' (English).
 * Preference is persisted in localStorage.
 */

const LANG_STORAGE_KEY = 'receiptsai_lang';

const TRANSLATIONS = {
  /* ── Nav & Layout ── */
  'nav.dashboard':        { es: 'Dashboard',     en: 'Dashboard' },
  'nav.comprobantes':     { es: 'Comprobantes',  en: 'Receipts' },
  'nav.conductores':      { es: 'Conductores',   en: 'Drivers' },
  'nav.configuracion':    { es: 'Configuración', en: 'Settings' },
  'nav.a_pagar':          { es: 'A Pagar',       en: 'To Pay' },
  'nav.salir':            { es: 'Salir',         en: 'Log out' },

  /* ── Auth (login/register) ── */
  'auth.login_title':     { es: 'Iniciar sesión',       en: 'Log in' },
  'auth.register_title':  { es: 'Crear cuenta',         en: 'Create account' },
  'auth.login_sub':       { es: 'Accede a tu panel de control', en: 'Access your control panel' },
  'auth.register_sub':    { es: 'Registra tu empresa para comenzar', en: 'Register your company to get started' },
  'auth.email':           { es: 'Correo electrónico',    en: 'Email' },
  'auth.password':        { es: 'Contraseña',            en: 'Password' },
  'auth.email_placeholder':   { es: 'admin@empresa.com', en: 'admin@company.com' },
  'auth.password_placeholder':{ es: '••••••••',          en: '••••••••' },
  'auth.login_btn':       { es: 'Iniciar sesión',       en: 'Log in' },
  'auth.login_loading':   { es: 'Entrando...',          en: 'Signing in…' },
  'auth.register_btn':    { es: 'Crear cuenta',         en: 'Create account' },
  'auth.register_loading':{ es: 'Creando cuenta...',    en: 'Creating account…' },
  'auth.company':         { es: 'Nombre de la empresa', en: 'Company name' },
  'auth.company_placeholder': { es: 'Mi Empresa S.A. de C.V.', en: 'My Company Inc.' },
  'auth.admin_name':      { es: 'Nombre del administrador', en: 'Administrator name' },
  'auth.admin_name_placeholder': { es: 'Juan Pérez',    en: 'John Doe' },
  'auth.phone':           { es: 'Teléfono',             en: 'Phone' },
  'auth.phone_placeholder':    { es: '+521234567890',   en: '+521234567890' },
  'auth.no_account':      { es: '¿No tienes cuenta?',   en: "Don't have an account?" },
  'auth.has_account':     { es: '¿Ya tienes cuenta?',   en: 'Already have an account?' },
  'auth.register_link':   { es: 'Regístrate',           en: 'Sign up' },
  'auth.login_link':      { es: 'Iniciar sesión',       en: 'Log in' },
  'auth.demo_btn':        { es: 'Demo — Probar con datos de ejemplo', en: 'Demo — Try with sample data' },

  /* ── Dashboard ── */
  'dashboard.title':      { es: 'Dashboard',    en: 'Dashboard' },
  'dashboard.subtitle':   { es: 'Resumen general de comprobantes', en: 'Receipt overview' },
  'dashboard.pending':    { es: 'Pendientes',           en: 'Pending' },
  'dashboard.approved':   { es: 'Aprobados',           en: 'Approved' },
  'dashboard.paid':       { es: 'Pagados',             en: 'Paid' },
  'dashboard.active_drivers': { es: 'Conductores activos', en: 'Active drivers' },
  'dashboard.total':      { es: 'Total',               en: 'Total' },
  'dashboard.pending_amount': { es: 'Pendiente',       en: 'Pending' },
  'dashboard.approved_amount': { es: 'Aprobado',       en: 'Approved' },
  'dashboard.paid_amount':    { es: 'Pagado',          en: 'Paid' },
  'dashboard.employee':   { es: 'Empleado',            en: 'Employee' },
  'dashboard.receipts':   { es: 'Comprobantes',        en: 'Receipts' },
  'dashboard.employee_summary': { es: 'Resumen por empleado', en: 'Summary by employee' },
  'dashboard.no_data':    { es: 'No hay datos de conductores — los comprobantes aparecerán aquí cuando los empleados envíen recibos', en: 'No driver data yet — receipts will appear here when employees submit them' },
  'dashboard.total_receipts': { es: 'comprobantes totales', en: 'total receipts' },

  /* ── Comprobantes (Receipts) ── */
  'receipts.title':       { es: 'Comprobantes',        en: 'Receipts' },
  'receipts.subtitle':    { es: 'Todos los comprobantes fiscales de tu flotilla', en: 'All tax receipts for your fleet' },
  'receipts.search':      { es: 'Buscar por proveedor, empleado...', en: 'Search by vendor, employee…' },
  'receipts.all_statuses':{ es: 'Todos los estados',   en: 'All statuses' },
  'receipts.pending':     { es: 'Pendientes',          en: 'Pending' },
  'receipts.approved':    { es: 'Aprobados',           en: 'Approved' },
  'receipts.paid':        { es: 'Pagados',             en: 'Paid' },
  'receipts.rejected':    { es: 'Rechazados',          en: 'Rejected' },
  'receipts.folio':       { es: 'Folio',               en: 'ID' },
  'receipts.employee':    { es: 'Empleado',            en: 'Employee' },
  'receipts.vendor':      { es: 'Proveedor',           en: 'Vendor' },
  'receipts.date':        { es: 'Fecha',               en: 'Date' },
  'receipts.category':    { es: 'Categoría',           en: 'Category' },
  'receipts.amount':      { es: 'Monto',               en: 'Amount' },
  'receipts.status':      { es: 'Estado',              en: 'Status' },
  'receipts.detail':      { es: 'Detalle',             en: 'Details' },
  'receipts.view':        { es: 'Ver',                 en: 'View' },
  'receipts.no_receipts': { es: 'No hay comprobantes registrados', en: 'No receipts registered' },
  'receipts.of':          { es: 'de',                  en: 'of' },
  'receipts.receipts':    { es: 'comprobantes',        en: 'receipts' },
  'receipts.detail_title':{ es: 'Detalle del comprobante', en: 'Receipt details' },
  'receipts.receipt_no':  { es: 'Comprobante #',       en: 'Receipt #' },
  'receipts.no_image':    { es: 'Sin foto disponible', en: 'No photo available' },
  'receipts.image_error': { es: 'No se pudo cargar la imagen', en: 'Could not load image' },
  'receipts.uploaded':    { es: 'Subido',              en: 'Uploaded' },
  'receipts.notes':       { es: 'Notas',               en: 'Notes' },
  'receipts.notes_placeholder': { es: 'Agregar notas o motivo de rechazo...', en: 'Add notes or rejection reason…' },
  'receipts.approve':     { es: 'Aprobar',             en: 'Approve' },
  'receipts.reject':      { es: 'Rechazar',            en: 'Reject' },
  'receipts.mark_paid':   { es: 'Marcar como pagado',  en: 'Mark as paid' },
  'receipts.close':       { es: 'Cerrar',              en: 'Close' },
  'receipts.processing':  { es: 'Procesando...',       en: 'Processing…' },
  'receipts.approved_msg':{ es: 'aprobado',            en: 'approved' },
  'receipts.rejected_msg':{ es: 'rechazado',           en: 'rejected' },
  'receipts.marked_paid': { es: 'marcado como pagado', en: 'marked as paid' },

  /* ── Conductores (Drivers) ── */
  'drivers.title':        { es: 'Conductores',         en: 'Drivers' },
  'drivers.subtitle':     { es: 'Gestiona los conductores de tu flotilla', en: 'Manage your fleet drivers' },
  'drivers.invite':       { es: '+ Invitar conductor', en: '+ Invite driver' },
  'drivers.name':         { es: 'Nombre',              en: 'Name' },
  'drivers.phone':        { es: 'Teléfono',            en: 'Phone' },
  'drivers.email':        { es: 'Correo',              en: 'Email' },
  'drivers.whatsapp':     { es: 'WhatsApp',            en: 'WhatsApp' },
  'drivers.receipts':     { es: 'Comprobantes',        en: 'Receipts' },
  'drivers.status':       { es: 'Estado',              en: 'Status' },
  'drivers.action':       { es: 'Acción',              en: 'Action' },
  'drivers.active':       { es: 'Activo',              en: 'Active' },
  'drivers.inactive':     { es: 'Inactivo',            en: 'Inactive' },
  'drivers.whatsapp_active':   { es: 'Activo',         en: 'Active' },
  'drivers.whatsapp_inactive': { es: 'Inactivo',       en: 'Inactive' },
  'drivers.no_drivers':   { es: 'No hay conductores registrados', en: 'No drivers registered' },
  'drivers.remove':       { es: 'Eliminar',            en: 'Remove' },
  'drivers.confirm_remove': { es: '¿Eliminar a',       en: 'Remove' },
  'drivers.remove_suffix':{ es: '? Los comprobantes existentes no se eliminarán.', en: '? Existing receipts will not be deleted.' },
  'drivers.added_msg':    { es: 'Conductor agregado exitosamente', en: 'Driver added successfully' },
  'drivers.removed_msg':  { es: 'eliminado',           en: 'removed' },
  'drivers.modal_title':  { es: 'Invitar conductor',   en: 'Invite driver' },
  'drivers.full_name':    { es: 'Nombre completo',     en: 'Full name' },
  'drivers.full_name_placeholder': { es: 'Juan Pérez', en: 'John Doe' },
  'drivers.phone_whatsapp': { es: 'Teléfono (WhatsApp)', en: 'Phone (WhatsApp)' },
  'drivers.phone_placeholder': { es: '+521234567890',  en: '+521234567890' },
  'drivers.email_optional': { es: 'Correo electrónico (opcional)', en: 'Email (optional)' },
  'drivers.email_placeholder': { es: 'juan@example.com', en: 'john@example.com' },
  'drivers.cancel':       { es: 'Cancelar',            en: 'Cancel' },
  'drivers.saving':       { es: 'Guardando...',        en: 'Saving…' },

  /* ── Pagar (Payments) ── */
  'pay.title':            { es: 'A Pagar',             en: 'To Pay' },
  'pay.subtitle':         { es: 'Comprobantes pendientes de pago por empleado', en: 'Pending payments by employee' },
  'pay.total_pending':    { es: 'Total pendiente',     en: 'Total pending' },
  'pay.pay':              { es: 'Pagar',               en: 'Pay' },
  'pay.pay_all':          { es: 'Pagar todo',          en: 'Pay all' },
  'pay.no_pending':       { es: 'No hay comprobantes pendientes de pago', en: 'No pending payments' },
  'pay.marked_paid':      { es: 'comprobante(s) marcado(s) como pagado(s)', en: 'receipt(s) marked as paid' },
  'pay.confirm_all':      { es: '¿Marcar todos los comprobantes como pagados?', en: 'Mark all receipts as paid?' },
  'pay.employee':         { es: 'Empleado',            en: 'Employee' },
  'pay.count':            { es: 'Comprobantes',        en: 'Receipts' },
  'pay.total':            { es: 'Total',               en: 'Total' },
  'pay.action':           { es: 'Acción',              en: 'Action' },

  /* ── Configuración (Settings) ── */
  'settings.title':       { es: 'Configuración',       en: 'Settings' },
  'settings.subtitle':    { es: 'Información de tu cuenta y planes disponibles', en: 'Your account info and available plans' },
  'settings.company_info':{ es: 'Información de la empresa', en: 'Company info' },
  'settings.company':     { es: 'Empresa',             en: 'Company' },
  'settings.tenant_id':   { es: 'ID de empresa (Tenant)', en: 'Company ID (Tenant)' },
  'settings.current_plan':{ es: 'Plan actual',         en: 'Current plan' },
  'settings.receipts_month': { es: 'Comprobantes este mes', en: 'Receipts this month' },
  'settings.plan_limit':  { es: 'Límite del plan',     en: 'Plan limit' },
  'settings.unlimited':   { es: 'Ilimitado',           en: 'Unlimited' },
  'settings.per_month':   { es: 'comprobantes/mes',    en: 'receipts/month' },
  'settings.usage':       { es: 'Uso actual',          en: 'Current usage' },
  'settings.active_drivers': { es: 'Conductores activos', en: 'Active drivers' },
  'settings.usage_note':  { es: 'Los límites de facturación se actualizan según tu plan de suscripción.', en: 'Billing limits update according to your subscription plan.' },
  'settings.plans':       { es: 'Planes disponibles',  en: 'Available plans' },
  'settings.per_month_suffix': { es: '/mes',           en: '/mo' },
  'settings.current_badge': { es: 'Plan actual',       en: 'Current plan' },
  'settings.coming_soon': { es: 'Próximamente',        en: 'Coming soon' },
  'settings.active':      { es: 'Activo',              en: 'Active' },
  'settings.trial':       { es: 'Prueba',              en: 'Trial' },

  /* ── Generic ── */
  'loading':              { es: 'Cargando...',         en: 'Loading…' },
  'error_loading':        { es: 'Error al cargar:',    en: 'Error loading:' },
  'retry':                { es: 'Reintentar',          en: 'Retry' },
  'success':              { es: 'éxito',               en: 'success' },
  'error':                { es: 'Error:',              en: 'Error:' },
  'session_expired':      { es: 'Sesión expirada — ingresa de nuevo', en: 'Session expired — please log in again' },
  'no_auth_token':        { es: 'No hay sesión activa', en: 'No active session' },
  'network_error':        { es: 'Error de red — ¿el servidor está encendido?', en: 'Network error — is the server running?' },

  /* ── Language toggle ── */
  'lang.es':              { es: 'ES',                  en: 'ES' },
  'lang.en':              { es: 'EN',                  en: 'EN' },
};

/**
 * Get the current language code ('es' or 'en').
 */
function getLang() {
  return localStorage.getItem(LANG_STORAGE_KEY) || 'es';
}

/**
 * Set the current language and persist it.
 */
function setLang(code) {
  if (code !== 'es' && code !== 'en') return;
  localStorage.setItem(LANG_STORAGE_KEY, code);
  // Reload the current route to re-render all text
  window.route();
}

/**
 * Translate a key into the current language.
 * Falls back to the key name if not found.
 */
function __(key) {
  const lang = getLang();
  const entry = TRANSLATIONS[key];
  if (!entry) return key; // fallback to key
  return entry[lang] || entry['es'] || key;
}

/**
 * Render the language toggle buttons (EN | ES).
 * Returns HTML string to inject into layout.
 */
function renderLangToggle() {
  const current = getLang();
  return `
    <div class="lang-toggle">
      <button class="lang-btn ${current === 'es' ? 'active' : ''}" data-lang="es" title="Español">ES</button>
      <button class="lang-btn ${current === 'en' ? 'active' : ''}" data-lang="en" title="English">EN</button>
    </div>
  `;
}

/**
 * Initialize the language toggle click handlers.
 * Call after DOM elements are rendered.
 */
function initLangToggle() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      setLang(lang);
      // Re-render the route — the route() function will redraw everything with new language
      window.route();
    });
  });
}

// Export public API
window.__ = __;
window.getLang = getLang;
window.setLang = setLang;
window.renderLangToggle = renderLangToggle;
window.initLangToggle = initLangToggle;
