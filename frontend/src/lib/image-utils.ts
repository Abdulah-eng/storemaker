/**
 * Utility functions for handling images and fallbacks
 */

/**
 * Check if a URL is valid and not a placeholder
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false
  
  // Check if it's a placeholder or problematic URL
  const invalidPatterns = [
    'thumb.jpg',
    'placeholder',
    'no-image',
    'default',
    '/templates/',
    'localhost:3000/templates/'
  ]
  
  return !invalidPatterns.some(pattern => url.includes(pattern))
}

/**
 * Get a fallback image URL based on category
 */
export const getFallbackImageUrl = (category: string): string => {
  const fallbackImages = {
    beauty: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    fashion: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
    food: 'https://images.unsplash.com/photo-1504674900244-1b47f22f8f54?w=400&h=300&fit=crop',
    general: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    home: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
  }
  
  return fallbackImages[category as keyof typeof fallbackImages] || fallbackImages.general
}

/**
 * Handle image load error by hiding the image and showing fallback
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
  
  // Show fallback element if it exists
  const fallback = target.nextElementSibling
  if (fallback) {
    fallback.classList.remove('hidden')
  }
}

/**
 * Get the appropriate image URL with fallback
 */
export const getImageUrl = (url: string | null | undefined, category: string = 'general'): string | null => {
  if (isValidImageUrl(url)) {
    return url
  }
  
  return getFallbackImageUrl(category)
} 