/**
 * ReceiptsAI — Comprobantes (Receipts) Page
 *
 * Fetches receipts from GET /receipts, renders a filterable table,
 * and shows a detail modal with the REAL receipt photo,
 * approve/reject/pay actions.
 */

async function renderComprobantes(container) {
  container.innerHTML = '<div class="loading"><div class="spinner"></div>Cargando comprobantes...</div>';

  try {
    const receipts = await apiCall('/receipts', { params: { limit: 200 } });
    const receiptsList = receipts || [];

    container.innerHTML = `
      <h1 class="page-title">Comprobantes</h1>
      <p class="page-subtitle">Todos los comprobantes fiscales de tu flotilla</p>

      <div class="filter-bar">
        <input type="text" class="form-input" id="searchInput" placeholder="Buscar por proveedor, empleado..." />
        <select class="form-select" id="statusFilter">
          <option value="">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobados</option>
          <option value="paid">Pagados</option>
          <option value="rejected">Rechazados</option>
        </select>
        <span style="font-size:0.85rem;color:var(--text-muted);margin-left:auto;">
          ${receiptsList.length} comprobantes
        </span>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Empleado</th>
              <th>Proveedor</th>
              <th>Fecha</th>
              <th>Categoría</th>
              <th class="text-right">Monto</th>
              <th>Estado</th>
              <th class="text-center">Detalle</th>
            </tr>
          </thead>
          <tbody id="receiptsBody">
            ${receiptsList.length === 0
              ? '<tr><td colspan="8" class="text-center" style="color:var(--text-muted);padding:32px;">No hay comprobantes registrados</td></tr>'
              : receiptsList.map(r => `
                <tr class="receipt-row" data-id="${r.id}">
                  <td class="font-mono">${r.id.slice(0, 8)}</td>
                  <td class="font-semibold">${escapeHtml(r.driver_name || '—')}</td>
                  <td>${escapeHtml(r.vendor_name || '—')}</td>
                  <td>${formatDate(r.receipt_date)}</td>
                  <td>${escapeHtml(r.category || '—')}</td>
                  <td class="text-right font-mono">${formatCurrency(r.amount)}</td>
                  <td><span class="badge ${r.status}">${r.status}</span></td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline view-detail-btn" data-id="${r.id}">Ver</button>
                  </td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Detail Modal -->
      <div class="modal-overlay" id="receiptModal">
        <div class="modal">
          <div class="modal-header">
            <h2 id="modalTitle">Detalle del comprobante</h2>
            <button class="modal-close" id="modalClose">&times;</button>
          </div>
          <div class="modal-body" id="modalBody">
            <div class="loading"><div class="spinner"></div></div>
          </div>
          <div class="modal-footer" id="modalFooter"></div>
        </div>
      </div>
    `;

    // --- Filter handlers ---
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');

    function filterTable() {
      const query = searchInput.value.toLowerCase().trim();
      const status = statusFilter.value;
      const rows = document.querySelectorAll('.receipt-row');
      let visible = 0;
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const rowStatus = row.querySelector('.badge')?.textContent?.toLowerCase() || '';
        const matchesSearch = !query || text.includes(query);
        const matchesStatus = !status || rowStatus === status;
        const show = matchesSearch && matchesStatus;
        row.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      // Update count
      const countEl = document.querySelector('.filter-bar span');
      if (countEl) countEl.textContent = `${visible} de ${rows.length} comprobantes`;
    }

    searchInput.addEventListener('input', filterTable);
    statusFilter.addEventListener('change', filterTable);

    // --- View detail modal ---
    const modal = document.getElementById('receiptModal');
    const modalBody = document.getElementById('modalBody');
    const modalFooter = document.getElementById('modalFooter');
    const modalTitle = document.getElementById('modalTitle');

    function openModal(receiptId) {
      const receipt = receiptsList.find(r => r.id === receiptId);
      if (!receipt) return;

      modalTitle.textContent = `Comprobante #${receipt.id.slice(0, 8)}`;
      modalBody.innerHTML = renderReceiptDetail(receipt);
      modalFooter.innerHTML = renderReceiptActions(receipt);
      modal.classList.add('active');

      // Action buttons — disable after first click to prevent double-submit
      modalFooter.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          btn.textContent = 'Procesando...';
          const action = btn.dataset.action;
          const notesInput = document.getElementById('rejectionNotes');
          const notes = notesInput ? notesInput.value.trim() : '';
          await updateReceiptStatus(receipt.id, action, notes);
        });
      });

      // Close modal
      document.getElementById('modalClose').addEventListener('click', closeModal);
      const closeBtn = document.getElementById('modalCloseBtn');
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    function closeModal() {
      modal.classList.remove('active');
    }

    document.querySelectorAll('.view-detail-btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.id));
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

  } catch (err) {
    container.innerHTML = `
      <h1 class="page-title">Comprobantes</h1>
      <p class="page-subtitle">Todos los comprobantes fiscales de tu flotilla</p>
      <div class="table-container" style="padding:40px;text-align:center;color:var(--danger);">
        <p>Error al cargar: ${escapeHtml(err.message)}</p>
        <button class="btn btn-primary" style="margin-top:12px;" onclick="route()">Reintentar</button>
      </div>
    `;
  }
}

/**
 * Render the receipt detail inside the modal body.
 */
function renderReceiptDetail(r) {
  const hasImage = r.image_url && r.image_url.length > 0;

  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
      <div>
        ${hasImage
          ? `<img src="${r.image_url}" alt="Comprobante" class="receipt-image" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
             <div class="receipt-image-placeholder" style="display:none;">No se pudo cargar la imagen</div>`
          : `<div class="receipt-image-placeholder">Sin foto disponible</div>`
        }
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
          <span class="badge ${r.status}">${r.status}</span>
        </div>
      </div>
      <div>
        <div class="form-group">
          <label>Proveedor</label>
          <div class="form-input" style="background:var(--bg);cursor:default;">${escapeHtml(r.vendor_name || '—')}</div>
        </div>
        <div class="form-group">
          <label>Monto</label>
          <div class="form-input" style="background:var(--bg);cursor:default;font-weight:700;">${formatCurrency(r.amount)}</div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Fecha</label>
            <div class="form-input" style="background:var(--bg);cursor:default;">${formatDate(r.receipt_date)}</div>
          </div>
          <div class="form-group">
            <label>Categoría</label>
            <div class="form-input" style="background:var(--bg);cursor:default;">${escapeHtml(r.category || '—')}</div>
          </div>
        </div>
        <div class="form-group">
          <label>Empleado</label>
          <div class="form-input" style="background:var(--bg);cursor:default;">${escapeHtml(r.driver_name || '—')}</div>
        </div>
        <div class="form-group">
          <label>Subido</label>
          <div class="form-input" style="background:var(--bg);cursor:default;">${formatDateTime(r.created_at)}</div>
        </div>
      </div>
    </div>
    ${r.status === 'rejected' || r.status === 'pending'
      ? `<div class="form-group" style="margin-top:16px;">
          <label for="rejectionNotes">Notas</label>
          <textarea class="form-textarea" id="rejectionNotes" placeholder="Agregar notas o motivo de rechazo...">${escapeHtml(r.notes || '')}</textarea>
        </div>`
      : r.notes
        ? `<div class="form-group" style="margin-top:16px;">
            <label>Notas</label>
            <div class="form-input" style="background:var(--bg);cursor:default;">${escapeHtml(r.notes)}</div>
          </div>`
        : ''
    }
  `;
}

/**
 * Render the modal footer action buttons based on receipt status.
 */
function renderReceiptActions(r) {
  const actions = [];
  if (r.status === 'pending') {
    actions.push('<button class="btn btn-success" data-action="approved">✓ Aprobar</button>');
    actions.push('<button class="btn btn-danger" data-action="rejected">✗ Rechazar</button>');
  } else if (r.status === 'approved') {
    actions.push('<button class="btn btn-primary" data-action="paid">💰 Marcar como pagado</button>');
    actions.push('<button class="btn btn-outline" data-action="rejected">✗ Rechazar</button>');
  }
  actions.push('<button class="btn btn-outline" id="modalCloseBtn">Cerrar</button>');
  return actions.join(' ');
}

/**
 * Update receipt status via PATCH /receipts/{id}/status.
 */
async function updateReceiptStatus(receiptId, newStatus, notes) {
  try {
    const adminId = getUserId();
    await apiCall(`/receipts/${receiptId}/status`, {
      method: 'PATCH',
      params: { admin_id: adminId },
      body: { status: newStatus, notes: notes || undefined },
    });
    showToast(`Comprobante ${newStatus === 'approved' ? 'aprobado' : newStatus === 'rejected' ? 'rechazado' : 'marcado como pagado'} exitosamente`, 'success');
    // Close modal and refresh the page
    document.getElementById('receiptModal').classList.remove('active');
    route();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}
