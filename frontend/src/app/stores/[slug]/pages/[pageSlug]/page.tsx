"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Head from 'next/head'
import { api } from '@/lib/api'
import { Store, Page, PageComponent, ThemeConfig, Product } from '@/types'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useCart } from '@/contexts/CartContext'
import { ProductCarousel } from '@/components/ui/carousel'
import { CartDrawer } from '@/components/cart/CartDrawer'

export default function StoreCustomPage() {
  const params = useParams()
  const slug = params.slug as string
  const pageSlug = params.pageSlug as string
  
  const [store, setStore] = useState<Store | null>(null)
  const [page, setPage] = useState<Page | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState<Record<string, unknown> | null>(null)
  const [pageComponents, setPageComponents] = useState<PageComponent[]>([])
  const [pageTheme, setPageTheme] = useState<ThemeConfig | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { addToCart, getCartItemCountForStore } = useCart()

  const loadStoreAndPage = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Load store info
      const storeResponse = await api.getStoreBySlug(slug)
      const storeData = storeResponse.data as Store
      setStore(storeData)

      // Prefer using the saved home page (store layout) theme as the default theme for all pages
      try {
        const layoutResponse = await api.getPublicStoreLayout(slug)
        const layoutData = layoutResponse.data as { theme?: ThemeConfig }
        if (layoutData?.theme) {
          setTheme(layoutData.theme as unknown as Record<string, unknown>)
        } else if (storeData.template_id) {
          // Fallback to template configuration if no saved theme
          try {
            const templateResponse = await api.getTemplate(storeData.template_id)
            const templateData = templateResponse.data as { config: string | Record<string, unknown> }
            const templateConfig = typeof templateData.config === 'string' 
              ? JSON.parse(templateData.config)
              : templateData.config
            setTheme(templateConfig)
          } catch {
            console.warn('Could not load theme configuration from template')
          }
        }
      } catch {
        // If store layout theme could not be loaded, fallback to template (if available)
        if (storeData.template_id) {
          try {
            const templateResponse = await api.getTemplate(storeData.template_id)
            const templateData = templateResponse.data as { config: string | Record<string, unknown> }
            const templateConfig = typeof templateData.config === 'string' 
              ? JSON.parse(templateData.config)
              : templateData.config
            setTheme(templateConfig)
          } catch {
            console.warn('Could not load theme configuration')
          }
        }
      }

      // Load all pages for navigation
      try {
        const pagesResponse = await api.getStorePages(slug)
        const pagesData = Array.isArray(pagesResponse.data) ? pagesResponse.data : []
        setPages(pagesData as Page[])
      } catch {
        console.warn('Could not load store pages')
        setPages([])
      }

      // Load products for this store (for product components)
      try {
        const productsResponse = await api.getStoreProducts(slug)
        const productsData = Array.isArray(productsResponse.data) ? productsResponse.data : []
        setProducts(productsData)
      } catch {
        console.warn('Could not load store products')
        setProducts([])
      }

      // Try to load the specific page
      try {
        const pageResponse = await api.getStorePage(slug, pageSlug)
        const pageData = pageResponse.data as Page
        setPage(pageData)
        
        // Try to load page layout if page exists
        if (pageData.id) {
          try {
            const layoutResponse = await api.getPublicPageLayout(slug, pageSlug)
            const layoutData = layoutResponse.data as {
              components: PageComponent[]
              theme: ThemeConfig
            }
            
            if (layoutData.components && layoutData.components.length > 0) {
              setPageComponents(layoutData.components.sort((a, b) => a.order - b.order))
              console.log(`Loaded page layout with ${layoutData.components.length} components`)
            }
            
            if (layoutData.theme) {
              setPageTheme(layoutData.theme)
            }
          } catch (layoutError) {
            console.warn('Could not load page layout:', layoutError)
          }
        }
      } catch {
        // Page doesn't exist, show default content based on slug
        setPage(getDefaultPageContent(pageSlug))
      }
    } catch (error) {
      console.error('Failed to load store:', error)
      toast.error('Store not found')
    } finally {
      setIsLoading(false)
    }
  }, [slug, pageSlug])

  useEffect(() => {
    if (slug && pageSlug) {
      loadStoreAndPage()
    }
  }, [slug, pageSlug, loadStoreAndPage])

  const getDefaultPageContent = (pageSlug: string): Page => {
    const defaultPages: { [key: string]: Page } = {
      about: {
        id: 0,
        title: 'About Us',
        slug: 'about',
        content: `
          <h2>About Our Store</h2>
          <p>Welcome to our store! We are passionate about providing high-quality products and exceptional customer service.</p>
          
          <h3>Our Mission</h3>
          <p>To deliver amazing products that make our customers' lives better while building lasting relationships based on trust and satisfaction.</p>
          
          <h3>Our Story</h3>
          <p>Founded with a vision to create something special, our store has grown from a small idea into a trusted destination for customers worldwide.</p>
          
          <h3>Why Choose Us?</h3>
          <ul>
            <li>High-quality products carefully selected for you</li>
            <li>Fast and reliable shipping</li>
            <li>Excellent customer support</li>
            <li>Satisfaction guarantee</li>
          </ul>
        `,
        type: 'about',
        is_published: true,
        store_id: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      contact: {
        id: 0,
        title: 'Contact Us',
        slug: 'contact',
        content: `
          <h2>Get In Touch</h2>
          <p>We'd love to hear from you! Reach out to us with any questions, concerns, or feedback.</p>
          
          <h3>Contact Information</h3>
          <p><strong>Email:</strong> info@${store?.slug || 'store'}.com</p>
          <p><strong>Phone:</strong> (555) 123-4567</p>
          <p><strong>Address:</strong> 123 Store Street, City, State 12345</p>
          
          <h3>Business Hours</h3>
          <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM</p>
          <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM</p>
          <p><strong>Sunday:</strong> Closed</p>
          
          <h3>Send Us a Message</h3>
          <p>For the fastest response, please email us at info@${store?.slug || 'store'}.com. We typically respond within 24 hours.</p>
        `,
        is_active: true
      },
      privacy: {
        id: 0,
        title: 'Privacy Policy',
        slug: 'privacy',
        content: `
          <h2>Privacy Policy</h2>
          <p><em>Last updated: ${new Date().toLocaleDateString()}</em></p>
          
          <h3>Information We Collect</h3>
          <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us.</p>
          
          <h3>How We Use Your Information</h3>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process your orders and payments</li>
            <li>Send you important updates about your orders</li>
            <li>Improve our products and services</li>
            <li>Respond to your inquiries and provide customer support</li>
          </ul>
          
          <h3>Information Sharing</h3>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
          
          <h3>Data Security</h3>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          
          <h3>Contact Us</h3>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@${store?.slug || 'store'}.com.</p>
        `,
        type: 'privacy',
        is_published: true,
        store_id: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      terms: {
        id: 0,
        title: 'Terms of Service',
        slug: 'terms',
        content: `
          <h2>Terms of Service</h2>
          <p><em>Last updated: ${new Date().toLocaleDateString()}</em></p>
          
          <h3>Acceptance of Terms</h3>
          <p>By using our website and services, you agree to be bound by these Terms of Service.</p>
          
          <h3>Use of Our Service</h3>
          <p>You may use our service for lawful purposes only. You agree not to use the service:</p>
          <ul>
            <li>In any way that violates applicable laws or regulations</li>
            <li>To transmit any harmful or malicious code</li>
            <li>To interfere with or disrupt our services</li>
          </ul>
          
          <h3>Orders and Payments</h3>
          <p>All orders are subject to acceptance and availability. Prices are subject to change without notice.</p>
          
          <h3>Returns and Refunds</h3>
          <p>Please see our Return Policy for detailed information about returns and refunds.</p>
          
          <h3>Limitation of Liability</h3>
          <p>Our liability is limited to the maximum extent permitted by law.</p>
          
          <h3>Changes to Terms</h3>
          <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.</p>
        `,
        type: 'terms',
        is_published: true,
        store_id: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    return defaultPages[pageSlug] || {
      id: 0,
      title: 'Page Not Found',
      slug: pageSlug,
      content: '<h2>Page Not Found</h2><p>The page you are looking for does not exist.</p>',
      type: 'custom',
      is_published: false,
      store_id: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  // Render page components (similar to store page)
  const renderPageComponent = (component: PageComponent) => {
    const baseStyles = {
      backgroundColor: pageTheme?.colors?.background || themeColors?.background || '#ffffff',
      color: pageTheme?.colors?.text || themeColors?.text || '#1f2937',
      fontFamily: pageTheme?.fonts?.body || themeFonts?.body || 'Inter'
    }

    const primaryColor = pageTheme?.colors?.primary || themeColors?.primary || '#3b82f6'
    const accentColor = pageTheme?.colors?.accent || themeColors?.accent || '#8b5cf6'
    const headingFont = pageTheme?.fonts?.heading || themeFonts?.heading || 'Inter'

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
            {component.props.overlay && (
              <div className="absolute inset-0 bg-black opacity-50"></div>
            )}
            
            <div className="relative z-10 max-w-4xl px-6 py-12">
              <h1 
                className="text-4xl md:text-6xl font-bold mb-6"
                style={{ 
                  color: component.props.textColor || '#ffffff',
                  fontFamily: headingFont
                }}
              >
                {component.props.title || 'Welcome'}
              </h1>
              {component.props.subtitle && (
                <p 
                  className="text-xl md:text-2xl mb-8 opacity-90"
                  style={{ color: component.props.textColor || '#ffffff' }}
                >
                  {component.props.subtitle}
                </p>
              )}
              {component.props.buttonText && component.props.buttonUrl && (
                <Link 
                  href={component.props.buttonUrl}
                  className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  {component.props.buttonText}
                </Link>
              )}
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
                  className="w-full h-full"
                  style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)` }}
                ></div>
              )}
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* Content */}
            <div className="relative z-10 max-w-4xl px-6 py-12">
              <h1 
                className="text-4xl md:text-6xl font-bold mb-6 text-white"
                style={{ fontFamily: headingFont }}
              >
                {component.props.title || 'Welcome'}
              </h1>
              {component.props.subtitle && (
                <p className="text-xl md:text-2xl mb-8 text-white opacity-90">
                  {component.props.subtitle}
                </p>
              )}
              {component.props.buttonText && component.props.buttonUrl && (
                <Link 
                  href={component.props.buttonUrl}
                  className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  {component.props.buttonText}
                </Link>
              )}
            </div>
          </section>
        )

      case 'product-carousel': {
        let carouselProducts: Product[] = []
        if (Array.isArray(component.props.selectedProducts) && component.props.selectedProducts.length > 0) {
          const selectedIds = component.props.selectedProducts as number[]
          carouselProducts = products.filter(p => selectedIds.includes(p.id as number))
          if (carouselProducts.length === 0 && products.length > 0) {
            carouselProducts = products
          }
        } else {
          carouselProducts = products
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
              {carouselProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No products available</div>
              ) : (
                <ProductCarousel
                  products={carouselProducts.map(p => ({
                    id: p.id as number,
                    name: p.name,
                    price: p.price,
                    comparePrice: (p as any).compare_price,
                    images: p.images || [],
                    slug: p.slug
                  }))}
                  slidesToShow={Number(component.props.slidesToShow) || 4}
                  autoplay={Boolean(component.props.autoplay)}
                  showDots={Boolean(component.props.showDots)}
                  showArrows={true}
                  infinite={true}
                  showAddToCart={true}
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
                    { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1 } },
                    { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1 } },
                    { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } }
                  ]}
                />
              )}
            </div>
          </section>
        )
      }

      case 'feature-list':
        return (
          <section key={component.id} className="py-16" style={baseStyles}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 
                  className="text-3xl md:text-4xl font-bold mb-4"
                  style={{ 
                    color: primaryColor,
                    fontFamily: headingFont
                  }}
                >
                  {component.props.title || 'Features'}
                </h2>
                {component.props.subtitle && (
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {component.props.subtitle}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-2xl text-blue-600 dark:text-blue-400">✨</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      Feature {i}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      This is a sample feature description that showcases what your store offers.
                    </p>
                  </div>
                ))}
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

      case 'product-grid': {
        const selectedIds = Array.isArray(component.props.selectedProducts) ? (component.props.selectedProducts as number[]) : []
        const gridProducts: Product[] = selectedIds.length > 0
          ? products.filter(p => selectedIds.includes(p.id as number))
          : products

        return (
          <section key={component.id} className="py-16" style={baseStyles}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 
                className="text-3xl font-bold text-center mb-12"
                style={{ color: primaryColor, fontFamily: headingFont }}
              >
                {String(component.props.title || 'Featured Products')}
              </h2>
              {gridProducts.length === 0 ? (
                <div className="text-center text-gray-500">No products available</div>
              ) : (
                <div className={`${
                  Number(component.props.columns) === 4 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' :
                  Number(component.props.columns) === 3 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' :
                  Number(component.props.columns) === 2 ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : 'grid grid-cols-1 gap-6'
                }`}>
                  {gridProducts.map((p) => (
                    <div key={p.id} className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <div className="aspect-square overflow-hidden">
                        {p.images && p.images[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 
                          className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors"
                          style={{ color: primaryColor, fontFamily: headingFont }}
                        >
                          {p.name}
                        </h3>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold" style={{ color: accentColor }}>{`$${p.price.toFixed(2)}`}</span>
                            {(p as any).compare_price && (p as any).compare_price > p.price && (
                              <span className="text-sm text-gray-500 line-through">{`$${(p as any).compare_price.toFixed(2)}`}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="flex-1 py-2 px-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                            style={{ backgroundColor: accentColor }}
                            onClick={() => addToCart({
                              id: p.id as number,
                              name: p.name,
                              price: p.price,
                              comparePrice: (p as any).compare_price,
                              image: p.images?.[0] || '',
                              slug: p.slug || '',
                              storeSlug: slug
                            })}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )
      }

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
                {String(component.props.subtitle || 'Browse our products and find exactly what you\'re looking for.')}
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

      case 'contact-info':
        return (
          <section key={component.id} className="py-16" style={{ backgroundColor: themeColors?.secondary || '#f8fafc' }}>
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
          </section>
        )

      case 'newsletter':
        return (
          <section key={component.id} className="py-12 sm:py-16" style={{ backgroundColor: themeColors?.secondary || '#f8fafc' }}>
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
                    placeholder={String(component.props.placeholder || 'Enter your email')}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    style={{ 
                      backgroundColor: '#ffffff',
                      color: baseStyles.color
                    }}
                  />
                  <button 
                    className="px-6 py-3 rounded-lg sm:rounded-l-none sm:rounded-r-lg font-semibold text-white transition-colors hover:opacity-90 text-base"
                    style={{ backgroundColor: accentColor }}
                  >
                    {String(component.props.buttonText || 'Subscribe')}
                  </button>
                </div>
                <p className="mt-3 text-sm text-gray-500 px-2">
                  We'll send you updates and special offers
                </p>
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
                          className={`h-5 w-5 ${starIndex < (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="mb-4 italic" style={{ color: baseStyles.color }}>
                      &ldquo;{String(testimonial.comment || 'Great product and excellent service!')}&rdquo;
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
          </section>
        )

      case 'reviews-grid':
        return (
          <section key={component.id} className="py-16" style={baseStyles}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      &ldquo;{String(review.comment || 'Great product and excellent service!')}&rdquo;
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
          </section>
        )

      case 'social-proof':
        return (
          <section key={component.id} className="py-16" style={{ backgroundColor: themeColors?.secondary || '#f8fafc' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    {logo.url && logo.url.trim() ? (
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
          </section>
        )

      case 'icon-grid':
        return (
          <section key={component.id} className="py-16" style={baseStyles}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      style={{ backgroundColor: themeColors?.secondary || '#f8fafc' }}
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
          </section>
        )

      case 'before-after':
        return (
          <section key={component.id} className="py-16" style={baseStyles}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    {component.props.beforeImage && component.props.beforeImage.toString().trim() ? (
                      <img 
                        src={String(component.props.beforeImage)} 
                        alt="Before"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="200" y="150" text-anchor="middle" fill="%236b7280" font-size="16"%3EBefore%3C/text%3E%3C/svg%3E'
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
                    {component.props.afterImage && component.props.afterImage.toString().trim() ? (
                      <img 
                        src={String(component.props.afterImage)} 
                        alt="After"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="200" y="150" text-anchor="middle" fill="%236b7280" font-size="16"%3EAfter%3C/text%3E%3C/svg%3E'
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
          </section>
        )

      case 'product-categories':
        return (
          <section key={component.id} className="py-16" style={baseStyles}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      {category.image && category.image.toString().trim() ? (
                        <img 
                          src={String(category.image)} 
                          alt={String(category.name || 'Category')}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect width="300" height="300" fill="%23f3f4f6"/%3E%3Ctext x="150" y="150" text-anchor="middle" fill="%236b7280" font-size="14"%3E' + String(category.name || 'Category') + '%3C/text%3E%3C/svg%3E'
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
          </section>
        )

      case 'image-text':
        return (
          <section key={component.id} className="py-16" style={baseStyles}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                component.props.imagePosition === 'right' ? 'lg:grid-flow-col-dense' : ''
              }`}>
                {/* Image */}
                <div className={`order-1 ${component.props.imagePosition === 'right' ? 'lg:order-2' : ''}`}>
                  {component.props.image && component.props.image.toString().trim() ? (
                    <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                      <img 
                        src={String(component.props.image)} 
                        alt="Content"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23f3f4f6"/%3E%3Ctext x="300" y="200" text-anchor="middle" fill="%236b7280" font-size="16"%3EContent Image%3C/text%3E%3C/svg%3E'
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
                    <Link
                      href={`/stores/${store?.slug}/pages/home`}
                      className="inline-block px-6 py-3 rounded-lg font-semibold text-lg transition-colors hover:opacity-90"
                      style={{ 
                        backgroundColor: primaryColor,
                        color: '#ffffff'
                      }}
                    >
                      {String(component.props.buttonText || 'Read More')}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        )

      case 'stats-counter':
        return (
          <section key={component.id} className="py-16" style={{ backgroundColor: themeColors?.secondary || '#f8fafc' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
          </section>
        )

      case 'hero-split':
        return (
          <section key={component.id} className="min-h-80 md:min-h-96 lg:min-h-[500px]" style={baseStyles}>
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
                  <Link
                    href={`/stores/${store?.slug}/pages/home`}
                    className="inline-block px-8 py-4 rounded-lg font-semibold text-lg text-white transition-all hover:scale-105 shadow-lg"
                    style={{ backgroundColor: accentColor }}
                  >
                    {String(component.props.buttonText || 'View Collection')}
                  </Link>
                </div>
                
                {/* Image */}
                <div className={`${component.props.imagePosition === 'right' ? 'order-2' : 'order-1 lg:order-2'}`}>
                  <div 
                    className="aspect-square lg:aspect-[4/3] rounded-2xl bg-cover bg-center bg-no-repeat shadow-2xl"
                    style={{
                      backgroundImage: component.props.image && component.props.image.toString().trim() ? `url(${component.props.image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundColor: accentColor
                    }}
                  >
                    {(!component.props.image || !component.props.image.toString().trim()) && (
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
          </section>
        )

      case 'product-showcase': {
        const featuredId = (component.props as any).featuredProduct as number | undefined
        const showcaseProduct: Product | undefined = featuredId
          ? products.find(p => (p.id as number) === featuredId)
          : products[0]

        if (!showcaseProduct) {
          return (
            <section key={component.id} className="py-16" style={baseStyles}>
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                No products available
              </div>
            </section>
          )
        }

        return (
          <section key={component.id} className="py-16" style={baseStyles}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
                  {showcaseProduct.images && showcaseProduct.images[0] ? (
                    <img src={showcaseProduct.images[0]} alt={showcaseProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-4" style={{ color: primaryColor, fontFamily: headingFont }}>
                    {showcaseProduct.name}
                  </h2>
                  <div className="flex items-center space-x-4 mb-6">
                    <span className="text-2xl font-bold" style={{ color: accentColor }}>{`$${showcaseProduct.price.toFixed(2)}`}</span>
                    {(showcaseProduct as any).compare_price && (showcaseProduct as any).compare_price > showcaseProduct.price && (
                      <span className="text-lg line-through text-gray-500">{`$${(showcaseProduct as any).compare_price.toFixed(2)}`}</span>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      className="px-6 py-3 rounded-lg font-semibold text-white transition-colors hover:opacity-90"
                      style={{ backgroundColor: accentColor }}
                      onClick={() => addToCart({
                        id: showcaseProduct.id as number,
                        name: showcaseProduct.name,
                        price: showcaseProduct.price,
                        comparePrice: (showcaseProduct as any).compare_price,
                        image: showcaseProduct.images?.[0] || '',
                        slug: showcaseProduct.slug || '',
                        storeSlug: slug
                      })}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )
      }

      default:
        return (
          <section key={component.id} className="py-8" style={baseStyles}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Component type "{component.type}" is not yet supported in page rendering.
                </p>
              </div>
            </div>
          </section>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Not Found</h1>
          <p className="text-gray-600 mb-6">The store you're looking for doesn't exist or is not active.</p>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const themeColors = theme?.colors as Record<string, string> | undefined
  const themeFonts = theme?.fonts as Record<string, string> | undefined
  
  const themeStyles = {
    backgroundColor: themeColors?.background || '#ffffff',
    color: themeColors?.text || '#1f2937',
    fontFamily: themeFonts?.body || 'Inter'
  }
  const primaryColor = themeColors?.primary || '#3b82f6'
  const headingFont = themeFonts?.heading || 'Inter'

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
          backgroundColor: themeColors?.secondary || '#ffffff',
          borderColor: themeColors?.primary || '#e5e7eb'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
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
              {pages.map((navPage) => (
                <Link 
                  key={navPage.id}
                  href={`/stores/${store.slug}/pages/${navPage.slug}`}
                  className={navPage.slug === pageSlug ? 'font-semibold' : 'hover:opacity-80 transition-opacity'}
                  style={{ 
                    color: navPage.slug === pageSlug 
                      ? primaryColor 
                      : theme?.colors?.text || '#1f2937' 
                  }}
                >
                  {navPage.title}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: themeColors?.text || '#1f2937' }}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {getCartItemCountForStore(slug) > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: themeColors?.accent || '#10b981' }}
                  >
                    {getCartItemCountForStore(slug)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main>
        {pageComponents.length > 0 ? (
          // Render custom page layout components
          <div>
            {pageComponents.map((component) => renderPageComponent(component))}
          </div>
        ) : (
          // Fallback to static page content
          <div className="py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <article className="prose prose-lg max-w-none">
                <h1 
                  className="text-4xl font-bold mb-8"
                  style={{ 
                    color: primaryColor,
                    fontFamily: headingFont
                  }}
                >
                  {page?.title || 'Page'}
                </h1>
                
                <div 
                  className="content"
                  style={{ color: theme?.colors?.text || '#1f2937' }}
                  dangerouslySetInnerHTML={{ 
                    __html: page?.content || '<p>Page content not found.</p>' 
                  }}
                />
              </article>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer 
        className="py-12 border-t mt-12"
        style={{ 
          backgroundColor: theme?.colors?.secondary || '#f8fafc',
          borderColor: theme?.colors?.primary || '#e5e7eb'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
          <div className="mt-4">
            <Link 
              href={`/stores/${store.slug}`}
              className="inline-block px-4 py-2 rounded-lg border transition-colors hover:opacity-80"
              style={{ 
                borderColor: primaryColor,
                color: primaryColor
              }}
            >
              ← Back to Store
            </Link>
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