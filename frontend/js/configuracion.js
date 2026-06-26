/**
 * ReceiptsAI — Configuración (Settings) Page
 *
 * Static display of company info and pricing plans.
 * No backend APIs to edit these yet — purely informative.
 */

function renderConfiguracion(container) {
  const user = getStoredUser();

  container.innerHTML = `
    <h1 class="page-title">Configuración</h1>
    <p class="page-subtitle">Información de tu cuenta y planes disponibles</p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
      <!-- Company Info -->
      <div class="table-container" style="padding:24px;">
        <h2 style="font-size:1.1rem;margin-bottom:16px;">Información de la empresa</h2>
        <div class="form-group">
          <label>ID de empresa (Tenant)</label>
          <div class="form-input" style="background:var(--bg);cursor:default;font-family:mono;font-size:0.8rem;">
            ${user ? user.tenant_id : '—'}
          </div>
        </div>
        <div class="form-group">
          <label>Plan actual</label>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="form-input" style="background:var(--bg);cursor:default;flex:1;">Profesional</div>
            <span class="badge approved">Activo</span>
          </div>
        </div>
        <div class="form-group">
          <label>Comprobantes este mes</label>
          <div class="form-input" style="background:var(--bg);cursor:default;">—</div>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label>Límite del plan</label>
          <div class="form-input" style="background:var(--bg);cursor:default;">500 comprobantes/mes</div>
        </div>
      </div>

      <!-- Usage -->
      <div class="table-container" style="padding:24px;">
        <h2 style="font-size:1.1rem;margin-bottom:16px;">Uso actual</h2>
        <div style="margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;font-size:0.9rem;margin-bottom:6px;">
            <span>Comprobantes este mes</span>
            <span class="font-semibold">— de 500</span>
          </div>
          <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:0%;background:var(--primary);border-radius:4px;"></div>
          </div>
        </div>
        <div style="margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;font-size:0.9rem;margin-bottom:6px;">
            <span>Conductores activos</span>
            <span class="font-semibold">—</span>
          </div>
        </div>
        <p style="font-size:0.85rem;color:var(--text-muted);">
          Los detalles de uso se actualizarán cuando el backend de facturación esté integrado.
        </p>
      </div>
    </div>

    <!-- Pricing Plans -->
    <h2 style="font-size:1.1rem;margin:32px 0 16px;">Planes disponibles</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;">
      ${renderPlanCard('Básico', '$400', 'Hasta 100 comprobantes/mes', 'Hasta 5 conductores', 'Soporte por correo', false)}
      ${renderPlanCard('Profesional', '$1,000', 'Hasta 500 comprobantes/mes', 'Hasta 20 conductores', 'Soporte prioritario', true)}
      ${renderPlanCard('Empresarial', '$2,500', 'Hasta 2,000 comprobantes/mes', 'Conductores ilimitados', 'Soporte 24/7', false)}
      ${renderPlanCard('Corporativo', '$5,000', 'Comprobantes ilimitados', 'Conductores ilimitados', 'Soporte dedicado + API', false)}
    </div>
  `;
}

function renderPlanCard(name, price, feature1, feature2, feature3, isCurrent) {
  return `
    <div class="table-container" style="padding:24px;text-align:center;${isCurrent ? 'border:2px solid var(--primary);' : ''}">
      <h3 style="font-size:1rem;margin-bottom:4px;">${name}</h3>
      <div style="font-size:2rem;font-weight:800;color:var(--primary);margin:8px 0;">${price}</div>
      <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:4px;">/mes</div>
      <ul style="list-style:none;padding:0;margin:16px 0;text-align:left;font-size:0.85rem;">
        <li style="padding:4px 0;">✓ ${feature1}</li>
        <li style="padding:4px 0;">✓ ${feature2}</li>
        <li style="padding:4px 0;">✓ ${feature3}</li>
      </ul>
      ${isCurrent
        ? '<span class="badge approved" style="padding:6px 16px;">Plan actual</span>'
        : '<button class="btn btn-outline btn-sm" disabled>Próximamente</button>'
      }
    </div>
  `;
}
