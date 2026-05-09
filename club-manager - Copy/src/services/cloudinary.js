// Cloudinary Upload Service
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload file to Cloudinary
 * @param {File} file - File to upload
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<{url: string, publicId: string, format: string, bytes: number}>}
 */
export async function uploadFile(file, folder = 'innohub') {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary not configured. Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Upload failed' } }));
    throw new Error(error.error?.message || 'Upload failed');
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
    format: data.format,
    bytes: data.bytes,
    width: data.width || null,
    height: data.height || null,
  };
}

/**
 * Upload avatar image
 * @param {File} file - Image file
 * @param {string} userId - User ID for folder organization
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadAvatar(file, userId) {
  return uploadFile(file, `innohub/avatars/${userId}`);
}

/**
 * Upload document file
 * @param {File} file - Document file
 * @returns {Promise<{url: string, publicId: string, format: string, bytes: number}>}
 */
export async function uploadDocument(file) {
  return uploadFile(file, 'innohub/documents');
}

/**
 * Upload task attachment
 * @param {File} file - Attachment file
 * @param {string} taskId - Task ID for folder organization
 * @returns {Promise<{url: string, publicId: string, format: string, bytes: number}>}
 */
export async function uploadTaskAttachment(file, taskId) {
  return uploadFile(file, `innohub/tasks/${taskId}`);
}

/**
 * Get optimized image URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} - Transformed URL
 */
export function getOptimizedUrl(url, { width, height, quality = 'auto', format = 'auto' } = {}) {
  if (!url || !url.includes('cloudinary.com')) return url;

  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  transformations.push('c_limit');

  const transformStr = transformations.join(',');
  return url.replace('/upload/', `/upload/${transformStr}/`);
}
