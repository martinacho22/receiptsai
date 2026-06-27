/**
 * ReceiptsAI — Auth Module
 *
 * Login and register page rendering + form handling.
 */

function renderAuthPage() {
  const hash = window.location.hash || '#login';
  const isLogin = hash === '#login';

  const app = document.getElementById('app');
  app.className = 'auth-page';
  app.innerHTML = `
    <div class="auth-card">
      <div class="logo">
        <img src="assets/logo.svg" alt="ReceiptsAI" onerror="this.style.display='none'">
        <h1>ReceiptsAI</h1>
      </div>
      <h2>${isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</h2>
      <p class="subtitle">${isLogin ? 'Accede a tu panel de control' : 'Registra tu empresa para comenzar'}</p>
      <div class="auth-error" id="authError"></div>
      <form id="authForm">
        ${isLogin ? `
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input type="email" id="email" class="form-input" placeholder="admin@empresa.com" required autocomplete="email">
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" class="form-input" placeholder="••••••••" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn btn-primary" id="authBtn">Iniciar sesión</button>
        ` : `
          <div class="form-group">
            <label for="company">Nombre de la empresa</label>
            <input type="text" id="company" class="form-input" placeholder="Mi Empresa S.A. de C.V." required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="name">Nombre del administrador</label>
              <input type="text" id="name" class="form-input" placeholder="Juan Pérez" required>
            </div>
            <div class="form-group">
              <label for="phone">Teléfono</label>
              <input type="tel" id="phone" class="form-input" placeholder="+521234567890" required>
            </div>
          </div>
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input type="email" id="email" class="form-input" placeholder="admin@empresa.com" required>
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" class="form-input" placeholder="Mínimo 8 caracteres" required minlength="8">
          </div>
          <button type="submit" class="btn btn-primary" id="authBtn">Crear cuenta</button>
        `}
      </form>
      <div class="auth-link">
        ${isLogin
          ? '¿No tienes cuenta? <a href="#register">Regístrate</a>'
          : '¿Ya tienes cuenta? <a href="#login">Iniciar sesión</a>'}
      </div>
    </div>
  `;

  // Form submit
  document.getElementById('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('authError');
    const btn = document.getElementById('authBtn');
    errorEl.classList.remove('show');
    btn.disabled = true;
    btn.textContent = isLogin ? 'Entrando...' : 'Creando cuenta...';

    try {
      let data;
      if (isLogin) {
        data = await apiCall('/auth/login', {
          method: 'POST',
          auth: false,
          body: {
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
          },
        });
      } else {
        data = await apiCall('/auth/register', {
          method: 'POST',
          auth: false,
          body: {
            company_name: document.getElementById('company').value.trim(),
            admin_name: document.getElementById('name').value.trim(),
            admin_phone: document.getElementById('phone').value.trim(),
            admin_email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
          },
        });
      }

      // Both login and register now return AuthResponse with access_token + user
      storeLogin(data);
      navigateTo('dashboard');
    } catch (err) {
      errorEl.style.background = '';
      errorEl.style.color = '';
      errorEl.textContent = err.message;
      errorEl.classList.add('show');
    } finally {
      btn.disabled = false;
      btn.textContent = isLogin ? 'Iniciar sesión' : 'Crear cuenta';
    }
  });
}
