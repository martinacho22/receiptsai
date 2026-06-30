/**
 * ReceiptsAI — A Pagar (To Pay) Page
 *
 * Shows approved receipts grouped by driver, with a pay button
 * and payment history. Uses GET /receipts/summary/by-driver for the
 * employee pay table, and GET /receipts?status=paid for history.
 */

async function renderPagar(container) {
  container.innerHTML = '<div class="loading"><div class="spinner"></div>Cargando sección de pagos...</div>';

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
      <h1 class="page-title">A Pagar</h1>
      <p class="page-subtitle">Comprobantes aprobados listos para liquidar</p>

      <div class="alert alert-info" style="background:#e0f2f1;border:1px solid #b2dfdb;border-radius:8px;padding:12px 16px;margin-bottom:20px;display:flex;align-items:center;gap:8px;font-size:0.9rem;color:#095b5a;">
        <span style="font-size:1.2rem;">ℹ️</span>
        <span><strong>${driversToPay.length}</strong> empleado${driversToPay.length !== 1 ? 's' : ''} con <strong>${formatCurrency(totalPendingToPay)}</strong> pendiente de pago</span>
      </div>

      <div class="table-container" style="margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 16px 0;">
          <h2 style="font-size:1.1rem;font-weight:700;">Pendientes de pago</h2>
          <input type="text" class="form-input" id="pagarSearch" placeholder="Buscar empleado..." style="max-width:240px;padding:8px 12px;" />
        </div>
        <table>
          <thead>
            <tr>
              <th>Empleado</th>
              <th class="text-right">Aprobado</th>
              <th class="text-right">Pagado</th>
              <th class="text-right">Pendiente de pago</th>
              <th class="text-center">Acción</th>
            </tr>
          </thead>
          <tbody id="pagarBody">
            ${drivers.length === 0
              ? '<tr><td colspan="5" class="text-center" style="color:var(--text-muted);padding:32px;">No hay comprobantes aprobados pendientes de pago</td></tr>'
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
                      💰 Pagar
                    </button>
                  </td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>

      <div class="table-container">
        <div style="padding:16px 16px 0;">
          <h2 style="font-size:1.1rem;font-weight:700;">Historial de pagos</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Monto</th>
              <th>Pagado el</th>
              <th>Comprobante</th>
            </tr>
          </thead>
          <tbody>
            ${paidReceipts.length === 0
              ? '<tr><td colspan="4" class="text-center" style="color:var(--text-muted);padding:32px;">Aún no hay pagos registrados</td></tr>'
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

        if (!confirm(`¿Confirmas que deseas pagar todos los comprobantes aprobados de ${driverName}?`)) return;

        btn.disabled = true;
        btn.textContent = 'Procesando...';

        try {
          // Get all approved receipts for this driver
          const approvedReceipts = await apiCall('/receipts', {
            params: { driver_id: driverId, status: 'approved', limit: 200 }
          });

          if (!approvedReceipts || approvedReceipts.length === 0) {
            showToast(`${escapeHtml(driverName)} no tiene comprobantes aprobados pendientes`, 'info');
            btn.disabled = false;
            btn.innerHTML = '💰 Pagar';
            return;
          }

          const receiptIds = approvedReceipts.map(r => r.id);
          const adminId = getUserId();

          await apiCall('/receipts/batch-pay', {
            method: 'POST',
            body: receiptIds,
            params: { admin_id: adminId },
          });

          showToast(`✅ Pago registrado — ${receiptIds.length} comprobante${receiptIds.length !== 1 ? 's' : ''} de ${escapeHtml(driverName)}`, 'success');

          // Refresh the page to reflect updated state
          route();
        } catch (err) {
          showToast(`Error al procesar pago: ${err.message}`, 'error');
          btn.disabled = false;
          btn.innerHTML = '💰 Pagar';
        }
      });
    });

  } catch (err) {
    container.innerHTML = `
      <h1 class="page-title">A Pagar</h1>
      <p class="page-subtitle">Comprobantes aprobados listos para liquidar</p>
      <div class="table-container" style="padding:40px;text-align:center;color:var(--danger);">
        <p>Error al cargar: ${escapeHtml(err.message)}</p>
        <button class="btn btn-primary" style="margin-top:12px;" onclick="route()">Reintentar</button>
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
