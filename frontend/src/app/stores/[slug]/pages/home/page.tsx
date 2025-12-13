"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Head from 'next/head'
import { api } from '@/lib/api'
import { Store, Page, PageComponent, ThemeConfig, Product } from '@/types'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ProductCarousel } from '@/components/ui/carousel'
import { useCart } from '@/contexts/CartContext'
import { CartDrawer } from '@/components/cart/CartDrawer'

export default function StoreHomePage() {
  const params = useParams()
  const slug = params.slug as string
  const [store, setStore] = useState<Store | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState<ThemeConfig | null>(null)
  const [components, setComponents] = useState<PageComponent[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  const { addToCart, getCartItemCountForStore } = useCart()



  const loadStore = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await api.getStoreBySlug(slug)
      const storeData = response.data as Store
      setStore(storeData)

      // Try to load saved home page layout using public endpoint
      try {
        const layoutResponse = await api.getPublicStoreLayout(slug)
        const layoutData = layoutResponse.data as {
          components: PageComponent[]
          theme: ThemeConfig
        }
        
        if (layoutData.components && layoutData.components.length > 0) {
          setComponents(layoutData.components.sort((a, b) => a.order - b.order))
        }
        
        if (layoutData.theme) {
          setTheme(layoutData.theme)
        }
      } catch (error) {
        console.warn('Could not load saved home page layout:', error)
        
        // Fallback to template configuration
        if (storeData.template_id) {
          try {
            const templateResponse = await api.getTemplate(storeData.template_id)
            const templateData = templateResponse.data as { config: string | ThemeConfig }
            const templateConfig = typeof templateData.config === 'string' 
              ? JSON.parse(templateData.config) as ThemeConfig
              : templateData.config as ThemeConfig
            setTheme(templateConfig)
          } catch {
            console.warn('Could not load theme configuration')
          }
        }
      }

      // Load products for carousels
      try {
        const productsResponse = await api.getStoreProducts(slug)
        const productsData = Array.isArray(productsResponse.data) ? productsResponse.data : []
        console.log('=== PRODUCTS DEBUG ===')
        console.log('Raw API response:', productsResponse)
        console.log('Products data:', productsData)
        console.log('Products count:', productsData.length)
        if (productsData.length > 0) {
          console.log('First product sample:', productsData[0])
        }
        
        // Backend now returns both active and draft products, so we can use them all
        setProducts(productsData)
      } catch (error) {
        console.error('Failed to load store products:', error)
        setProducts([])
      }

      // Load published pages for navigation
      try {
        const pagesResponse = await api.getStorePages(slug)
        const pagesData = Array.isArray(pagesResponse.data) ? pagesResponse.data : []
        setPages(pagesData)
      } catch {
        console.warn('Could not load store pages')
        setPages([])
      }
    } catch (error) {
      console.error('Failed to load store:', error)
      toast.error('Store not found')
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    if (slug) {
      loadStore()
    }
  }, [slug, loadStore])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Not Found</h1>
          <p className="text-gray-600 mb-6">The store you&apos;re looking for doesn&apos;t exist or is not active.</p>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const themeStyles = {
    backgroundColor: theme?.colors?.background || '#ffffff',
    color: theme?.colors?.text || '#1f2937',
    fontFamily: theme?.fonts?.body || 'Inter'
  }

  const primaryColor = theme?.colors?.primary || '#3b82f6'
  const accentColor = theme?.colors?.accent || '#10b981'
  const headingFont = theme?.fonts?.heading || 'Inter'



  const handleNewsletterSubscribe = async (email: string) => {
    setNewsletterStatus('loading')
    try {
      await api.subscribeToNewsletter(slug, email)
      setNewsletterStatus('success')
      setNewsletterEmail('')
      toast.success('Successfully subscribed!')
    } catch (error) {
      console.error('Failed to subscribe to newsletter:', error)
      setNewsletterStatus('error')
      toast.error('Failed to subscribe. Please try again.')
    }
  }

  // Render saved components
  const renderComponent = (component: PageComponent) => {
    const baseStyles = {
      backgroundColor: theme?.colors?.background || '#ffffff',
      color: theme?.colors?.text || '#1f2937',
      fontFamily: theme?.fonts?.body || 'Inter'
    }

    switch (component.type) {
      case 'hero-banner':
        return (
          <section 
            key={component.id}
            className="relative min-h-96 md:min-h-[600px] lg:min-h-[700px] flex items-center justify-center text-center bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: component.props.backgroundImage ? `url(${component.props.backgroundImage})` : `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
              backgroundColor: component.props.backgroundImage ? 'transparent' : primaryColor
            }}
          >
            {!!component.props.overlay && (
              <div className="absolute inset-0 bg-black opacity-50"></div>
            )}
            
            <div className="relative z-10 max-w-4xl px-6 py-12">
              <h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                style={{ 
                  color: '#ffffff', 
                  fontFamily: headingFont,
                  textShadow: component.props.overlay || component.props.backgroundImage ? '2px 2px 4px rgba(0,0,0,0.7)' : '2px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {String(component.props.title || 'Welcome to Our Store')}
              </h1>
              <p 
                className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed"
                style={{ 
                  color: '#ffffff',
                  textShadow: component.props.overlay || component.props.backgroundImage ? '1px 1px 2px rgba(0,0,0,0.7)' : '1px 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                {String(component.props.subtitle || 'Discover amazing products at great prices')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href={`/stores/${store?.slug}/pages/home`}
                  className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg"
                  style={{ 
                    backgroundColor: '#ffffff',
                    color: primaryColor,
                    border: `2px solid #ffffff`
                  }}
                >
                  {String(component.props.buttonText || 'Shop Now')}
                </Link>
                {!!component.props.secondaryButton && (
                  <Link 
                    href={`/stores/${store?.slug}/pages/about`}
                    className="px-8 py-4 rounded-lg font-semibold text-lg border-2 transition-all hover:scale-105"
                    style={{ 
                      borderColor: component.props.overlay ? '#ffffff' : primaryColor,
                      color: component.props.overlay ? '#ffffff' : primaryColor,
                      backgroundColor: 'transparent'
                    }}
                  >
                    {String(component.props.secondaryButtonText || 'Learn More')}
                  </Link>
                )}
              </div>
            </div>
          </section>
        )

      case 'hero-video':
        return (
          <section 
            key={component.id}
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
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                style={{ 
                  color: '#ffffff', 
                  fontFamily: headingFont,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
                }}
              >
                {String(component.props.title || 'Experience Excellence')}
              </h1>
              <p 
                className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed"
                style={{ 
                  color: '#ffffff',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                }}
              >
                {String(component.props.subtitle || 'Watch our story unfold')}
              </p>
              {!!component.props.buttonText && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link 
                    href={`/stores/${store?.slug}/pages/home`}
                    className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg"
                    style={{ 
                      backgroundColor: '#ffffff',
                      color: primaryColor,
                      border: `2px solid #ffffff`
                    }}
                  >
                    {String(component.props.buttonText)}
                  </Link>
                </div>
              )}
            </div>
          </section>
        )

      case 'feature-list':
        return (
          <section key={component.id} className="py-16" style={baseStyles}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 
                className="text-3xl font-bold text-center mb-12"
                style={{ color: primaryColor, fontFamily: headingFont }}
              >
                {String(component.props.title || 'Features')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(Array.isArray(component.props.features) ? component.props.features : []).slice(0, 3).map((feature: Record<string, unknown>, i: number) => (
                  <div key={i} className="text-center">
                    <div 
                      className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: theme?.colors?.secondary || '#f8fafc' }}
                    >
                      ⭐
                    </div>
                    <h3 
                      className="text-xl font-semibold mb-2"
                      style={{ color: primaryColor, fontFamily: headingFont }}
                    >
                      {String(feature.title || '')}
                    </h3>
                    <p style={{ color: baseStyles.color }}>
                      {String(feature.description || '')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case 'cta-banner':
        return (
          <section 
            key={component.id}
            className="py-16"
            style={{
              backgroundColor: String(component.props.backgroundColor || primaryColor),
              color: String(component.props.textColor || '#ffffff')
            }}
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 
                className="text-3xl font-bold mb-4" 
                style={{ 
                  fontFamily: headingFont,
                  color: String(component.props.textColor || '#ffffff')
                }}
              >
                {String(component.props.title || 'Ready to Get Started?')}
              </h2>
              <p 
                className="text-xl mb-8"
                style={{ color: String(component.props.textColor || '#ffffff') }}
              >
                {String(component.props.subtitle || 'Browse our products and find exactly what you&apos;re looking for.')}
              </p>
              <Link
                href={`/stores/${store?.slug}/pages/home`}
                className="inline-block px-8 py-3 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg"
                style={{ 
                  backgroundColor: String(component.props.textColor || '#ffffff'),
                  color: String(component.props.backgroundColor || primaryColor),
                  border: `2px solid ${String(component.props.textColor || '#ffffff')}`
                }}
              >
                {String(component.props.buttonText || 'Shop Now')}
              </Link>
            </div>
          </section>
        )

      case 'product-carousel':
        console.log('=== PRODUCT CAROUSEL DEBUG ===')
        console.log('Component props:', component.props)
        console.log('Available products:', products)
        console.log('Products count:', products.length)
        
        // Use selected products if specified, otherwise all products, otherwise sample products
        let carouselProducts = [];
        
        // Check if we have selected products and they exist in our products array
        if (component.props.selectedProducts && Array.isArray(component.props.selectedProducts) && component.props.selectedProducts.length > 0) {
          console.log('Using selected products:', component.props.selectedProducts)
          // Use selected products that actually exist
          const selectedProductIds = component.props.selectedProducts as number[];
          carouselProducts = products.filter(product => 
            selectedProductIds.includes(product.id as number)
          );
          console.log('Filtered selected products:', carouselProducts)
          
          // If no selected products were found, fall back to all products
          if (carouselProducts.length === 0 && products.length > 0) {
            console.log('No selected products found, falling back to all products')
            carouselProducts = products;
          }
        } else if (products.length > 0) {
          console.log('No selection specified, using all products')
          // Use all products
          carouselProducts = products;
        } else {
          console.log('No real products available, using sample products')
          // Use sample products only if no real products exist
          carouselProducts = [
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
            }
          ];
        }
        
        return (
          <section key={component.id} className="py-16" style={baseStyles}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 
                className="text-3xl font-bold text-center mb-12"
                style={{ color: primaryColor, fontFamily: headingFont }}
              >
                {String(component.props.title || 'Trending Now')}
              </h2>
              <ProductCarousel
                products={carouselProducts}
                slidesToShow={Number(component.props.slidesToShow) || 4}
                autoplay={Boolean(component.props.autoplay)}
                showDots={Boolean(component.props.showDots)}
                showArrows={true}
                infinite={true}
                showAddToCart={true}
                storeSlug={slug}
                onProductClick={(product) => {
                  if (product.slug && store?.slug) {
                    window.location.href = `/stores/${store.slug}/pages/home`
                  }
                }}
                onAddToCart={(product) => {
                  addToCart({
                    id: product.id as number,
                    name: product.name,
                    price: product.price,
                    comparePrice: product.comparePrice,
                    image: product.images?.[0] || '',
                    slug: product.slug || '',
                    storeSlug: slug
                  })
                }}
                responsive={[
                  {
                    breakpoint: 1024,
                    settings: {
                      slidesToShow: Math.min(Number(component.props.slidesToShow) || 4, 3),
                      slidesToScroll: 1
                    }
                  },
                  {
                    breakpoint: 768,
                    settings: {
                      slidesToShow: Math.min(Number(component.props.slidesToShow) || 4, 2),
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
          </section>
        )

      case 'image-gallery':
        return (
          <section key={component.id} className="py-16" style={baseStyles}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 
                className="text-3xl font-bold text-center mb-12"
                style={{ color: primaryColor, fontFamily: headingFont }}
              >
                {String(component.props.title || 'Image Gallery')}
              </h2>
              <div 
                className={`grid gap-4 ${
                  Number(component.props.columns) === 4 ? 'grid-cols-2 md:grid-cols-4' :
                  Number(component.props.columns) === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case 'video-embed':
        return (
          <section key={component.id} className="py-16" style={baseStyles}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 
                className="text-3xl font-bold text-center mb-12"
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
          </section>
        )

      case 'about-section':
        return (
          <section key={component.id} className="py-16" style={baseStyles}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 0 002 2z" />
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
          </section>
        )

      case 'contact-info':
        return (
          <section key={component.id} className="py-16" style={{ backgroundColor: theme?.colors?.secondary || '#f8fafc' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              {!!component.props.hours && (
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
          </section>
        )

      case 'testimonials':
        return (
          <section key={component.id} className="py-16" style={baseStyles}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 
                className="text-3xl font-bold text-center mb-12"
                style={{ color: primaryColor, fontFamily: headingFont }}
              >
                {String(component.props.title || 'What Our Customers Say')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(Array.isArray(component.props.testimonials) ? component.props.testimonials : []).slice(0, 6).map((testimonial: Record<string, unknown>, i: number) => (
                  <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                      {Array(5).fill(0).map((_, starIndex) => (
                        <svg 
                          key={starIndex} 
                          className={`h-5 w-5 ${starIndex < Number((testimonial as { rating?: unknown }).rating ?? 5) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="mb-4 italic" style={{ color: baseStyles.color }}>
                      &quot;{String(testimonial.comment || 'Great product and excellent service!')}&quot;
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                        {testimonial.avatar ? (
                          <img 
                            src={String(testimonial.avatar)} 
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
                        {!!testimonial.date && (
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
          </section>
        )

      case 'newsletter':
        return (
          <section key={component.id} className="py-12 sm:py-16" style={{ backgroundColor: theme?.colors?.secondary || '#f8fafc' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 
                className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4"
                style={{ color: primaryColor, fontFamily: headingFont }}
              >
                {String(component.props.title || 'Stay Updated')}
              </h2>
              <p 
                className="text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-2"
                style={{ color: baseStyles.color }}
              >
                {String(component.props.subtitle || 'Subscribe to get special offers and updates')}
              </p>
              <div className="max-w-md mx-auto px-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder={String(component.props.placeholder || 'Enter your email')}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    style={{ 
                      backgroundColor: '#ffffff',
                      color: baseStyles.color
                    }}
                    disabled={newsletterStatus === 'loading'}
                  />
                  <button 
                    onClick={() => handleNewsletterSubscribe(newsletterEmail)}
                    disabled={newsletterStatus === 'loading' || !newsletterEmail.trim()}
                    className="px-6 py-3 rounded-lg sm:rounded-l-none sm:rounded-r-lg font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    style={{ backgroundColor: accentColor }}
                  >
                    {newsletterStatus === 'loading' ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="hidden sm:inline">Subscribing...</span>
                        <span className="sm:hidden">Loading...</span>
                      </div>
                    ) : (
                      String(component.props.buttonText || 'Subscribe')
                    )}
                  </button>
                </div>
                {newsletterStatus === 'success' && (
                  <p className="mt-3 text-sm text-green-600 px-2">
                    ✓ Successfully subscribed! Check your email for confirmation.
                  </p>
                )}
                {newsletterStatus === 'error' && (
                  <p className="mt-3 text-sm text-red-600 px-2">
                    ✗ Something went wrong. Please try again.
                  </p>
                )}
              </div>
            </div>
          </section>
        )

      case 'spacer':
        return (
          <div 
            key={component.id}
            style={{
              height: `${Number(component.props.height) || 60}px`,
              backgroundColor: String(component.props.backgroundColor || 'transparent')
            }}
          />
        )

      case 'divider':
        return (
          <div key={component.id} className="py-4 flex items-center justify-center">
            <div 
              style={{
                width: String(component.props.width || '100%'),
                height: `${Number(component.props.thickness) || 1}px`,
                backgroundColor: String(component.props.color || '#e5e7eb'),
                borderStyle: String(component.props.style || 'solid')
              }}
            />
          </div>
        )

      default:
        return (
          <section key={component.id} className="py-8" style={baseStyles}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Component type &quot;{component.type}&quot; is not yet supported in home page rendering.
                </p>
              </div>
            </div>
          </section>
        )
    }
  }

  return (
    <div className="min-h-screen" style={themeStyles}>
      {/* Dynamic favicon */}
      <Head>
        {store.favicon && (
          <link rel="icon" href={store.favicon} />
        )}
      </Head>

      {/* Header */}
      <header 
        className="bg-white border-b shadow-sm"
        style={{ 
          backgroundColor: theme?.colors?.secondary || '#ffffff',
          borderColor: theme?.colors?.primary || '#e5e7eb'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="h-8 w-auto mr-3 object-contain" />
              ) : null}
              <h1 
                className="text-2xl font-bold"
                style={{ 
                  color: primaryColor,
                  fontFamily: headingFont
                }}
              >
                {store.name}
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              {pages.map((page) => (
                <Link 
                  key={page.id}
                  href={`/stores/${store.slug}/pages/${page.slug}`}
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: theme?.colors?.text || '#1f2937' }}
                >
                  {page.title}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: theme?.colors?.text || '#1f2937' }}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {getCartItemCountForStore(slug) > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    {getCartItemCountForStore(slug)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dynamic Components */}
      {components.length > 0 ? (
        <main>
          {components.map((component) => (
            <div key={component.id} className="py-8">
              {renderComponent(component)}
            </div>
          ))}
        </main>
      ) : (
        <>
          {/* Default Hero Section */}
          <section 
            className="py-20 text-center"
            style={{ backgroundColor: theme?.colors?.secondary || '#f8fafc' }}
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 
                className="text-4xl md:text-6xl font-bold mb-6"
                style={{ 
                  color: primaryColor,
                  fontFamily: headingFont
                }}
              >
                Welcome to {store.name}
              </h2>
              <p 
                className="text-xl mb-8 max-w-2xl mx-auto"
                style={{ color: theme?.colors?.text || '#1f2937' }}
              >
                {store.description || 'Discover amazing products at great prices'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/stores/${store.slug}/pages/home`}
                  className="px-8 py-3 rounded-lg font-semibold text-lg text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: accentColor }}
                >
                  Shop Now
                </Link>
                <Link
                  href={`/stores/${store.slug}/pages/about`}
                  className="px-8 py-3 rounded-lg font-semibold text-lg border-2 transition-colors hover:opacity-80"
                  style={{ 
                    borderColor: primaryColor,
                    color: primaryColor
                  }}
                >
                  Learn More
                </Link>
              </div>
            </div>
          </section>

          {/* Default Features Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 
                className="text-3xl font-bold text-center mb-12"
                style={{ 
                  color: primaryColor,
                  fontFamily: headingFont
                }}
              >
                Why Choose {store.name}?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Quality Products',
                    description: 'We carefully select each item to ensure the highest quality.',
                    icon: '✨'
                  },
                  {
                    title: 'Fast Shipping',
                    description: 'Quick delivery to get your products to you faster.',
                    icon: '🚚'
                  },
                  {
                    title: 'Great Support',
                    description: 'Our team is here to help with any questions you have.',
                    icon: '💬'
                  }
                ].map((feature, index) => (
                  <div key={index} className="text-center">
                    <div 
                      className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: theme?.colors?.secondary || '#f8fafc' }}
                    >
                      {feature.icon}
                    </div>
                    <h4 
                      className="text-xl font-semibold mb-2"
                      style={{ 
                        color: primaryColor,
                        fontFamily: headingFont
                      }}
                    >
                      {feature.title}
                    </h4>
                    <p style={{ color: theme?.colors?.text || '#1f2937' }}>
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Default CTA Section */}
          <section 
            className="py-16"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: headingFont }}>
                Ready to Get Started?
              </h3>
              <p className="text-xl text-white/90 mb-8">
                Browse our products and find exactly what you&apos;re looking for.
              </p>
              <Link
                href={`/stores/${store.slug}/pages/home`}
                className="inline-block px-8 py-3 bg-white rounded-lg font-semibold text-lg transition-colors hover:bg-gray-100"
                style={{ color: primaryColor }}
              >
                View Products
              </Link>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer 
        className="py-12 border-t"
        style={{ 
          backgroundColor: theme?.colors?.secondary || '#f8fafc',
          borderColor: theme?.colors?.primary || '#e5e7eb'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 
              className="text-lg font-semibold mb-4"
              style={{ 
                color: primaryColor,
                fontFamily: headingFont
              }}
            >
              {store.name}
            </h4>
            <p style={{ color: theme?.colors?.text || '#1f2937' }}>
              {store.description || 'Your trusted online store'}
            </p>
            <div className="mt-6 flex justify-center flex-wrap gap-6">
              {pages.length > 0 ? (
                pages.map((page) => (
                  <Link 
                    key={page.id}
                    href={`/stores/${store.slug}/pages/${page.slug}`} 
                    className="hover:opacity-80 transition-opacity" 
                    style={{ color: theme?.colors?.text || '#1f2937' }}
                  >
                    {page.title}
                  </Link>
                ))
              ) : (
                <>
                  <Link href={`/stores/${store.slug}/pages/about`} className="hover:opacity-80" style={{ color: theme?.colors?.text || '#1f2937' }}>
                    About
                  </Link>
                  <Link href={`/stores/${store.slug}/pages/contact`} className="hover:opacity-80" style={{ color: theme?.colors?.text || '#1f2937' }}>
                    Contact
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        storeSlug={slug}
        theme={theme || undefined}
      />
    </div>
  )
}
