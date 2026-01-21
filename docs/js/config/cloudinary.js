/**
 * Cloudinary Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://cloudinary.com/console
 * 2. Copy your Cloud Name
 * 3. Go to Settings > Upload > Upload Presets
 * 4. Create a new unsigned upload preset named "packages"
 * 5. Set folder to "tafel-totaal/packages"
 * 6. Enable "Unique filename" and "Overwrite"
 * 7. Update CLOUD_NAME below with your actual cloud name
 */

export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: 'YOUR_CLOUD_NAME', // Replace with your Cloudinary cloud name
  UPLOAD_PRESET: 'packages',
  FOLDER: 'tafel-totaal/packages',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp']
};

/**
 * Get Cloudinary upload URL
 */
export function getUploadUrl() {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`;
}

/**
 * Validate image file
 */
export function validateImageFile(file) {
  const errors = [];

  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    errors.push('Alleen afbeeldingen zijn toegestaan');
  }

  // Check file size
  if (file.size > CLOUDINARY_CONFIG.MAX_FILE_SIZE) {
    errors.push('Afbeelding mag maximaal 5MB zijn');
  }

  // Check format
  const extension = file.name.split('.').pop().toLowerCase();
  if (!CLOUDINARY_CONFIG.ALLOWED_FORMATS.includes(extension)) {
    errors.push(`Alleen ${CLOUDINARY_CONFIG.ALLOWED_FORMATS.join(', ')} formaten zijn toegestaan`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
