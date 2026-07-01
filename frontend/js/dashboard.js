/**
 * ReceiptsAI — Dashboard Page
 *
 * Shows KPIs from GET /receipts/summary and per-driver breakdown
 * computed client-side from GET /receipts.
 */

async function renderDashboard(container) {
  container.innerHTML = `<div class="loading"><div class="spinner"></div>${__('loading')}</div>`;

  try {
    // Fetch summary and receipts in parallel; if either fails, show zeros gracefully
    let summary = { total_pending: 0, total_approved: 0, total_paid: 0, total_rejected: 0, pending_amount: 0, approved_amount: 0, paid_amount: 0, rejected_amount: 0 };
    let receipts = [];

    try {
      const s = await apiCall('/receipts/summary');
      if (s) summary = s;
    } catch {
      // Summary might 404 if no tenant data yet; show zeros
    }

    try {
      const r = await apiCall('/receipts', { params: { limit: 200 } });
      if (r) receipts = r;
    } catch {
      // No receipts yet
    }

    // Compute per-driver totals client-side
    const driverTotals = {};
    (receipts || []).forEach(r => {
      if (!driverTotals[r.driver_id]) {
        driverTotals[r.driver_id] = {
          driver_id: r.driver_id,
          driver_name: r.driver_name || __('driver.unnamed'),
          total: 0,
          pending: 0,
          approved: 0,
          paid: 0,
          rejected: 0,
          count: 0,
        };
      }
      const d = driverTotals[r.driver_id];
      d.total += (r.amount || 0);
      d.count += 1;
      if (r.status === 'pending') d.pending += (r.amount || 0);
      else if (r.status === 'approved') d.approved += (r.amount || 0);
      else if (r.status === 'paid') d.paid += (r.amount || 0);
      else if (r.status === 'rejected') d.rejected += (r.amount || 0);
    });

    const driverArray = Object.values(driverTotals);
    const totalCount = (receipts || []).length;

    container.innerHTML = `
      <h1 class="page-title">${__('dashboard.title')}</h1>
      <p class="page-subtitle">${__('dashboard.subtitle')}</p>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">${__('dashboard.pending')}</div>
          <div class="kpi-value" style="color:var(--warning)">${summary.total_pending || 0}</div>
          <div class="kpi-sub">${formatCurrency(summary.pending_amount)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">${__('dashboard.approved')}</div>
          <div class="kpi-value" style="color:var(--primary)">${summary.total_approved || 0}</div>
          <div class="kpi-sub">${formatCurrency(summary.approved_amount)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">${__('dashboard.paid')}</div>
          <div class="kpi-value" style="color:var(--success)">${summary.total_paid || 0}</div>
          <div class="kpi-sub">${formatCurrency(summary.paid_amount)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">${__('dashboard.rejected')}</div>
          <div class="kpi-value" style="color:var(--danger)">${summary.total_rejected || 0}</div>
          <div class="kpi-sub">${formatCurrency(summary.rejected_amount)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">${__('dashboard.active_drivers')}</div>
          <div class="kpi-value" style="color:var(--text)">${driverArray.length || '—'}</div>
          <div class="kpi-sub">${totalCount} ${__('dashboard.total_receipts')}</div>
        </div>
      </div>

      <h2 style="font-size:1.1rem;margin-bottom:12px;">${__('dashboard.employee_summary')}</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>${__("dashboard.employee")}</th>
              <th>${__("dashboard.receipts")}</th>
              <th class="text-right">${__("dashboard.total")}</th>
              <th class="text-right">${__("dashboard.pending_amount")}</th>
              <th class="text-right">${__("dashboard.approved_amount")}</th>
              <th class="text-right">${__("dashboard.paid_amount")}</th>
              <th class="text-right">${__("dashboard.rejected_amount")}</th>
            </tr>
          </thead>
          <tbody>
            ${driverArray.length === 0 ? `<tr><td colspan="7" class="text-center" style="color:var(--text-muted);padding:32px;">${__("dashboard.no_data")}</td></tr>` : ''}
            ${driverArray.map(d => `
              <tr>
                <td class="font-semibold">${escapeHtml(d.driver_name)}</td>
                <td>${d.count}</td>
                <td class="text-right font-mono">${formatCurrency(d.total)}</td>
                <td class="text-right font-mono">${formatCurrency(d.pending)}</td>
                <td class="text-right font-mono">${formatCurrency(d.approved)}</td>
                <td class="text-right font-mono">${formatCurrency(d.paid)}</td>
                <td class="text-right font-mono">${formatCurrency(d.rejected)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <h1 class="page-title">${__('dashboard.title')}</h1>
      <p class="page-subtitle">${__('dashboard.subtitle')}</p>
      <div class="table-container" style="padding:40px;text-align:center;color:var(--danger);">
        <p>${__('error_loading')} ${escapeHtml(err.message)}</p>
        <button class="btn btn-primary" style="margin-top:12px;" onclick="route()">${__('retry')}</button>
      </div>
    `;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
