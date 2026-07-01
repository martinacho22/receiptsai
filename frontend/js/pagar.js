/**
 * ReceiptsAI — A Pagar (To Pay) Page
 *
 * Shows approved receipts grouped by driver, with a pay button
 * and payment history. Uses GET /receipts/summary/by-driver for the
 * employee pay table, and GET /receipts?status=paid for history.
 */

async function renderPagar(container) {
  container.innerHTML = `<div class="loading"><div class="spinner"></div>${__('pay.loading')}</div>`;

  try {
    // Fetch driver summary and paid receipts in parallel
    let drivers = [];
    let paidReceipts = [];

    try {
      const d = await apiCall('/receipts/summary/by-driver');
      if (d) drivers = d;
    } catch {
      // No data yet
    }

    try {
      const r = await apiCall('/receipts', { params: { status: 'paid', limit: 50 } });
      if (r) paidReceipts = r;
    } catch {
      // No paid receipts
    }

    const totalPendingToPay = drivers.reduce((sum, d) => sum + d.pending_to_pay, 0);
    const driversToPay = drivers.filter(d => d.pending_to_pay > 0);

    container.innerHTML = `
      <h1 class="page-title">${__('pay.title')}</h1>
      <p class="page-subtitle">${__('pay.subtitle_alt')}</p>

      <div class="alert alert-info" style="background:#e0f2f1;border:1px solid #b2dfdb;border-radius:8px;padding:12px 16px;margin-bottom:20px;display:flex;align-items:center;gap:8px;font-size:0.9rem;color:#095b5a;">
        <span style="font-size:1.2rem;">ℹ️</span>
        <span>${__('pay.employee_count', { count: driversToPay.length, amount: formatCurrency(totalPendingToPay) })}</span>
      </div>

      <div class="table-container" style="margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 16px 0;">
          <h2 style="font-size:1.1rem;font-weight:700;">${__('pay.pending_payment')}</h2>
          <input type="text" class="form-input" id="pagarSearch" placeholder="${__('pay.search_employee')}" style="max-width:240px;padding:8px 12px;" />
        </div>
        <table>
          <thead>
            <tr>
              <th>${__('pay.employee_header')}</th>
              <th class="text-right">${__('pay.approved_header')}</th>
              <th class="text-right">${__('pay.paid_header')}</th>
              <th class="text-right">${__('pay.pending_header')}</th>
              <th class="text-center">${__('pay.action_header')}</th>
            </tr>
          </thead>
          <tbody id="pagarBody">
            ${drivers.length === 0
              ? `<tr><td colspan="5" class="text-center" style="color:var(--text-muted);padding:32px;">${__('pay.no_pending_approved')}</td></tr>`
              : drivers.map(d => `
                <tr class="pagar-row" data-name="${escapeHtml(d.driver_name).toLowerCase()}">
                  <td class="font-semibold">${escapeHtml(d.driver_name)}</td>
                  <td class="text-right font-mono" style="color:var(--primary);">${formatCurrency(d.approved_amount)}</td>
                  <td class="text-right font-mono" style="color:var(--success);">${formatCurrency(d.paid_amount)}</td>
                  <td class="text-right font-mono ${d.pending_to_pay > 0 ? 'font-bold' : ''}" style="${d.pending_to_pay > 0 ? 'color:var(--warning);' : 'color:var(--text-muted);'}">
                    ${formatCurrency(d.pending_to_pay)}
                  </td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-success pay-driver-btn" data-driver-id="${d.driver_id}" data-driver-name="${escapeHtml(d.driver_name)}" ${d.pending_to_pay <= 0 ? 'disabled' : ''}>
                      ${__('pay.pay_btn')}
                    </button>
                  </td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>

      <div class="table-container">
        <div style="padding:16px 16px 0;">
          <h2 style="font-size:1.1rem;font-weight:700;">${__('pay.payment_history')}</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>${__('pay.employee_header')}</th>
              <th>${__('pay.amount_header')}</th>
              <th>${__('pay.paid_on_header')}</th>
              <th>${__('pay.receipt_header')}</th>
            </tr>
          </thead>
          <tbody>
            ${paidReceipts.length === 0
              ? `<tr><td colspan="4" class="text-center" style="color:var(--text-muted);padding:32px;">${__('pay.no_payments_yet')}</td></tr>`
              : paidReceipts.map(r => `
                <tr>
                  <td class="font-semibold">${escapeHtml(r.driver_name || '—')}</td>
                  <td class="text-right font-mono">${formatCurrency(r.amount)}</td>
                  <td>${formatDateTime(r.paid_at)}</td>
                  <td class="font-mono" style="font-size:0.8rem;">${r.id.slice(0, 8)}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // --- Search filter ---
    const searchInput = document.getElementById('pagarSearch');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase().trim();
        document.querySelectorAll('.pagar-row').forEach(row => {
          row.style.display = row.dataset.name.includes(q) ? '' : 'none';
        });
      });
    }

    // --- Pay driver buttons ---
    document.querySelectorAll('.pay-driver-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const driverId = btn.dataset.driverId;
        const driverName = btn.dataset.driverName;

        if (!confirm(__('pay.confirm_pay', { name: driverName }))) return;

        btn.disabled = true;
        btn.textContent = __('pay.processing');

        try {
          // Get all approved receipts for this driver
          const approvedReceipts = await apiCall('/receipts', {
            params: { driver_id: driverId, status: 'approved', limit: 200 }
          });

          if (!approvedReceipts || approvedReceipts.length === 0) {
            showToast(__('pay.no_approved_for', { name: driverName }), 'info');
            btn.disabled = false;
            btn.innerHTML = __('pay.pay_btn');
            return;
          }

          const receiptIds = approvedReceipts.map(r => r.id);
          const adminId = getUserId();

          await apiCall('/receipts/batch-pay', {
            method: 'POST',
            body: receiptIds,
            params: { admin_id: adminId },
          });

          showToast(__('pay.paid_success', { count: receiptIds.length, name: driverName }), 'success');

          // Refresh the page to reflect updated state
          route();
        } catch (err) {
          showToast(__('pay.pay_error', { message: err.message }), 'error');
          btn.disabled = false;
          btn.innerHTML = __('pay.pay_btn');
        }
      });
    });

  } catch (err) {
    container.innerHTML = `
      <h1 class="page-title">${__('pay.title')}</h1>
      <p class="page-subtitle">${__('pay.subtitle_alt')}</p>
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
