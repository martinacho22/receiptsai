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
      <div class="auth-lang-toggle" style="text-align:right;margin-bottom:8px;">
        ${renderLangToggle()}
      </div>
      <div class="logo">
        <img src="assets/logo.svg" alt="ReceiptsAI" onerror="this.style.display='none'">
        <h1>ReceiptsAI</h1>
      </div>
      <h2>${isLogin ? __('auth.login_title') : __('auth.register_title')}</h2>
      <p class="subtitle">${isLogin ? __('auth.login_sub') : __('auth.register_sub')}</p>
      <div class="auth-error" id="authError"></div>
      <form id="authForm">
        ${isLogin ? `
          <div class="form-group">
            <label for="email">${__('auth.email')}</label>
            <input type="email" id="email" class="form-input" placeholder="${__('auth.email_placeholder')}" required autocomplete="email">
          </div>
          <div class="form-group">
            <label for="password">${__('auth.password')}</label>
            <input type="password" id="password" class="form-input" placeholder="${__('auth.password_placeholder')}" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn btn-primary" id="authBtn">${__('auth.login_btn')}</button>
        ` : `
          <div class="form-group">
            <label for="company">${__('auth.company')}</label>
            <input type="text" id="company" class="form-input" placeholder="${__('auth.company_placeholder')}" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="name">${__('auth.admin_name')}</label>
              <input type="text" id="name" class="form-input" placeholder="${__('auth.admin_name_placeholder')}" required>
            </div>
            <div class="form-group">
              <label for="phone">${__('auth.phone')}</label>
              <input type="tel" id="phone" class="form-input" placeholder="${__('auth.phone_placeholder')}" required>
            </div>
          </div>
          <div class="form-group">
            <label for="email">${__('auth.email')}</label>
            <input type="email" id="email" class="form-input" placeholder="${__('auth.email_placeholder')}" required>
          </div>
          <div class="form-group">
            <label for="password">${__('auth.password')}</label>
            <input type="password" id="password" class="form-input" placeholder="Mínimo 8 caracteres" required minlength="8">
          </div>
          <button type="submit" class="btn btn-primary" id="authBtn">${__('auth.register_btn')}</button>
        `}
      </form>
      <div style="margin-top:12px;">
        <button class="btn btn-outline" id="demoBtn" style="width:100%;font-size:0.85rem;">${__('auth.demo_btn')}</button>
      </div>
      <div class="auth-link">
        ${isLogin
          ? `${__('auth.no_account')} <a href="#register">${__('auth.register_link')}</a>`
          : `${__('auth.has_account')} <a href="#login">${__('auth.login_link')}</a>`}
      </div>
    </div>
  `;

  // Initialize language toggle
  initLangToggle();

  // Demo login button
  document.getElementById('demoBtn').addEventListener('click', async () => {
    const errorEl = document.getElementById('authError');
    errorEl.classList.remove('show');
    try {
      const data = await apiCall('/auth/demo-login', {
        method: 'POST',
        auth: false,
      });
      storeLogin(data);
      navigateTo('dashboard');
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add('show');
    }
  });

  // Form submit
  document.getElementById('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('authError');
    const btn = document.getElementById('authBtn');
    errorEl.classList.remove('show');
    btn.disabled = true;
    btn.textContent = isLogin ? __('auth.login_loading') : __('auth.register_loading');

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

      storeLogin(data);
      navigateTo('dashboard');
    } catch (err) {
      errorEl.style.background = '';
      errorEl.style.color = '';
      errorEl.textContent = err.message;
      errorEl.classList.add('show');
    } finally {
      btn.disabled = false;
      btn.textContent = isLogin ? __('auth.login_btn') : __('auth.register_btn');
    }
  });
}
