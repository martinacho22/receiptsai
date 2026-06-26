/**
 * ReceiptsAI — Conductores (Drivers) Page
 *
 * Lists drivers from GET /drivers, adds via POST /drivers,
 * removes via DELETE /drivers/{id}.
 */

async function renderConductores(container) {
  container.innerHTML = '<div class="loading"><div class="spinner"></div>Cargando conductores...</div>';

  try {
    const drivers = await apiCall('/drivers');
    const driversList = drivers || [];

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
        <h1 class="page-title" style="margin-bottom:0;">Conductores</h1>
        <button class="btn btn-primary" id="addDriverBtn">+ Invitar conductor</button>
      </div>
      <p class="page-subtitle">Gestiona los conductores de tu flotilla</p>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th class="text-center">WhatsApp</th>
              <th class="text-center">Comprobantes</th>
              <th class="text-center">Estado</th>
              <th class="text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${driversList.length === 0
              ? '<tr><td colspan="7" class="text-center" style="color:var(--text-muted);padding:32px;">No hay conductores registrados</td></tr>'
              : driversList.map(d => `
                <tr data-id="${d.id}">
                  <td class="font-semibold">${escapeHtml(d.name)}</td>
                  <td>${escapeHtml(d.phone || '—')}</td>
                  <td>${escapeHtml(d.email || '—')}</td>
                  <td class="text-center">
                    <span class="badge" style="background:${d.whatsapp_subscribed !== false ? '#e8f5e9' : '#fce4ec'};color:${d.whatsapp_subscribed !== false ? '#2e7d32' : '#c62828'}">
                      ${d.whatsapp_subscribed !== false ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                  </td>
                  <td class="text-center">${d.receipt_count || 0}</td>
                  <td class="text-center">
                    <span class="badge ${d.is_active ? 'approved' : 'rejected'}">${d.is_active ? 'Activo' : 'Inactivo'}</span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-danger remove-driver-btn" data-id="${d.id}" data-name="${escapeHtml(d.name)}">Eliminar</button>
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
            <h2>Invitar conductor</h2>
            <button class="modal-close" id="addModalClose">&times;</button>
          </div>
          <form id="addDriverForm">
            <div class="modal-body">
              <div class="form-group">
                <label for="driverName">Nombre completo</label>
                <input type="text" id="driverName" class="form-input" placeholder="Juan Pérez" required />
              </div>
              <div class="form-group">
                <label for="driverPhone">Teléfono (WhatsApp)</label>
                <input type="tel" id="driverPhone" class="form-input" placeholder="+521234567890" required />
              </div>
              <div class="form-group">
                <label for="driverEmail">Correo electrónico <span style="color:var(--text-muted);font-size:0.8rem;">(opcional)</span></label>
                <input type="email" id="driverEmail" class="form-input" placeholder="juan@example.com" />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" id="addModalCancel">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="addDriverSubmit">Invitar</button>
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
      btn.textContent = 'Guardando...';
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
        showToast('Conductor agregado exitosamente', 'success');
        addModal.classList.remove('active');
        route(); // Refresh
      } catch (err) {
        showToast(`Error: ${err.message}`, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Invitar';
      }
    });

    // --- Remove driver ---
    document.querySelectorAll('.remove-driver-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const driverId = btn.dataset.id;
        const driverName = btn.dataset.name;
        if (!confirm(`¿Eliminar a ${driverName}? Los comprobantes existentes no se eliminarán.`)) return;
        try {
          await apiCall(`/drivers/${driverId}`, { method: 'DELETE' });
          showToast(`Conductor ${driverName} eliminado`, 'info');
          route(); // Refresh
        } catch (err) {
          showToast(`Error: ${err.message}`, 'error');
        }
      });
    });

  } catch (err) {
    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
        <h1 class="page-title" style="margin-bottom:0;">Conductores</h1>
      </div>
      <p class="page-subtitle">Gestiona los conductores de tu flotilla</p>
      <div class="table-container" style="padding:40px;text-align:center;color:var(--danger);">
        <p>Error al cargar: ${escapeHtml(err.message)}</p>
        <button class="btn btn-primary" style="margin-top:12px;" onclick="route()">Reintentar</button>
      </div>
    `;
  }
}
