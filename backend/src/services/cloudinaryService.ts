import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { env } from '../config/env';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  error?: string;
}

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}

// Folder structure for organization
const FOLDERS = {
  products: 'tafel-totaal/products',
  packages: 'tafel-totaal/packages',
  damage: 'tafel-totaal/damage',
  misc: 'tafel-totaal/misc'
} as const;

type FolderType = keyof typeof FOLDERS;

export const CloudinaryService = {
  /**
   * Upload an image from a base64 string or URL
   */
  async uploadImage(
    source: string,
    folder: FolderType = 'misc',
    options: {
      publicId?: string;
      overwrite?: boolean;
      transformation?: ImageTransformOptions;
    } = {}
  ): Promise<UploadResult> {
    try {
      const uploadOptions: Record<string, any> = {
        folder: FOLDERS[folder],
        resource_type: 'image',
        overwrite: options.overwrite ?? true,
        transformation: options.transformation ? [
          {
            width: options.transformation.width,
            height: options.transformation.height,
            crop: options.transformation.crop || 'fill',
            quality: options.transformation.quality || 'auto',
            fetch_format: options.transformation.format || 'auto'
          }
        ] : [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      };

      if (options.publicId) {
        uploadOptions.public_id = options.publicId;
      }

      const result: UploadApiResponse = await cloudinary.uploader.upload(
        source,
        uploadOptions
      );

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      };
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      const uploadError = error as UploadApiErrorResponse;
      return {
        success: false,
        error: uploadError.message || 'Upload failed'
      };
    }
  },

  /**
   * Upload multiple images
   */
  async uploadMultiple(
    sources: string[],
    folder: FolderType = 'misc'
  ): Promise<UploadResult[]> {
    const results = await Promise.all(
      sources.map(source => this.uploadImage(source, folder))
    );
    return results;
  },

  /**
   * Delete an image by public ID
   */
  async deleteImage(publicId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await cloudinary.uploader.destroy(publicId);
      return { success: true };
    } catch (error) {
      console.error('Cloudinary delete failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  },

  /**
   * Delete multiple images
   */
  async deleteMultiple(publicIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      await cloudinary.api.delete_resources(publicIds);
      return { success: true };
    } catch (error) {
      console.error('Cloudinary bulk delete failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bulk delete failed'
      };
    }
  },

  /**
   * Generate a transformed URL for an existing image
   */
  getTransformedUrl(
    publicId: string,
    options: ImageTransformOptions = {}
  ): string {
    return cloudinary.url(publicId, {
      transformation: [
        {
          width: options.width,
          height: options.height,
          crop: options.crop || 'fill',
          quality: options.quality || 'auto',
          fetch_format: options.format || 'auto'
        }
      ],
      secure: true
    });
  },

  /**
   * Get thumbnail URL (small square image)
   */
  getThumbnailUrl(publicId: string, size: number = 150): string {
    return this.getTransformedUrl(publicId, {
      width: size,
      height: size,
      crop: 'thumb'
    });
  },

  /**
   * Get product image URL with standard dimensions
   */
  getProductImageUrl(publicId: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const sizes = {
      small: { width: 300, height: 300 },
      medium: { width: 600, height: 600 },
      large: { width: 1200, height: 1200 }
    };

    return this.getTransformedUrl(publicId, {
      ...sizes[size],
      crop: 'fill'
    });
  },

  /**
   * Get responsive image URLs for srcset
   */
  getResponsiveUrls(publicId: string): { [key: string]: string } {
    return {
      small: this.getProductImageUrl(publicId, 'small'),
      medium: this.getProductImageUrl(publicId, 'medium'),
      large: this.getProductImageUrl(publicId, 'large')
    };
  },

  /**
   * Extract public ID from Cloudinary URL
   */
  getPublicIdFromUrl(url: string): string | null {
    try {
      const regex = /\/v\d+\/(.+)\.\w+$/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if a URL is a Cloudinary URL
   */
  isCloudinaryUrl(url: string): boolean {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  }
};
