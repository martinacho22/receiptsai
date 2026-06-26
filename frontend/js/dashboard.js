/**
 * ReceiptsAI — Dashboard Page
 *
 * Shows KPIs from GET /receipts/summary and per-driver breakdown
 * computed client-side from GET /receipts.
 */

async function renderDashboard(container) {
  container.innerHTML = '<div class="loading"><div class="spinner"></div>Cargando dashboard...</div>';

  try {
    const [summary, receipts] = await Promise.all([
      apiCall('/receipts/summary'),
      apiCall('/receipts', { params: { limit: 200 } }),
    ]);

    // Compute per-driver totals client-side
    const driverTotals = {};
    (receipts || []).forEach(r => {
      if (!driverTotals[r.driver_id]) {
        driverTotals[r.driver_id] = {
          driver_id: r.driver_id,
          driver_name: r.driver_name || 'Sin nombre',
          total: 0,
          pending: 0,
          approved: 0,
          paid: 0,
          count: 0,
        };
      }
      const d = driverTotals[r.driver_id];
      d.total += (r.amount || 0);
      d.count += 1;
      if (r.status === 'pending') d.pending += (r.amount || 0);
      else if (r.status === 'approved') d.approved += (r.amount || 0);
      else if (r.status === 'paid') d.paid += (r.amount || 0);
    });

    const driverArray = Object.values(driverTotals);

    container.innerHTML = `
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Resumen general de comprobantes</p>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Pendientes</div>
          <div class="kpi-value" style="color:var(--warning)">${summary.total_pending || 0}</div>
          <div class="kpi-sub">${formatCurrency(summary.pending_amount)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Aprobados</div>
          <div class="kpi-value" style="color:var(--primary)">${summary.total_approved || 0}</div>
          <div class="kpi-sub">${formatCurrency(summary.approved_amount)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Pagados</div>
          <div class="kpi-value" style="color:var(--success)">${summary.total_paid || 0}</div>
          <div class="kpi-sub">${formatCurrency(summary.paid_amount)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Conductores activos</div>
          <div class="kpi-value" style="color:var(--text)">${driverArray.length}</div>
          <div class="kpi-sub">${(receipts || []).length} comprobantes totales</div>
        </div>
      </div>

      <h2 style="font-size:1.1rem;margin-bottom:12px;">Resumen por empleado</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Comprobantes</th>
              <th class="text-right">Total</th>
              <th class="text-right">Pendiente</th>
              <th class="text-right">Aprobado</th>
              <th class="text-right">Pagado</th>
            </tr>
          </thead>
          <tbody>
            ${driverArray.length === 0 ? '<tr><td colspan="6" class="text-center" style="color:var(--text-muted);padding:32px;">No hay datos de conductores</td></tr>' : ''}
            ${driverArray.map(d => `
              <tr>
                <td class="font-semibold">${escapeHtml(d.driver_name)}</td>
                <td>${d.count}</td>
                <td class="text-right font-mono">${formatCurrency(d.total)}</td>
                <td class="text-right font-mono">${formatCurrency(d.pending)}</td>
                <td class="text-right font-mono">${formatCurrency(d.approved)}</td>
                <td class="text-right font-mono">${formatCurrency(d.paid)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Resumen general de comprobantes</p>
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
