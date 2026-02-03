/**
 * CSV Upload and Bulk Actions for Admin Products
 */

import { adminAPI } from '../../lib/api.js';
import { showToast, showConfirm } from '../../lib/utils.js';

const API_BASE_URL = false 
  ? 'https://tafel-totaal-production.up.railway.app' 
  : 'http://localhost:3000';

let selectedProducts = new Set();

/**
 * Initialize CSV upload functionality
 */
export function initCSVUpload() {
  const uploadBtn = document.getElementById('csv-upload-btn');
  const fileInput = document.getElementById('csv-file-input');
  const exportBtn = document.getElementById('csv-export-btn');
  const templateLink = document.getElementById('csv-template-link');
  
  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      if (!file.name.endsWith('.csv')) {
        showToast('Selecteer een geldig CSV bestand', 'error');
        return;
      }
      
      await handleCSVUpload(file);
      fileInput.value = '';
    });
  }
  
  if (exportBtn) {
    console.log('[CSV] Export button found, attaching listener');
    exportBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleCSVExport();
    });
  } else {
    console.warn('[CSV] Export button not found!');
  }
  
  // Also attach to window for inline onclick fallback
  window.exportCSV = handleCSVExport;
  
  if (templateLink) {
    templateLink.href = false
      ? '/templates/products-template.csv'
      : '/templates/products-template.csv';
  }
}

/**
 * Handle CSV file upload
 */
async function handleCSVUpload(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    showToast('CSV wordt verwerkt...', 'info');
    
    const response = await fetch(`${API_BASE_URL}/api/admin/products/csv/parse`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      showCSVPreviewModal(result.data);
    } else {
      showToast(result.error || 'CSV parse error', 'error');
    }
  } catch (error) {
    console.error('CSV upload error:', error);
    showToast('Upload mislukt. Controleer je verbinding.', 'error');
  }
}

/**
 * Show CSV preview modal
 */
function showCSVPreviewModal(data) {
  const { total, valid, errors, records, validationErrors } = data;
  
  const modal = document.createElement('div');
  modal.className = 'modal open';
  modal.id = 'csv-preview-modal';
  
  let errorsHTML = '';
  if (validationErrors.length > 0) {
    errorsHTML = `
      <div style="background: var(--color-error); color: white; padding: var(--space-md); margin-bottom: var(--space-md); border-radius: 4px;">
        <strong>${validationErrors.length} fouten gevonden:</strong>
        <ul style="margin-top: var(--space-sm); padding-left: var(--space-md);">
          ${validationErrors.slice(0, 5).map(e => `<li>Rij ${e.row}: ${e.message}</li>`).join('')}
          ${validationErrors.length > 5 ? `<li>... en ${validationErrors.length - 5} meer</li>` : ''}
        </ul>
      </div>
    `;
  }
  
  modal.innerHTML = `
    <div class="modal__backdrop"></div>
    <div class="modal__content" style="max-width: 700px;">
      <div class="modal__header">
        <h3 class="modal__title">CSV Preview</h3>
        <button class="modal__close" id="csv-modal-close">&times;</button>
      </div>
      <div class="modal__body">
        ${errorsHTML}
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md); margin-bottom: var(--space-lg);">
          <div style="text-align: center; padding: var(--space-md); background: var(--color-off-white);">
            <div style="font-size: 2rem; font-weight: bold; color: var(--color-primary);">${total}</div>
            <div style="font-size: 0.875rem; color: var(--color-gray);">Totaal rijen</div>
          </div>
          <div style="text-align: center; padding: var(--space-md); background: var(--color-off-white);">
            <div style="font-size: 2rem; font-weight: bold; color: #28a745;">${valid}</div>
            <div style="font-size: 0.875rem; color: var(--color-gray);">Geldig</div>
          </div>
          <div style="text-align: center; padding: var(--space-md); background: var(--color-off-white);">
            <div style="font-size: 2rem; font-weight: bold; color: var(--color-error);">${errors}</div>
            <div style="font-size: 0.875rem; color: var(--color-gray);">Fouten</div>
          </div>
        </div>
        
        ${valid > 0 ? `
          <div class="form-group">
            <label class="form-label">Import Mode</label>
            <select id="csv-import-mode" class="form-input">
              <option value="create">Alleen nieuwe producten toevoegen (skip bestaande)</option>
              <option value="update">Update bestaande producten (skip nieuwe)</option>
              <option value="skip">Skip alle duplicaten</option>
            </select>
          </div>
          
          <div style="max-height: 300px; overflow-y: auto; margin-top: var(--space-md); border: 1px solid var(--color-light-gray);">
            <table class="admin-table" style="font-size: 0.875rem;">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Naam</th>
                  <th>Categorie</th>
                  <th>Prijs</th>
                  <th>Voorraad</th>
                </tr>
              </thead>
              <tbody>
                ${records.slice(0, 10).map(p => `
                  <tr>
                    <td style="font-family: var(--font-mono);">${p.sku}</td>
                    <td>${p.name}</td>
                    <td>${p.category_id ? '✓' : '✗'}</td>
                    <td>€${p.price_per_day.toFixed(2)}</td>
                    <td>${p.stock_total}</td>
                  </tr>
                `).join('')}
                ${records.length > 10 ? `<tr><td colspan="5" style="text-align: center; color: var(--color-gray);">... en ${records.length - 10} meer</td></tr>` : ''}
              </tbody>
            </table>
          </div>
        ` : ''}
      </div>
      <div class="modal__footer">
        <button class="btn btn--ghost" id="csv-cancel-btn">Annuleren</button>
        ${valid > 0 ? '<button class="btn btn--primary" id="csv-import-btn">Importeren</button>' : ''}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const closeModal = () => {
    modal.remove();
  };
  
  modal.querySelector('#csv-modal-close')?.addEventListener('click', closeModal);
  modal.querySelector('#csv-cancel-btn')?.addEventListener('click', closeModal);
  modal.querySelector('.modal__backdrop')?.addEventListener('click', closeModal);
  
  const importBtn = modal.querySelector('#csv-import-btn');
  if (importBtn) {
    importBtn.addEventListener('click', async () => {
      const mode = document.getElementById('csv-import-mode')?.value || 'create';
      await importCSVProducts(records, mode);
      closeModal();
    });
  }
}

/**
 * Import CSV products
 */
async function importCSVProducts(products, mode) {
  try {
    showToast('Producten worden geïmporteerd...', 'info');
    
    const response = await fetch(`${API_BASE_URL}/api/admin/products/csv/import`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products, mode })
    });
    
    const result = await response.json();
    
    if (result.success) {
      const { created, updated, skipped, errors } = result.data;
      showToast(`Import voltooid: ${created} aangemaakt, ${updated} bijgewerkt, ${skipped} overgeslagen`, 'success');
      
      // Reload products list
      window.location.reload();
    } else {
      showToast(result.error || 'Import mislukt', 'error');
    }
  } catch (error) {
    console.error('Import error:', error);
    showToast('Import mislukt', 'error');
  }
}

/**
 * Handle CSV export
 */
async function handleCSVExport() {
  console.log('[CSV Export] Starting export...');
  
  // Get auth token
  const token = localStorage.getItem('authToken');
  console.log('[CSV Export] Token present:', !!token, 'Length:', token?.length || 0);
  
  if (!token) {
    showToast('Je bent niet ingelogd. Log eerst in.', 'error');
    setTimeout(() => {
      window.location.href = '/login/?redirect=' + encodeURIComponent(window.location.pathname);
    }, 1500);
    return;
  }
  
  try {
    showToast('CSV wordt voorbereid...', 'info');
    
    const response = await fetch(`${API_BASE_URL}/api/admin/products/csv/export?format=labels`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle expired/invalid token
      if (response.status === 401) {
        showToast('Sessie verlopen - log opnieuw in', 'error');
        localStorage.removeItem('authToken');
        setTimeout(() => {
          window.location.href = '/login/?redirect=' + encodeURIComponent(window.location.pathname);
        }, 1500);
        return;
      }
      
      throw new Error(errorData.error || 'Export mislukt');
    }
    
    // Get the CSV content as blob
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-export.csv';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showToast('CSV gedownload!', 'success');
  } catch (error) {
    console.error('Export error:', error);
    showToast(error.message || 'Export mislukt', 'error');
  }
}

/**
 * Initialize bulk actions
 */
export function initBulkActions() {
  const selectAll = document.getElementById('select-all');
  const bulkToolbar = document.getElementById('bulk-toolbar');
  const bulkCount = document.getElementById('bulk-count');
  
  if (selectAll) {
    selectAll.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('.product-checkbox');
      checkboxes.forEach(cb => {
        cb.checked = e.target.checked;
        if (e.target.checked) {
          selectedProducts.add(cb.dataset.id);
        } else {
          selectedProducts.delete(cb.dataset.id);
        }
      });
      updateBulkToolbar();
    });
  }
  
  document.getElementById('bulk-activate')?.addEventListener('click', () => bulkUpdateStatus(true));
  document.getElementById('bulk-deactivate')?.addEventListener('click', () => bulkUpdateStatus(false));
  document.getElementById('bulk-delete')?.addEventListener('click', bulkDelete);
  document.getElementById('bulk-clear')?.addEventListener('click', clearSelection);
}

/**
 * Update bulk toolbar visibility
 */
export function updateBulkToolbar() {
  const toolbar = document.getElementById('bulk-toolbar');
  const count = document.getElementById('bulk-count');
  const selectAll = document.getElementById('select-all');
  
  if (toolbar && count) {
    if (selectedProducts.size > 0) {
      toolbar.style.display = 'block';
      count.textContent = `${selectedProducts.size} geselecteerd`;
    } else {
      toolbar.style.display = 'none';
      if (selectAll) selectAll.checked = false;
    }
  }
}

/**
 * Handle checkbox change
 */
export function handleCheckboxChange(checkbox) {
  if (checkbox.checked) {
    selectedProducts.add(checkbox.dataset.id);
  } else {
    selectedProducts.delete(checkbox.dataset.id);
  }
  updateBulkToolbar();
}

/**
 * Bulk update status
 */
async function bulkUpdateStatus(is_active) {
  if (selectedProducts.size === 0) return;
  
  const productIds = Array.from(selectedProducts);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/products/bulk/status`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds, is_active })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast(`${productIds.length} producten ${is_active ? 'geactiveerd' : 'gedeactiveerd'}`, 'success');
      window.location.reload();
    } else {
      showToast(result.error || 'Bulk update mislukt', 'error');
    }
  } catch (error) {
    console.error('Bulk update error:', error);
    showToast('Bulk update mislukt', 'error');
  }
}

/**
 * Bulk delete
 */
async function bulkDelete() {
  if (selectedProducts.size === 0) return;
  
  if (!await showConfirm(
    `Weet je zeker dat je ${selectedProducts.size} producten wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`,
    'Producten Verwijderen',
    { destructive: true }
  )) {
    return;
  }
  
  const productIds = Array.from(selectedProducts);
  
  try {
    const result = await adminAPI.bulkDeleteProducts(productIds);
    
    if (result.success) {
      showToast(`${productIds.length} producten verwijderd`, 'success');
      window.location.reload();
    } else {
      showToast(result.error || 'Bulk delete mislukt', 'error');
    }
  } catch (error) {
    console.error('Bulk delete error:', error);
    showToast(error.message || 'Bulk delete mislukt', 'error');
  }
}

/**
 * Clear selection
 */
function clearSelection() {
  selectedProducts.clear();
  document.querySelectorAll('.product-checkbox').forEach(cb => cb.checked = false);
  document.getElementById('select-all').checked = false;
  updateBulkToolbar();
}
