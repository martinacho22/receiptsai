/**
 * ReceiptsAI — API Client
 *
 * Single function for all API calls.
 * Injects JWT from localStorage, appends tenant_id to queries,
 * handles 401 → logout.
 */

const API_BASE = (window.__RECEIPTSAI_API_URL__ || 'http://localhost:8000').replace(/\/+$/, '');

/**
 * Make an authenticated API call.
 * @param {string} endpoint  e.g. "/receipts" or "/auth/login"
 * @param {object} options
 * @param {string} [options.method="GET"]
 * @param {object} [options.body]        — JSON-serializable object for POST/PATCH
 * @param {object} [options.params]      — query params merged in
 * @param {boolean} [options.auth=true]  — false for login/register
 * @returns {Promise<any>} parsed JSON response
 */
async function apiCall(endpoint, options = {}) {
  const { method = 'GET', body, params, auth = true } = options;

  // Build URL
  const url = new URL(API_BASE + endpoint);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }

  // Build headers
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = localStorage.getItem('receiptsai_token');
    if (!token) {
      // No token — redirect to login
      window.location.hash = '#login';
      throw new Error('No auth token');
    }
    headers['Authorization'] = `Bearer ${token}`;

    // If we have a tenant_id and no ?tenant_id in URL yet, add it
    const user = getStoredUser();
    if (user && user.tenant_id && !url.searchParams.has('tenant_id')) {
      url.searchParams.set('tenant_id', user.tenant_id);
    }
  }

  // Request
  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error(__( 'network_error' ));
  }

  // Handle 401
  if (response.status === 401) {
    localStorage.removeItem('receiptsai_token');
    localStorage.removeItem('receiptsai_user');
    window.location.hash = '#login';
    throw new Error(__( 'session_expired' ));
  }

  // Parse
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const msg = (data && data.detail) || (data && data.message) || `Error ${response.status}`;
    throw new Error(msg);
  }

  return data;
}

/**
 * Store user info (from login response) in localStorage.
 * FIXED: Backend returns { access_token, user: { id, tenant_id, company_name, role } }
 * — destructure from the nested 'user' object, not the top level.
 */
function storeLogin(response) {
  const { access_token, user } = response;
  if (!user || !user.id || !user.tenant_id) {
    throw new Error('Invalid login response: missing user data');
  }
  localStorage.setItem('receiptsai_token', access_token);
  localStorage.setItem('receiptsai_user', JSON.stringify({
    user_id: user.id,
    tenant_id: user.tenant_id,
    role: user.role,
    company_name: user.company_name || '',
  }));
}

/**
 * Get stored user info.
 */
function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('receiptsai_user'));
  } catch {
    return null;
  }
}

/**
 * Check if user is logged in.
 */
function isLoggedIn() {
  return !!localStorage.getItem('receiptsai_token') && !!getStoredUser();
}

/**
 * Logout — clear everything and redirect to login.
 */
function logout() {
  localStorage.removeItem('receiptsai_token');
  localStorage.removeItem('receiptsai_user');
  window.location.hash = '#login';
}

/**
 * Get the current tenant_id.
 */
function getTenantId() {
  const user = getStoredUser();
  return user ? user.tenant_id : null;
}

/**
 * Get the current user_id (for admin_id in status updates).
 */
function getUserId() {
  const user = getStoredUser();
  return user ? user.user_id : null;
}
