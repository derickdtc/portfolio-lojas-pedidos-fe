export const PRODUCT_IMAGE_LIMIT = 2;
export const PLANNED_PRODUCT_IMAGE_MAX_SIZE_MB = 5;
export const PLANNED_PRODUCT_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp'] as const;
export const PRODUCT_IMAGE_MAX_SIZE_BYTES = PLANNED_PRODUCT_IMAGE_MAX_SIZE_MB * 1024 * 1024;
export const PRODUCT_IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';
export const PRODUCT_IMAGE_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
