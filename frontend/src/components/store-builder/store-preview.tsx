"use client"

import { Store } from '@/types'
import { XMarkIcon, Squares2X2Icon } from '@heroicons/react/24/outline'
import { ProductCarousel } from '../ui/carousel'

// Utility function to validate URLs
const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false
  }
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

interface ThemeConfig {
  colors?: {
    primary?: string
    secondary?: string
    accent?: string
    text?: string
    background?: string
  }
  fonts?: {
    heading?: string
    body?: string
  }
  layout?: {
    [key: string]: string
  }
}

interface PageComponent {
  id: string
  type: string
  props: any
  order: number
}

interface StorePreviewProps {
  store: Store
  theme?: ThemeConfig | null
  components: PageComponent[]
  onClose: () => void
}

export function StorePreview({ store, theme, components, onClose }: StorePreviewProps) {
  const renderComponent = (component: PageComponent) => {
    const baseStyles = {
      backgroundColor: theme?.colors?.background || '#ffffff',
      color: theme?.colors?.text || '#1f2937',
      fontFamily: theme?.fonts?.body || 'Inter'
    }

    const primaryColor = theme?.colors?.primary || '#3b82f6'
    const accentColor = theme?.colors?.accent || '#10b981'
    const headingFont = theme?.fonts?.heading || 'Inter'

    switch (component.type) {
      case 'hero-banner':
        return (
          <div 
            className="relative min-h-96 md:min-h-[600px] lg:min-h-[700px] flex items-center justify-center text-center bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: component.props.backgroundImage ? `url(${component.props.backgroundImage})` : `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
              backgroundColor: component.props.backgroundImage ? 'transparent' : primaryColor
            }}
          >
            {/* Overlay */}
            {component.props.overlay && (
              <div className="absolute inset-0 bg-black opacity-50"></div>
            )}
            
            <div className="relative z-10 max-w-4xl px-6 py-12">
              <h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                style={{ 
                  color: component.props.overlay || component.props.backgroundImage ? '#ffffff' : '#ffffff', 
                  fontFamily: headingFont,
                  textShadow: component.props.overlay || component.props.backgroundImage ? '2px 2px 4px rgba(0,0,0,0.7)' : '2px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {String(component.props.title || 'Hero Title')}
              </h1>
              <p 
                className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed"
                style={{ 
                  color: component.props.overlay || component.props.backgroundImage ? '#ffffff' : '#ffffff',
                  textShadow: component.props.overlay || component.props.backgroundImage ? '1px 1px 2px rgba(0,0,0,0.7)' : '1px 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                {String(component.props.subtitle || 'Hero subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg"
                  style={{ 
                    backgroundColor: '#ffffff',
                    color: primaryColor,
                    border: `2px solid #ffffff`
                  }}
                >
                  {String(component.props.buttonText || 'Call to Action')}
                </button>
                {component.props.secondaryButton && (
                  <button 
                    className="px-8 py-4 rounded-lg font-semibold text-lg border-2 transition-all hover:scale-105"
                    style={{ 
                      borderColor: component.props.overlay ? '#ffffff' : primaryColor,
                      color: component.props.overlay ? '#ffffff' : primaryColor,
                      backgroundColor: 'transparent'
                    }}
                  >
                    {String(component.props.secondaryButtonText || 'Learn More')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )

      case 'hero-split':
        return (
          <div className="min-h-80 md:min-h-96 lg:min-h-[500px]" style={baseStyles}>
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full ${
                component.props.imagePosition === 'right' ? '' : 'lg:grid-cols-2'
              }`}>
                {/* Content */}
                <div className={`${component.props.imagePosition === 'right' ? 'order-1' : 'order-2 lg:order-1'}`}>
                  <h1 
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                    style={{ color: primaryColor, fontFamily: headingFont }}
                  >
                    {String(component.props.title || 'New Collection')}
                  </h1>
                  <p 
                    className="text-lg md:text-xl mb-8 leading-relaxed"
                    style={{ color: baseStyles.color }}
                  >
                    {String(component.props.subtitle || 'Explore our latest arrivals')}
                  </p>
                  <button 
                    className="px-8 py-4 rounded-lg font-semibold text-lg text-white transition-all hover:scale-105 shadow-lg"
                    style={{ backgroundColor: accentColor }}
                  >
                    {String(component.props.buttonText || 'View Collection')}
                  </button>
                </div>
                
                {/* Image */}
                <div className={`${component.props.imagePosition === 'right' ? 'order-2' : 'order-1 lg:order-2'}`}>
                  <div 
                    className="aspect-square lg:aspect-[4/3] rounded-2xl bg-cover bg-center bg-no-repeat shadow-2xl"
                    style={{
                      backgroundImage: component.props.image ? `url(${component.props.image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundColor: accentColor
                    }}
                  >
                    {!component.props.image && (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-sm">Hero Image</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'hero-video':
        return (
          <div 
            className="relative min-h-80 md:min-h-96 lg:min-h-[600px] flex items-center justify-center text-center overflow-hidden"
            style={baseStyles}
          >
            {/* Video Background */}
            <div className="absolute inset-0">
              {component.props.videoUrl ? (
                <video
                  className="w-full h-full object-cover"
                  autoPlay={Boolean(component.props.autoplay)}
                  muted={Boolean(component.props.muted)}
                  loop
                  playsInline
                >
                  <source src={String(component.props.videoUrl)} type="video/mp4" />
                </video>
              ) : (
                <div 
                  className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center"
                >
                  <div className="text-white text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-lg">Video Background</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black opacity-40"></div>
            
            {/* Content */}
            <div className="relative z-10 max-w-4xl px-6 py-12">
              <h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white"
                style={{ 
                  fontFamily: headingFont,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
                }}
              >
                {String(component.props.title || 'Experience Excellence')}
              </h1>
              <p 
                className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed text-white"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
              >
                {String(component.props.subtitle || 'Watch our story unfold')}
              </p>
              <button 
                className="px-8 py-4 rounded-lg font-semibold text-lg text-white transition-all hover:scale-105 shadow-lg"
                style={{ backgroundColor: accentColor }}
              >
                {String(component.props.buttonText || 'Learn More')}
              </button>
            </div>
          </div>
        )

      case 'hero-minimal':
        return (
          <div 
            className="min-h-64 md:min-h-80 lg:min-h-96 flex items-center justify-center"
            style={baseStyles}
          >
            <div className={`max-w-4xl px-6 py-12 ${
              component.props.alignment === 'left' ? 'text-left' : 
              component.props.alignment === 'right' ? 'text-right' : 'text-center'
            }`}>
              <h1 
                className="text-3xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight"
                style={{ color: primaryColor, fontFamily: headingFont }}
              >
                {String(component.props.title || 'Simple. Beautiful. Effective.')}
              </h1>
              <p 
                className="text-lg md:text-xl mb-8 max-w-2xl leading-relaxed"
                style={{ 
                  color: baseStyles.color,
                  margin: component.props.alignment === 'center' ? '0 auto 2rem auto' : '0 0 2rem 0'
                }}
              >
                {String(component.props.subtitle || 'Discover what matters most')}
              </p>
              {component.props.showButton && (
                <button 
                  className="px-8 py-4 rounded-lg font-semibold text-lg text-white transition-all hover:scale-105 shadow-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  {String(component.props.buttonText || 'Get Started')}
                </button>
              )}
            </div>
          </div>
        )

      case 'image-gallery':
        return (
          <div className="p-6" style={baseStyles}>
            <h2 
              className="text-2xl font-bold mb-6 text-center"
              style={{ color: primaryColor, fontFamily: headingFont }}
            >
              {String(component.props.title || 'Image Gallery')}
            </h2>
            <div 
              className={`grid gap-4 ${
                Number(component.props.columns) === 4 ? 'grid-cols-4' :
                Number(component.props.columns) === 2 ? 'grid-cols-2' : 'grid-cols-3'
              }`}
            >
              {(Array.isArray(component.props.images) ? component.props.images : []).slice(0, 6).map((imageUrl: string, i: number) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  {imageUrl && imageUrl.trim() ? (
                    <img 
                      src={imageUrl} 
                      alt={`Gallery image ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="200" y="150" text-anchor="middle" fill="%236b7280" font-size="14"%3EImage %23' + (i + 1) + '%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )

      case 'video-embed':
        return (
          <div className="p-6" style={baseStyles}>
            <h2 
              className="text-2xl font-bold mb-6 text-center"
              style={{ color: primaryColor, fontFamily: headingFont }}
            >
              {String(component.props.title || 'Video Player')}
            </h2>
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              {component.props.videoUrl ? (
                <video
                  src={String(component.props.videoUrl)}
                  className="w-full h-full object-cover"
                  controls={Boolean(component.props.controls)}
                  autoPlay={Boolean(component.props.autoplay)}
                  muted={Boolean(component.props.muted)}
                  loop={Boolean(component.props.loop)}
                  onError={(e) => {
                    const video = e.target as HTMLVideoElement
                    video.style.display = 'none'
                    const parent = video.parentElement
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center text-white">
                          <div class="text-center">
                            <div class="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                              </svg>
                            </div>
                            <p class="text-lg">Video Preview</p>
                          </div>
                        </div>
                      `
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-lg">Add Video URL</p>
                    <p className="text-sm opacity-75">Upload or paste video URL</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'product-grid':
        return (
          <div className="p-6" style={baseStyles}>
            <h2 
              className="text-2xl font-bold mb-6 text-center"
              style={{ color: primaryColor, fontFamily: headingFont }}
            >
              {String(component.props.title || 'Featured Products')}
            </h2>
            <div className={`grid grid-cols-1 md:grid-cols-${Number(component.props.columns) || 3} gap-6`}>
              {Array(Number(component.props.maxProducts) || 6).fill(0).map((_, index) => (
                <div key={index} className="bg-white dark:bg-dark-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-200 dark:bg-dark-700 flex items-center justify-center">
                    <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2" style={{ color: primaryColor }}>
                      Sample Product {index + 1}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: baseStyles.color }}>
                      Product description goes here...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold" style={{ color: accentColor }}>
                        $29.99
                      </span>
                      <button 
                        className="px-3 py-1 text-sm rounded text-white"
                        style={{ backgroundColor: accentColor }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'product-carousel':
        const sampleProducts = [
          {
            id: 1,
            name: 'Sample Product 1',
            price: 29.99,
            comparePrice: 39.99,
            images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'],
            slug: 'sample-product-1'
          },
          {
            id: 2,
            name: 'Sample Product 2',
            price: 49.99,
            images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop'],
            slug: 'sample-product-2'
          },
          {
            id: 3,
            name: 'Sample Product 3',
            price: 79.99,
            comparePrice: 99.99,
            images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop'],
            slug: 'sample-product-3'
          },
          {
            id: 4,
            name: 'Sample Product 4',
            price: 24.99,
            images: ['https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300&h=300&fit=crop'],
            slug: 'sample-product-4'
          },
          {
            id: 5,
            name: 'Sample Product 5',
            price: 89.99,
            images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop'],
            slug: 'sample-product-5'
          }
        ];

        return (
          <div className="p-6" style={baseStyles}>
            <h2 
              className="text-2xl font-bold mb-8 text-center"
              style={{ color: primaryColor, fontFamily: headingFont }}
            >
              {String(component.props.title || 'Trending Now')}
            </h2>
            <ProductCarousel
              products={sampleProducts}
              slidesToShow={Number(component.props.slidesToShow) || 4}
              autoplay={Boolean(component.props.autoplay)}
              showDots={Boolean(component.props.showDots)}
              showArrows={true}
              infinite={true}
              showAddToCart={true}
              onAddToCart={(product) => {
                // Mock function for store preview
                console.log('Add to Cart clicked in store preview:', product.name)
              }}
              responsive={[
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                  }
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                  }
                }
              ]}
            />
          </div>
        )

      case 'feature-list':
        return (
          <div className="p-6" style={baseStyles}>
            <h2 
              className="text-2xl font-bold mb-8 text-center"
              style={{ color: primaryColor, fontFamily: headingFont }}
            >
              {String(component.props.title || 'Why Choose Us')}
            </h2>
            <div className={`grid grid-cols-1 md:grid-cols-${Number(component.props.columns) || 3} gap-8`}>
              {Array(Number(component.props.maxFeatures) || 6).fill(0).map((_, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 
                    className="text-lg font-semibold mb-3"
                    style={{ color: primaryColor, fontFamily: headingFont }}
                  >
                    Feature {index + 1}
                  </h3>
                  <p style={{ color: baseStyles.color }}>
                    Feature description explaining the benefit and value proposition.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'cta-banner':
        return (
          <div 
            className="p-8 text-center"
            style={{
              backgroundColor: String(component.props.backgroundColor || accentColor),
              color: String(component.props.textColor || '#ffffff')
            }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: headingFont }}>
              {String(component.props.title || 'Special Offer')}
            </h2>
            <p className="text-lg mb-6">
              {String(component.props.subtitle || 'Limited time offer')}
            </p>
            <button 
              className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {String(component.props.buttonText || 'Shop Now')}
            </button>
          </div>
        )

      case 'newsletter':
        return (
          <div className="p-6 sm:p-8 text-center" style={baseStyles}>
            <h2 
              className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4"
              style={{ color: primaryColor, fontFamily: headingFont }}
            >
              {String(component.props.title || 'Stay Updated')}
            </h2>
            <p className="text-base sm:text-lg mb-4 sm:mb-6 px-2" style={{ color: baseStyles.color }}>
              {String(component.props.subtitle || 'Subscribe for updates')}
            </p>
            <div className="max-w-md mx-auto px-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder={String(component.props.placeholder || 'Enter your email')}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg sm:rounded-l-lg sm:rounded-r-none dark:bg-dark-700 dark:text-gray-100 text-base"
                />
                <button 
                  className="px-6 py-3 text-white rounded-lg sm:rounded-l-none sm:rounded-r-lg font-semibold hover:opacity-90 transition-opacity text-base"
                  style={{ backgroundColor: accentColor }}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        )

      case 'product-showcase':
        return (
          <div className="p-6" style={baseStyles}>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="aspect-square bg-gray-200 dark:bg-dark-700 rounded-lg flex items-center justify-center">
                  <svg className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h2 
                    className="text-3xl font-bold mb-4"
                    style={{ color: primaryColor, fontFamily: headingFont }}
                  >
                    {String(component.props.title || 'Featured Product')}
                  </h2>
                  <p className="text-lg mb-6" style={{ color: baseStyles.color }}>
                    {String(component.props.description || 'Detailed product description highlighting key features and benefits.')}
                  </p>
                  <div className="flex items-center mb-6">
                    <span className="text-3xl font-bold" style={{ color: accentColor }}>
                      ${String(component.props.price || '99.99')}
                    </span>
                    {component.props.originalPrice && (
                      <span className="text-xl text-gray-500 line-through ml-3">
                        ${String(component.props.originalPrice)}
                      </span>
                    )}
                  </div>
                  <button 
                    className="px-8 py-3 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                  >
                    {String(component.props.buttonText || 'Buy Now')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'stats-counter':
        return (
          <div 
            className="p-8"
            style={{ backgroundColor: theme?.colors?.secondary || '#f8fafc' }}
          >
            <div className="max-w-6xl mx-auto">
              <h2 
                className="text-2xl font-bold mb-8 text-center"
                style={{ color: primaryColor, fontFamily: headingFont }}
              >
                {String(component.props.title || 'Our Achievements')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {Array(4).fill(0).map((_, index) => (
                  <div key={index} className="text-center">
                    <div 
                      className="text-3xl font-bold mb-2"
                      style={{ color: accentColor, fontFamily: headingFont }}
                    >
                      {['1000+', '50+', '24/7', '99%'][index]}
                    </div>
                    <div style={{ color: baseStyles.color }}>
                      {['Happy Customers', 'Products', 'Support', 'Satisfaction'][index]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'reviews-grid':
        return (
          <div className="p-6" style={baseStyles}>
            <h2 
              className="text-2xl font-bold mb-8 text-center"
              style={{ color: primaryColor, fontFamily: headingFont }}
            >
              {String(component.props.title || 'What Our Customers Say')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    {Array(5).fill(0).map((_, starIndex) => (
                      <svg key={starIndex} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-4" style={{ color: baseStyles.color }}>
                    "Great product and excellent customer service. Highly recommended!"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                    <div>
                      <div className="font-semibold" style={{ color: primaryColor }}>
                        Customer {index + 1}
                      </div>
                      <div className="text-sm text-gray-500">Verified Purchase</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'spacer':
        return (
          <div 
            style={{ 
              height: `${Number(component.props.height) || 50}px`,
              backgroundColor: component.props.backgroundColor || 'transparent'
            }}
          />
        )

      case 'divider':
        return (
          <div className="py-8" style={baseStyles}>
            <div className="max-w-6xl mx-auto">
              <hr 
                className="border-0"
                style={{ 
                  height: `${Number(component.props.thickness) || 1}px`,
                  backgroundColor: component.props.color || theme?.colors?.primary || '#e5e7eb'
                }}
              />
            </div>
          </div>
        )

      case 'about-section':
        return (
          <div className="p-8" style={baseStyles}>
            <div className="max-w-6xl mx-auto">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                component.props.imagePosition === 'right' ? 'lg:grid-flow-col-dense' : ''
              }`}>
                {/* Image */}
                <div className={`order-1 ${component.props.imagePosition === 'right' ? 'lg:order-2' : ''}`}>
                  {component.props.image ? (
                    <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                      <img 
                        src={String(component.props.image)} 
                        alt="About us"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23f3f4f6"/%3E%3Ctext x="300" y="200" text-anchor="middle" fill="%236b7280" font-size="16"%3EAbout Us Image%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className={`order-2 ${component.props.imagePosition === 'right' ? 'lg:order-1' : ''}`}>
                  <h2 
                    className="text-3xl font-bold mb-6"
                    style={{ color: primaryColor, fontFamily: headingFont }}
                  >
                    {String(component.props.title || 'About Our Store')}
                  </h2>
                  <div 
                    className="prose prose-lg max-w-none"
                    style={{ color: baseStyles.color }}
                  >
                    <p className="text-lg leading-relaxed mb-6">
                      {String(component.props.content || 'We are passionate about providing quality products and exceptional customer service. Our team works hard to curate the best selection for our customers.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'contact-info':
        return (
          <div className="p-8" style={{ backgroundColor: theme?.colors?.secondary || '#f8fafc' }}>
            <div className="max-w-4xl mx-auto">
              <h2 
                className="text-3xl font-bold text-center mb-12"
                style={{ color: primaryColor, fontFamily: headingFont }}
              >
                {String(component.props.title || 'Visit Our Store')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Address */}
                <div className="text-center">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                  >
                    📍
                  </div>
                  <h3 
                    className="text-xl font-semibold mb-2"
                    style={{ color: primaryColor, fontFamily: headingFont }}
                  >
                    Address
                  </h3>
                  <p style={{ color: baseStyles.color }}>
                    {String(component.props.address || '123 Main Street, City, State 12345')}
                  </p>
                </div>
                
                {/* Phone */}
                <div className="text-center">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                  >
                    📞
                  </div>
                  <h3 
                    className="text-xl font-semibold mb-2"
                    style={{ color: primaryColor, fontFamily: headingFont }}
                  >
                    Phone
                  </h3>
                  <p style={{ color: baseStyles.color }}>
                    {String(component.props.phone || '(555) 123-4567')}
                  </p>
                </div>
                
                {/* Email */}
                <div className="text-center">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                  >
                    ✉️
                  </div>
                  <h3 
                    className="text-xl font-semibold mb-2"
                    style={{ color: primaryColor, fontFamily: headingFont }}
                  >
                    Email
                  </h3>
                  <p style={{ color: baseStyles.color }}>
                    {String(component.props.email || 'info@store.com')}
                  </p>
                </div>
              </div>
              
              {/* Business Hours */}
              {component.props.hours && (
                <div className="mt-12 text-center">
                  <h3 
                    className="text-xl font-semibold mb-4"
                    style={{ color: primaryColor, fontFamily: headingFont }}
                  >
                    Business Hours
                  </h3>
                  <p style={{ color: baseStyles.color }}>
                    {String(component.props.hours)}
                  </p>
                </div>
              )}
            </div>
          </div>
                 )

      case 'testimonials':
        return (
          <div className="p-8" style={baseStyles}>
            <div className="max-w-6xl mx-auto">
              <h2 
                className="text-3xl font-bold text-center mb-12"
                style={{ color: primaryColor, fontFamily: headingFont }}
              >
                {String(component.props.title || 'What Our Customers Say')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(Array.isArray(component.props.testimonials) ? component.props.testimonials : []).slice(0, 6).map((testimonial: any, i: number) => (
                  <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                      {Array(5).fill(0).map((_, starIndex) => (
                        <svg 
                          key={starIndex} 
                          className={`h-5 w-5 ${starIndex < (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="mb-4 italic" style={{ color: baseStyles.color }}>
                      "{String(testimonial.comment || 'Great product and excellent service!')}"
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                        {testimonial.avatar && isValidUrl(testimonial.avatar) ? (
                          <img 
                            src={testimonial.avatar} 
                            alt={String(testimonial.name || 'Customer')}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 font-semibold">
                            {String(testimonial.name || 'Customer').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: primaryColor }}>
                          {String(testimonial.name || 'Customer')}
                        </div>
                        {testimonial.date && (
                          <div className="text-sm text-gray-500">
                            {String(testimonial.date)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'reviews-grid':
        return (
          <div className="p-8" style={baseStyles}>
            <div className="max-w-6xl mx-auto">
              <h2 
                className="text-3xl font-bold text-center mb-12"
                style={{ color: primaryColor, fontFamily: headingFont }}
              >
                {String(component.props.title || 'Customer Reviews')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(Array.isArray(component.props.reviews) ? component.props.reviews : []).slice(0, 6).map((review: any, i: number) => (
                  <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                      {Array(5).fill(0).map((_, starIndex) => (
                        <svg 
                          key={starIndex} 
                          className={`h-5 w-5 ${starIndex < (review.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="mb-4" style={{ color: baseStyles.color }}>
                      "{String(review.comment || 'Great product and excellent service!')}"
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
                            {String(review.name || 'Customer').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold" style={{ color: primaryColor }}>
                            {String(review.name || 'Customer')}
                          </div>
                          {review.date && (
                            <div className="text-sm text-gray-500">
                              {String(review.date)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'social-proof':
        return (
          <div className="p-8" style={{ backgroundColor: theme?.colors?.secondary || '#f8fafc' }}>
            <div className="max-w-6xl mx-auto">
              <h2 
                className="text-3xl font-bold text-center mb-4"
                style={{ color: primaryColor, fontFamily: headingFont }}
              >
                {String(component.props.title || 'As Featured In')}
              </h2>
              {component.props.subtitle && (
                <p className="text-center mb-12 text-lg" style={{ color: baseStyles.color }}>
                  {String(component.props.subtitle)}
                </p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
                {(Array.isArray(component.props.logos) ? component.props.logos : []).slice(0, 6).map((logo: any, i: number) => (
                  <div key={i} className="flex items-center justify-center">
                    {logo.url && isValidUrl(logo.url) ? (
                      <img 
                        src={logo.url} 
                        alt={String(logo.name || 'Partner')}
                        className="h-12 opacity-60 hover:opacity-100 transition-opacity"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-medium">
                          {String(logo.name || 'Partner')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {/* Fallback logos if none provided */}
                {(!Array.isArray(component.props.logos) || component.props.logos.length === 0) && (
                  <>
                    <div className="flex items-center justify-center">
                      <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-medium">TechCrunch</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-medium">Forbes</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-medium">Wired</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-medium">The Verge</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
                  </div>
      )

    case 'icon-grid':
      return (
        <div className="p-6" style={baseStyles}>
          <div className="max-w-6xl mx-auto">
            <h2 
              className="text-3xl font-bold text-center mb-12"
              style={{ color: primaryColor, fontFamily: headingFont }}
            >
              {String(component.props.title || 'Why Choose Us')}
            </h2>
            <div 
              className={`grid gap-8 ${
                Number(component.props.columns) === 4 ? 'grid-cols-2 md:grid-cols-4' :
                Number(component.props.columns) === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {(Array.isArray(component.props.features) ? component.props.features : []).slice(0, 8).map((feature: any, i: number) => (
                <div key={i} className="text-center">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: theme?.colors?.secondary || '#f8fafc' }}
                  >
                    {feature.icon === 'truck' && '🚚'}
                    {feature.icon === 'shield' && '🛡️'}
                    {feature.icon === 'return' && '↩️'}
                    {feature.icon === 'support' && '💬'}
                    {feature.icon === 'star' && '⭐'}
                    {feature.icon === 'heart' && '❤️'}
                    {feature.icon === 'check' && '✅'}
                    {feature.icon === 'gift' && '🎁'}
                    {!['truck', 'shield', 'return', 'support', 'star', 'heart', 'check', 'gift'].includes(feature.icon) && '✨'}
                  </div>
                  <h3 
                    className="text-xl font-semibold mb-2"
                    style={{ color: primaryColor, fontFamily: headingFont }}
                  >
                    {String(feature.title || 'Feature')}
                  </h3>
                  <p style={{ color: baseStyles.color }}>
                    {String(feature.description || 'Feature description')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'before-after':
      return (
        <div className="p-6" style={baseStyles}>
          <div className="max-w-4xl mx-auto">
            <h2 
              className="text-3xl font-bold text-center mb-12"
              style={{ color: primaryColor, fontFamily: headingFont }}
            >
              {String(component.props.title || 'See the Difference')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Before Image */}
              <div className="text-center">
                <h3 
                  className="text-xl font-semibold mb-4"
                  style={{ color: primaryColor, fontFamily: headingFont }}
                >
                  {String(component.props.beforeLabel || 'Before')}
                </h3>
                <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                  {component.props.beforeImage && isValidUrl(String(component.props.beforeImage)) ? (
                    <img 
                      src={String(component.props.beforeImage)} 
                      alt="Before"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              
              {/* After Image */}
              <div className="text-center">
                <h3 
                  className="text-xl font-semibold mb-4"
                  style={{ color: primaryColor, fontFamily: headingFont }}
                >
                  {String(component.props.afterLabel || 'After')}
                </h3>
                <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                  {component.props.afterImage && isValidUrl(String(component.props.afterImage)) ? (
                    <img 
                      src={String(component.props.afterImage)} 
                      alt="After"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )

    case 'product-categories':
      return (
        <div className="p-6" style={baseStyles}>
          <div className="max-w-6xl mx-auto">
            <h2 
              className="text-3xl font-bold text-center mb-12"
              style={{ color: primaryColor, fontFamily: headingFont }}
            >
              {String(component.props.title || 'Shop by Category')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(Array.isArray(component.props.categories) ? component.props.categories : []).slice(0, 8).map((category: any, i: number) => (
                <div key={i} className="group cursor-pointer">
                  <div className="aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow mb-4">
                    {category.image && isValidUrl(String(category.image)) ? (
                      <img 
                        src={String(category.image)} 
                        alt={String(category.name || 'Category')}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 
                    className="text-lg font-semibold text-center"
                    style={{ color: primaryColor, fontFamily: headingFont }}
                  >
                    {String(category.name || 'Category')}
                  </h3>
                  {category.itemCount && (
                    <p className="text-sm text-center text-gray-500 mt-1">
                      {String(category.itemCount)} items
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'image-text':
      return (
        <div className="p-6" style={baseStyles}>
          <div className="max-w-6xl mx-auto">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
              component.props.imagePosition === 'right' ? 'lg:grid-flow-col-dense' : ''
            }`}>
              {/* Image */}
              <div className={`order-1 ${component.props.imagePosition === 'right' ? 'lg:order-2' : ''}`}>
                {component.props.image && isValidUrl(String(component.props.image)) ? (
                  <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src={String(component.props.image)} 
                      alt="Content"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className={`order-2 ${component.props.imagePosition === 'right' ? 'lg:order-1' : ''}`}>
                <h2 
                  className="text-3xl font-bold mb-6"
                  style={{ color: primaryColor, fontFamily: headingFont }}
                >
                  {String(component.props.title || 'Our Story')}
                </h2>
                <div 
                  className="prose prose-lg max-w-none mb-6"
                  style={{ color: baseStyles.color }}
                >
                  <p className="text-lg leading-relaxed">
                    {String(component.props.content || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.')}
                  </p>
                </div>
                {component.props.showButton && (
                  <button
                    className="inline-block px-6 py-3 rounded-lg font-semibold text-lg transition-colors hover:opacity-90"
                    style={{ 
                      backgroundColor: primaryColor,
                      color: '#ffffff'
                    }}
                  >
                    {String(component.props.buttonText || 'Read More')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )

    case 'stats-counter':
      return (
        <div className="p-6" style={{ backgroundColor: theme?.colors?.secondary || '#f8fafc' }}>
          <div className="max-w-6xl mx-auto">
            <h2 
              className="text-3xl font-bold text-center mb-12"
              style={{ color: primaryColor, fontFamily: headingFont }}
            >
              {String(component.props.title || 'Our Numbers Speak')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {(Array.isArray(component.props.stats) ? component.props.stats : []).slice(0, 4).map((stat: any, i: number) => (
                <div key={i} className="text-center">
                  <div 
                    className="text-4xl md:text-5xl font-bold mb-2"
                    style={{ color: primaryColor, fontFamily: headingFont }}
                  >
                    {String(stat.number || '0')}
                  </div>
                  <div 
                    className="text-lg"
                    style={{ color: baseStyles.color }}
                  >
                    {String(stat.label || 'Statistic')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    default:
        return (
          <div 
            className="p-6 min-h-24 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600"
            style={baseStyles}
          >
            <div className="text-center">
              <Squares2X2Icon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {component.type.replace('-', ' ')} Component
              </p>
              <p className="text-xs text-gray-400">
                Preview not available
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-dark-900">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Store Preview - {store.name}
          </h1>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="overflow-y-auto h-full">
        {/* Store Header */}
        <div 
          className="bg-white border-b sticky top-0 z-10 backdrop-blur-sm"
          style={{ 
            backgroundColor: `${theme?.colors?.secondary || '#f8fafc'}dd`,
            borderColor: theme?.colors?.primary || '#e5e7eb'
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 
                className="text-2xl font-bold"
                style={{ 
                  color: theme?.colors?.primary || '#3b82f6',
                  fontFamily: theme?.fonts?.heading || 'Inter'
                }}
              >
                {store.name}
              </h1>
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="hover:opacity-80 transition-opacity" style={{ color: theme?.colors?.text || '#1f2937' }}>
                  Home
                </a>
                <a href="#" className="hover:opacity-80 transition-opacity" style={{ color: theme?.colors?.text || '#1f2937' }}>
                  Products
                </a>
                <a href="#" className="hover:opacity-80 transition-opacity" style={{ color: theme?.colors?.text || '#1f2937' }}>
                  About
                </a>
                <a href="#" className="hover:opacity-80 transition-opacity" style={{ color: theme?.colors?.text || '#1f2937' }}>
                  Contact
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Components */}
        <div className="min-h-[800px]">
          {components.length === 0 ? (
            <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
              <div className="text-center p-8">
                <Squares2X2Icon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Components Added</h3>
                <p className="text-sm mb-4 max-w-sm">Add components from the store builder to see your store come to life</p>
              </div>
            </div>
          ) : (
            components
              .sort((a, b) => a.order - b.order)
              .map((component) => (
                <div key={component.id}>
                  {renderComponent(component)}
                </div>
              ))
          )}
        </div>

        {/* Footer */}
        <footer 
          className="py-12 border-t"
          style={{ 
            backgroundColor: theme?.colors?.secondary || '#f8fafc',
            borderColor: theme?.colors?.primary || '#e5e7eb'
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h4 
              className="text-lg font-semibold mb-4"
              style={{ 
                color: theme?.colors?.primary || '#3b82f6',
                fontFamily: theme?.fonts?.heading || 'Inter'
              }}
            >
              {store.name}
            </h4>
            <p style={{ color: theme?.colors?.text || '#1f2937' }}>
              {store.description || 'Your trusted online store'}
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}