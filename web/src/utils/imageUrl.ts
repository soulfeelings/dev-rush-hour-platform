/**
 * Image variant for Cloudflare Images responsive delivery.
 * Matches OpenAPI ImageVariant enum.
 */
export type ImageVariant = 'thumbnail' | 'card' | 'medium' | 'hero' | 'full'

/**
 * Returns URL for displaying an image with optional variant/size.
 * For CF Images (imagedelivery.net): appends /{variant} to base URL.
 * For local: returns url as-is.
 */
export function getImageUrl(baseUrl: string, variant?: ImageVariant): string {
  if (!baseUrl) return ''
  if (!variant || variant === 'full') return baseUrl
  if (baseUrl.includes('imagedelivery.net')) {
    const clean = baseUrl.replace(/\/+$/, '')
    return `${clean}/${variant}`
  }
  return baseUrl
}
