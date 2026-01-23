/**
 * Tafel Totaal - Product Image Upload Handler
 * Handles drag-and-drop image uploads to Cloudinary
 */

import { showToast } from '../../lib/utils.js';

const API_BASE_URL = false 
  ? 'https://tafel-totaal-production.up.railway.app' 
  : 'http://localhost:3000';

let currentImages = [];

/**
 * Initialize image upload functionality
 */
export function initImageUpload() {
  const uploadZone = document.getElementById('image-upload-zone');
  const fileInput = document.getElementById('image-file-input');
  
  if (!uploadZone || !fileInput) return;

  // Click to upload
  uploadZone.addEventListener('click', () => {
    fileInput.click();
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(Array.from(files));
    }
    fileInput.value = ''; // Reset input
  });

  // Drag and drop events
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.add('drag-over');
  });

  uploadZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.remove('drag-over');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.remove('drag-over');
    
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFiles(Array.from(files));
    }
  });
}

/**
 * Handle file uploads
 */
async function handleFiles(files) {
  const uploadZone = document.getElementById('image-upload-zone');
  const content = uploadZone?.querySelector('.image-upload-zone__content');
  const loading = uploadZone?.querySelector('.image-upload-zone__loading');

  // Filter only images
  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  
  if (imageFiles.length === 0) {
    showToast('Alleen afbeeldingen zijn toegestaan', 'error');
    return;
  }

  // Show loading state
  if (content) content.style.display = 'none';
  if (loading) loading.style.display = 'flex';

  try {
    for (const file of imageFiles) {
      await uploadImage(file);
    }
    showToast(`${imageFiles.length} afbeelding${imageFiles.length > 1 ? 'en' : ''} geüpload`, 'success');
  } catch (error) {
    console.error('Upload error:', error);
    showToast('Fout bij uploaden van afbeeldingen', 'error');
  } finally {
    // Hide loading state
    if (content) content.style.display = 'flex';
    if (loading) loading.style.display = 'none';
  }
}

/**
 * Upload single image to Cloudinary via backend
 */
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const result = await response.json();
  
  if (result.success && result.data) {
    currentImages.push(result.data.url);
    renderImagePreviews();
  }

  return result;
}

/**
 * Render image previews
 */
function renderImagePreviews() {
  const grid = document.getElementById('image-preview-grid');
  if (!grid) return;

  grid.innerHTML = currentImages.map((url, index) => `
    <div class="image-preview-item ${index === 0 ? 'image-preview-item--primary' : ''}" data-index="${index}">
      <img src="${url}" alt="Product afbeelding ${index + 1}">
      <button type="button" class="image-preview-item__remove" data-index="${index}" title="Verwijderen">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      ${index === 0 ? '<span class="image-preview-item__badge">Hoofd</span>' : ''}
    </div>
  `).join('');

  // Add remove handlers
  grid.querySelectorAll('.image-preview-item__remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      removeImage(index);
    });
  });
}

/**
 * Remove image from list
 */
function removeImage(index) {
  currentImages.splice(index, 1);
  renderImagePreviews();
}

/**
 * Set current images (when opening edit modal)
 */
export function setCurrentImages(images) {
  currentImages = images || [];
  renderImagePreviews();
}

/**
 * Get current images (when saving product)
 */
export function getCurrentImages() {
  return [...currentImages];
}

/**
 * Clear all images
 */
export function clearImages() {
  currentImages = [];
  renderImagePreviews();
}
