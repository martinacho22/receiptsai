/**
 * ReceiptsAI — Configuración (Settings) Page
 *
 * Fetches usage data from /billing/usage for the current tenant.
 */

async function renderConfiguracion(container) {
  container.innerHTML = `<div class="loading"><div class="spinner"></div>${__('loading')}</div>`;

  try {
    const usage = await apiCall('/billing/usage');

    const user = getStoredUser();
    const receiptPct = usage.receipt_limit
      ? Math.min(100, Math.round((usage.receipt_count / usage.receipt_limit) * 100))
      : 0;

    container.innerHTML = `
      <h1 class="page-title">${__('settings.title')}</h1>
      <p class="page-subtitle">${__('settings.subtitle')}</p>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
        <!-- Company Info -->
        <div class="table-container" style="padding:24px;">
          <h2 style="font-size:1.1rem;margin-bottom:16px;">${__('settings.company_info')}</h2>
          <div class="form-group">
            <label>${__('settings.company')}</label>
            <div class="form-input" style="background:var(--bg);cursor:default;">
              ${escapeHtml(usage.company_name)}
            </div>
          </div>
          <div class="form-group">
            <label>${__('settings.tenant_id')}</label>
            <div class="form-input" style="background:var(--bg);cursor:default;font-family:monospace;font-size:0.8rem;">
              ${user ? user.tenant_id : '—'}
            </div>
          </div>
          <div class="form-group">
            <label>${__('settings.current_plan')}</label>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="form-input" style="background:var(--bg);cursor:default;flex:1;text-transform:capitalize;">
                ${usage.plan || 'Trial'}
              </div>
              <span class="badge ${usage.status === 'active' || usage.status === 'trialing' ? 'approved' : 'rejected'}">
                ${usage.status === 'active' ? __('settings.active') : usage.status === 'trialing' ? __('settings.trial') : usage.status}
              </span>
            </div>
          </div>
          <div class="form-group">
            <label>${__('settings.receipts_month')}</label>
            <div class="form-input" style="background:var(--bg);cursor:default;">${usage.receipt_count || 0}</div>
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label>${__('settings.plan_limit')}</label>
            <div class="form-input" style="background:var(--bg);cursor:default;">
              ${usage.receipt_limit ? `${usage.receipt_limit} ${__('settings.per_month')}` : __('settings.unlimited')}
            </div>
          </div>
        </div>

        <!-- Usage -->
        <div class="table-container" style="padding:24px;">
          <h2 style="font-size:1.1rem;margin-bottom:16px;">${__('settings.usage')}</h2>
          <div style="margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;font-size:0.9rem;margin-bottom:6px;">
              <span>${__('settings.receipts_month')}</span>
              <span class="font-semibold">${usage.receipt_count} ${__('receipts.of')} ${usage.receipt_limit || '∞'}</span>
            </div>
            <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;">
              <div style="height:100%;width:${receiptPct}%;background:${receiptPct > 80 ? 'var(--warning)' : receiptPct > 95 ? 'var(--danger)' : 'var(--primary)'};border-radius:4px;transition:width 0.3s;"></div>
            </div>
          </div>
          <div style="margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;font-size:0.9rem;margin-bottom:6px;">
              <span>${__('settings.active_drivers')}</span>
              <span class="font-semibold">${usage.driver_count} ${__('receipts.of')} ${usage.max_drivers}</span>
            </div>
            <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;">
              <div style="height:100%;width:${Math.min(100, Math.round((usage.driver_count / Math.max(1, usage.max_drivers)) * 100))}%;background:var(--primary);border-radius:4px;transition:width 0.3s;"></div>
            </div>
          </div>
          <p style="font-size:0.85rem;color:var(--text-muted);">
            ${__('settings.usage_note')}
          </p>
        </div>
      </div>

      <!-- Pricing Plans -->
      <h2 style="font-size:1.1rem;margin:32px 0 16px;">${__('settings.plans')}</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;">
        ${renderPlanCard(__('plan.basic'), '$400', __('plan.basic.feature1'), __('plan.basic.feature2'), __('plan.basic.feature3'), false, usage.plan)}
        ${renderPlanCard(__('plan.professional'), '$1,000', __('plan.pro.feature1'), __('plan.pro.feature2'), __('plan.pro.feature3'), true, usage.plan)}
        ${renderPlanCard(__('plan.enterprise'), '$2,500', __('plan.enterprise.feature1'), __('plan.enterprise.feature2'), __('plan.enterprise.feature3'), false, usage.plan)}
        ${renderPlanCard(__('plan.corporate'), '$5,000', __('plan.corporate.feature1'), __('plan.corporate.feature2'), __('plan.corporate.feature3'), false, usage.plan)}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <h1 class="page-title">${__('settings.title')}</h1>
      <p class="page-subtitle">${__('settings.subtitle')}</p>
      <div class="table-container" style="padding:40px;text-align:center;color:var(--danger);">
        <p>${__('error_loading')} ${escapeHtml(err.message)}</p>
        <button class="btn btn-primary" style="margin-top:12px;" onclick="route()">${__('retry')}</button>
      </div>
    `;
  }
}

function renderPlanCard(name, price, feature1, feature2, feature3, isCurrent, currentPlan) {
  const planKey = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const isActivePlan = currentPlan === planKey;

  return `
    <div class="table-container" style="padding:24px;text-align:center;${isActivePlan ? 'border:2px solid var(--primary);' : ''}">
      <h3 style="font-size:1rem;margin-bottom:4px;">${name}</h3>
      <div style="font-size:2rem;font-weight:800;color:var(--primary);margin:8px 0;">${price}</div>
      <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:4px;">${__('settings.per_month_suffix')}</div>
      <ul style="list-style:none;padding:0;margin:16px 0;text-align:left;font-size:0.85rem;">
        <li style="padding:4px 0;">${ICON.check} ${feature1}</li>
        <li style="padding:4px 0;">${ICON.check} ${feature2}</li>
        <li style="padding:4px 0;">${ICON.check} ${feature3}</li>
      </ul>
      ${isActivePlan
        ? `<span class="badge approved" style="padding:6px 16px;">${__('settings.current_badge')}</span>`
        : `<button class="btn btn-outline btn-sm" disabled>${__('settings.coming_soon')}</button>`
      }
    </div>
  `;
}
