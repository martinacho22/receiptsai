/**
 * ReceiptsAI — Conductores (Drivers) Page
 *
 * Lists drivers from GET /drivers, adds via POST /drivers,
 * removes via DELETE /drivers/{id}.
 */

async function renderConductores(container) {
  container.innerHTML = `<div class="loading"><div class="spinner"></div>${__('loading')}</div>`;

  try {
    const drivers = await apiCall('/drivers');
    const driversList = drivers || [];

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
        <h1 class="page-title" style="margin-bottom:0;">${__('drivers.title')}</h1>
        <button class="btn btn-primary" id="addDriverBtn">${__('drivers.invite')}</button>
      </div>
      <p class="page-subtitle">${__('drivers.subtitle')}</p>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>${__('drivers.name')}</th>
              <th>${__('drivers.phone')}</th>
              <th>${__('drivers.email')}</th>
              <th class="text-center">${__('drivers.whatsapp')}</th>
              <th class="text-center">${__('drivers.receipts')}</th>
              <th class="text-center">${__('drivers.status')}</th>
              <th class="text-center">${__('drivers.action')}</th>
            </tr>
          </thead>
          <tbody>
            ${driversList.length === 0
              ? `<tr><td colspan="7" class="text-center" style="color:var(--text-muted);padding:32px;">${__('drivers.no_drivers')}</td></tr>`
              : driversList.map(d => `
                <tr data-id="${d.id}">
                  <td class="font-semibold">${escapeHtml(d.name)}</td>
                  <td>${escapeHtml(d.phone || '—')}</td>
                  <td>${escapeHtml(d.email || '—')}</td>
                  <td class="text-center">
                    <span class="badge" style="background:${d.whatsapp_subscribed !== false ? '#e8f5e9' : '#fce4ec'};color:${d.whatsapp_subscribed !== false ? '#2e7d32' : '#c62828'}">
                      <span style="display:inline-flex;align-items:center;gap:4px;">
                        ${d.whatsapp_subscribed !== false ? ICON.check : ICON.x}
                        ${d.whatsapp_subscribed !== false ? __('drivers.whatsapp_active') : __('drivers.whatsapp_inactive')}
                      </span>
                    </span>
                  </td>
                  <td class="text-center">${d.receipt_count || 0}</td>
                  <td class="text-center">
                    <span class="badge ${d.is_active ? 'approved' : 'rejected'}">${d.is_active ? __('drivers.active') : __('drivers.inactive')}</span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-danger remove-driver-btn" data-id="${d.id}" data-name="${escapeHtml(d.name)}">${__('drivers.remove')}</button>
                  </td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Add Driver Modal -->
      <div class="modal-overlay" id="addDriverModal">
        <div class="modal" style="max-width:480px;">
          <div class="modal-header">
            <h2>${__('drivers.modal_title')}</h2>
            <button class="modal-close" id="addModalClose">&times;</button>
          </div>
          <form id="addDriverForm">
            <div class="modal-body">
              <div class="form-group">
                <label for="driverName">${__('drivers.full_name')}</label>
                <input type="text" id="driverName" class="form-input" placeholder="${__('drivers.full_name_placeholder')}" required />
              </div>
              <div class="form-group">
                <label for="driverPhone">${__('drivers.phone_whatsapp')}</label>
                <input type="tel" id="driverPhone" class="form-input" placeholder="${__('drivers.phone_placeholder')}" required />
              </div>
              <div class="form-group">
                <label for="driverEmail">${__('drivers.email_optional')}</label>
                <input type="email" id="driverEmail" class="form-input" placeholder="${__('drivers.email_placeholder')}" />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" id="addModalCancel">${__('drivers.cancel')}</button>
              <button type="submit" class="btn btn-primary" id="addDriverSubmit">${__('drivers.invite')}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // --- Add driver modal ---
    const addModal = document.getElementById('addDriverModal');
    document.getElementById('addDriverBtn').addEventListener('click', () => {
      addModal.classList.add('active');
    });
    document.getElementById('addModalClose').addEventListener('click', () => addModal.classList.remove('active'));
    document.getElementById('addModalCancel').addEventListener('click', () => addModal.classList.remove('active'));
    addModal.addEventListener('click', (e) => {
      if (e.target === addModal) addModal.classList.remove('active');
    });

    // --- Add driver form submit ---
    document.getElementById('addDriverForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('addDriverSubmit');
      btn.disabled = true;
      btn.textContent = __('drivers.saving');
      try {
        const tenantId = getTenantId();
        await apiCall('/drivers', {
          method: 'POST',
          body: {
            tenant_id: tenantId,
            name: document.getElementById('driverName').value.trim(),
            phone: document.getElementById('driverPhone').value.trim(),
            email: document.getElementById('driverEmail').value.trim() || undefined,
          },
        });
        showToast(__('drivers.added_msg'), 'success');
        addModal.classList.remove('active');
        route(); // Refresh
      } catch (err) {
        showToast(`${__('error')} ${err.message}`, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = __('drivers.invite');
      }
    });

    // --- Remove driver ---
    document.querySelectorAll('.remove-driver-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const driverId = btn.dataset.id;
        const driverName = btn.dataset.name;
        if (!confirm(`${__('drivers.confirm_remove')} ${driverName}${__('drivers.remove_suffix')}`)) return;
        try {
          await apiCall(`/drivers/${driverId}`, { method: 'DELETE' });
          showToast(`${__('drivers.name')} ${driverName} ${__('drivers.removed_msg')}`, 'info');
          route(); // Refresh
        } catch (err) {
          showToast(`${__('error')} ${err.message}`, 'error');
        }
      });
    });

  } catch (err) {
    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
        <h1 class="page-title" style="margin-bottom:0;">${__('drivers.title')}</h1>
      </div>
      <p class="page-subtitle">${__('drivers.subtitle')}</p>
      <div class="table-container" style="padding:40px;text-align:center;color:var(--danger);">
        <p>${__('error_loading')} ${escapeHtml(err.message)}</p>
        <button class="btn btn-primary" style="margin-top:12px;" onclick="route()">${__('retry')}</button>
      </div>
    `;
  }
}
