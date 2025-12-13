"use client"

import { useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface CarouselProps {
  children: ReactNode[]
  slidesToShow?: number
  slidesToScroll?: number
  autoplay?: boolean
  autoplaySpeed?: number
  showDots?: boolean
  showArrows?: boolean
  infinite?: boolean
  responsive?: {
    breakpoint: number
    settings: {
      slidesToShow: number
      slidesToScroll?: number
    }
  }[]
  className?: string
}

export function Carousel({
  children,
  slidesToShow = 3,
  slidesToScroll = 1,
  autoplay = false,
  autoplaySpeed = 3000,
  showDots = true,
  showArrows = true,
  infinite = true,
  responsive = [
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
  ],
  className = ''
}: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentSlidesToShow, setCurrentSlidesToShow] = useState(slidesToShow)
  const [isHovered, setIsHovered] = useState(false)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalSlides = children.length
  const maxSlide = Math.max(0, totalSlides - currentSlidesToShow)

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      let newSlidesToShow = slidesToShow

      // Sort responsive breakpoints from largest to smallest
      const sortedResponsive = [...responsive].sort((a, b) => b.breakpoint - a.breakpoint)
      
      // Find the first breakpoint that matches (largest breakpoint that screen width is <= to)
      for (const { breakpoint, settings } of sortedResponsive) {
        if (width <= breakpoint) {
          newSlidesToShow = settings.slidesToShow
          break // Use the first (largest) matching breakpoint
        }
      }

      setCurrentSlidesToShow(newSlidesToShow)
      
      // Debug logging
      console.log('Carousel Responsive Debug:', {
        screenWidth: width,
        requestedSlidesToShow: slidesToShow,
        actualSlidesToShow: newSlidesToShow,
        totalSlides,
        responsiveBreakpoints: sortedResponsive.map(r => ({ breakpoint: r.breakpoint, slidesToShow: r.settings.slidesToShow }))
      })
      
      // Adjust current slide if needed
      const newMaxSlide = Math.max(0, totalSlides - newSlidesToShow)
      if (currentSlide > newMaxSlide) {
        setCurrentSlide(newMaxSlide)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [slidesToShow, responsive, totalSlides, currentSlide])

  // Autoplay functionality
  const startAutoplay = useCallback(() => {
    if (autoplay && !isHovered && totalSlides > currentSlidesToShow) {
      autoplayRef.current = setInterval(() => {
        setCurrentSlide(prev => {
          if (infinite) {
            return prev >= maxSlide ? 0 : Math.min(prev + slidesToScroll, maxSlide)
          } else {
            return prev >= maxSlide ? prev : Math.min(prev + slidesToScroll, maxSlide)
          }
        })
      }, autoplaySpeed)
    }
  }, [autoplay, isHovered, totalSlides, currentSlidesToShow, maxSlide, slidesToScroll, autoplaySpeed, infinite])

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current)
      autoplayRef.current = null
    }
  }, [])

  useEffect(() => {
    startAutoplay()
    return stopAutoplay
  }, [startAutoplay, stopAutoplay])

  useEffect(() => {
    if (isHovered) {
      stopAutoplay()
    } else {
      startAutoplay()
    }
  }, [isHovered, startAutoplay, stopAutoplay])

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(Math.max(0, Math.min(slideIndex, maxSlide)))
  }

  const nextSlide = () => {
    console.log('nextSlide called:', { currentSlide, maxSlide, slidesToScroll, infinite })
    if (currentSlide < maxSlide) {
      const newSlide = Math.min(currentSlide + slidesToScroll, maxSlide)
      console.log('Setting currentSlide to:', newSlide)
      setCurrentSlide(newSlide)
    } else if (infinite) {
      console.log('Infinite loop: setting currentSlide to 0')
      setCurrentSlide(0)
    }
  }

  const prevSlide = () => {
    console.log('prevSlide called:', { currentSlide, maxSlide, slidesToScroll, infinite })
    if (currentSlide > 0) {
      const newSlide = Math.max(currentSlide - slidesToScroll, 0)
      console.log('Setting currentSlide to:', newSlide)
      setCurrentSlide(newSlide)
    } else if (infinite) {
      console.log('Infinite loop: setting currentSlide to maxSlide:', maxSlide)
      setCurrentSlide(maxSlide)
    }
  }

  // Calculate slide width and translation
  const slideWidth = 100 / currentSlidesToShow
  const translateX = -(currentSlide * slideWidth)
  
  // Debug logging for navigation and calculations
  console.log('Carousel Debug:', {
    currentSlide,
    maxSlide,
    totalSlides,
    currentSlidesToShow,
    slidesToScroll,
    infinite,
    slideWidth: `${slideWidth}%`,
    translateX: `${translateX}%`
  })

  if (totalSlides === 0) {
    return <div className={`carousel-container ${className}`}>No items to display</div>
  }

  // If fewer items than slidesToShow, don't show navigation
  const showNavigation = totalSlides > currentSlidesToShow

  return (
    <div 
      className={`carousel-container relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={containerRef}
    >
      {/* Carousel Track */}
      <div className="carousel-track-container overflow-hidden">
        <div 
          className="carousel-track flex transition-transform duration-300 ease-in-out"
          style={{ 
            transform: `translateX(${translateX}%)`,
            width: `${(totalSlides / currentSlidesToShow) * 100}%`
          }}
        >
          {children.map((child, index) => (
            <div 
              key={index}
              className="carousel-slide flex-shrink-0"
              style={{ width: `${slideWidth}%` }}
            >
              <div className="p-2">
                {child}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && showNavigation && (
        <>
          <button
            onClick={() => {
              console.log('Prev button clicked. Current slide:', currentSlide, 'Max slide:', maxSlide)
              prevSlide()
            }}
            className="carousel-arrow carousel-arrow-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
            disabled={!infinite && currentSlide === 0}
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
          </button>
          <button
            onClick={() => {
              console.log('Next button clicked. Current slide:', currentSlide, 'Max slide:', maxSlide)
              nextSlide()
            }}
            className="carousel-arrow carousel-arrow-next absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
            disabled={!infinite && currentSlide >= maxSlide}
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && showNavigation && (
        <div className="carousel-dots flex justify-center space-x-2 mt-4">
          {Array.from({ length: Math.ceil(maxSlide / slidesToScroll) + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index * slidesToScroll)}
              className={`carousel-dot w-2 h-2 rounded-full transition-all duration-200 ${
                Math.floor(currentSlide / slidesToScroll) === index
                  ? 'bg-blue-600 w-4'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Product Carousel specific component
interface ProductCarouselProps extends Omit<CarouselProps, 'children'> {
  products: Array<{
    id: number | string
    name: string
    price: number
    comparePrice?: number
    images: string[]
    slug?: string
  }>
  onProductClick?: (product: any) => void
  onAddToCart?: (product: any) => void
  currency?: string
  showPrice?: boolean
  showComparePrice?: boolean
  showAddToCart?: boolean
  storeSlug?: string
}

export function ProductCarousel({
  products,
  onProductClick,
  onAddToCart,
  currency = '$',
  showPrice = true,
  showComparePrice = true,
  showAddToCart = true,
  storeSlug,
  ...carouselProps
}: ProductCarouselProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No products to display</div>
      </div>
    )
  }

  const productSlides = products.map((product) => (
    <div
      key={product.id}
      className="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Product Image */}
      <div 
        className="aspect-[2/1] bg-gray-200 overflow-hidden cursor-pointer"
        onClick={() => onProductClick?.(product)}
      >
        {product.images && product.images.length > 0 && product.images[0] && product.images[0].trim() ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect width="300" height="300" fill="%23f3f4f6"/%3E%3Ctext x="150" y="150" text-anchor="middle" fill="%236b7280" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 
          className="font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors" 
          title={product.name}
          onClick={() => onProductClick?.(product)}
        >
          {product.name}
        </h3>
        
        {showPrice && (
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg font-bold text-gray-900">
              {currency}{product.price.toFixed(2)}
            </span>
            {showComparePrice && product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {currency}{product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        {showAddToCart && onAddToCart && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(product)
            }}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  ))

  return (
    <Carousel {...carouselProps}>
      {productSlides}
    </Carousel>
  )
}