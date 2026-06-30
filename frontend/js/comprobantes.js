/**
 * ReceiptsAI — Comprobantes (Receipts) Page
 *
 * Fetches receipts from GET /receipts, renders a filterable table,
 * and shows a detail modal with the REAL receipt photo,
 * approve/reject/pay actions.
 */

async function renderComprobantes(container) {
  container.innerHTML = `<div class="loading"><div class="spinner"></div>${__('loading')}</div>`;

  try {
    const receipts = await apiCall('/receipts', { params: { limit: 200 } });
    const receiptsList = receipts || [];

    container.innerHTML = `
      <h1 class="page-title">${__('receipts.title')}</h1>
      <p class="page-subtitle">${__('receipts.subtitle')}</p>

      <div class="filter-bar">
        <input type="text" class="form-input" id="searchInput" placeholder="${__('receipts.search')}" />
        <select class="form-select" id="statusFilter">
          <option value="">${__('receipts.all_statuses')}</option>
          <option value="pending">${__('receipts.pending')}</option>
          <option value="approved">${__('receipts.approved')}</option>
          <option value="paid">${__('receipts.paid')}</option>
          <option value="rejected">${__('receipts.rejected')}</option>
        </select>
        <button class="btn btn-sm btn-outline" id="exportCsvBtn">📥 Exportar CSV</button>
        <span style="font-size:0.85rem;color:var(--text-muted);margin-left:auto;">
          ${receiptsList.length} ${__('receipts.receipts')}
        </span>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>${__('receipts.folio')}</th>
              <th>${__('receipts.employee')}</th>
              <th>${__('receipts.vendor')}</th>
              <th>${__('receipts.date')}</th>
              <th>${__('receipts.category')}</th>
              <th class="text-right">${__('receipts.amount')}</th>
              <th>${__('receipts.status')}</th>
              <th class="text-center">${__('receipts.detail')}</th>
            </tr>
          </thead>
          <tbody id="receiptsBody">
            ${receiptsList.length === 0
              ? `<tr><td colspan="8" class="text-center" style="color:var(--text-muted);padding:32px;">${__('receipts.no_receipts')}</td></tr>`
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
                    <button class="btn btn-sm btn-outline view-detail-btn" data-id="${r.id}">${__('receipts.view')}</button>
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
            <h2 id="modalTitle">${__('receipts.detail_title')}</h2>
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
      if (countEl) countEl.textContent = `${visible} ${__('receipts.of')} ${rows.length} ${__('receipts.receipts')}`;
    }

    searchInput.addEventListener('input', filterTable);
    statusFilter.addEventListener('change', filterTable);

    // --- Export CSV ---
    document.getElementById('exportCsvBtn').addEventListener('click', () => {
      const rows = document.querySelectorAll('.receipt-row');
      const visibleRows = [];
      rows.forEach(row => {
        if (row.style.display !== 'none') {
          visibleRows.push(row);
        }
      });

      // Get full receipt data for visible rows
      const visibleIds = new Set();
      visibleRows.forEach(row => visibleIds.add(row.dataset.id));
      const visibleReceipts = receiptsList.filter(r => visibleIds.has(r.id));

      // Build CSV
      const headers = ['Folio', 'Empleado', 'Proveedor', 'Fecha', 'Categoria', 'Monto', 'Estado', 'Pagado el'];
      const csvRows = [headers.join(',')];

      visibleReceipts.forEach(r => {
        csvRows.push([
          r.id.slice(0, 8),
          `"${(r.driver_name || '').replace(/"/g, '""')}"`,
          `"${(r.vendor_name || '').replace(/"/g, '""')}"`,
          r.receipt_date || '',
          `"${(r.category || '').replace(/"/g, '""')}"`,
          r.amount || '',
          r.status,
          r.paid_at || '',
        ].join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprobantes_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('📥 CSV exportado', 'success');
    });

    // --- View detail modal ---
    const modal = document.getElementById('receiptModal');
    const modalBody = document.getElementById('modalBody');
    const modalFooter = document.getElementById('modalFooter');
    const modalTitle = document.getElementById('modalTitle');

    function openModal(receiptId) {
      const receipt = receiptsList.find(r => r.id === receiptId);
      if (!receipt) return;

      modalTitle.textContent = `${__('receipts.receipt_no')}${receipt.id.slice(0, 8)}`;
      modalBody.innerHTML = renderReceiptDetail(receipt);
      modalFooter.innerHTML = renderReceiptActions(receipt);
      modal.classList.add('active');

      // Action buttons — disable after first click to prevent double-submit
      modalFooter.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          btn.textContent = __('receipts.processing');
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
      <h1 class="page-title">${__('receipts.title')}</h1>
      <p class="page-subtitle">${__('receipts.subtitle')}</p>
      <div class="table-container" style="padding:40px;text-align:center;color:var(--danger);">
        <p>${__('error_loading')} ${escapeHtml(err.message)}</p>
        <button class="btn btn-primary" style="margin-top:12px;" onclick="route()">${__('retry')}</button>
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
             <div class="receipt-image-placeholder" style="display:none;">${__('receipts.image_error')}</div>`
          : `<div class="receipt-image-placeholder">${__('receipts.no_image')}</div>`
        }
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
          <span class="badge ${r.status}">${r.status}</span>
        </div>
      </div>
      <div>
        <div class="form-group">
          <label>${__('receipts.vendor')}</label>
          <div class="form-input" style="background:var(--bg);cursor:default;">${escapeHtml(r.vendor_name || '—')}</div>
        </div>
        <div class="form-group">
          <label>${__('receipts.amount')}</label>
          <div class="form-input" style="background:var(--bg);cursor:default;font-weight:700;">${formatCurrency(r.amount)}</div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>${__('receipts.date')}</label>
            <div class="form-input" style="background:var(--bg);cursor:default;">${formatDate(r.receipt_date)}</div>
          </div>
          <div class="form-group">
            <label>${__('receipts.category')}</label>
            <div class="form-input" style="background:var(--bg);cursor:default;">${escapeHtml(r.category || '—')}</div>
          </div>
        </div>
        <div class="form-group">
          <label>${__('receipts.employee')}</label>
          <div class="form-input" style="background:var(--bg);cursor:default;">${escapeHtml(r.driver_name || '—')}</div>
        </div>
        <div class="form-group">
          <label>${__('receipts.uploaded')}</label>
          <div class="form-input" style="background:var(--bg);cursor:default;">${formatDateTime(r.created_at)}</div>
        </div>
        ${r.status === 'paid' && r.paid_at
          ? `<div class="form-group">
              <label>Pagado el</label>
              <div class="form-input" style="background:var(--bg);cursor:default;color:var(--success);font-weight:600;">${formatDateTime(r.paid_at)}</div>
            </div>`
          : ''
        }
      </div>
    </div>
    ${r.status === 'rejected' || r.status === 'pending'
      ? `<div class="form-group" style="margin-top:16px;">
          <label for="rejectionNotes">${__('receipts.notes')}</label>
          <textarea class="form-textarea" id="rejectionNotes" placeholder="${__('receipts.notes_placeholder')}">${escapeHtml(r.notes || '')}</textarea>
        </div>`
      : r.notes
        ? `<div class="form-group" style="margin-top:16px;">
            <label>${__('receipts.notes')}</label>
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
    actions.push(`<button class="btn btn-success" data-action="approved">${ICON.check} ${__('receipts.approve')}</button>`);
    actions.push(`<button class="btn btn-danger" data-action="rejected">${ICON.x} ${__('receipts.reject')}</button>`);
  } else if (r.status === 'approved') {
    actions.push(`<button class="btn btn-primary" data-action="paid">${ICON.wallet} ${__('receipts.mark_paid')}</button>`);
    actions.push(`<button class="btn btn-outline" data-action="rejected">${ICON.x} ${__('receipts.reject')}</button>`);
  }
  actions.push(`<button class="btn btn-outline" id="modalCloseBtn">${__('receipts.close')}</button>`);
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
    const msgKey = newStatus === 'approved' ? 'receipts.approved_msg'
      : newStatus === 'rejected' ? 'receipts.rejected_msg'
      : 'receipts.marked_paid';
    showToast(`${__('receipts.comprobante')} ${__(msgKey)} ${__('success')}`, 'success');
    // Close modal and refresh the page
    document.getElementById('receiptModal').classList.remove('active');
    route();
  } catch (err) {
    showToast(`${__('error')} ${err.message}`, 'error');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
