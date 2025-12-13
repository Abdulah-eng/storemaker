"use client"

import { useState } from 'react'
import { 
  RectangleStackIcon,
  PhotoIcon,
  ListBulletIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  MapPinIcon,
  PlayIcon,
  ShoppingBagIcon,
  TagIcon,
  MegaphoneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface ComponentLibraryProps {
  onAddComponent: (type: string, props: any) => void
  selectedComponent: string | null
  onClose?: () => void
}

interface ComponentTemplate {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  description: string
  defaultProps: any
}

const componentTemplates: ComponentTemplate[] = [
  // Hero Components
  {
    id: 'hero-banner',
    name: 'Hero Banner',
    icon: RectangleStackIcon,
    category: 'hero',
    description: 'Large banner with title, subtitle, and call-to-action',
    defaultProps: {
      title: 'Welcome to Our Store',
      subtitle: 'Discover amazing products at great prices',
      buttonText: 'Shop Now',
      backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop',
      overlay: true,
      secondaryButton: false,
      secondaryButtonText: 'Learn More'
    }
  },
  {
    id: 'hero-split',
    name: 'Split Hero',
    icon: RectangleStackIcon,
    category: 'hero',
    description: 'Split layout with content on one side, image on other',
    defaultProps: {
      title: 'New Collection',
      subtitle: 'Explore our latest arrivals',
      buttonText: 'View Collection',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
      imagePosition: 'right'
    }
  },

  // Product Components
  {
    id: 'product-grid',
    name: 'Product Grid',
    icon: ShoppingBagIcon,
    category: 'products',
    description: 'Grid layout displaying featured products',
    defaultProps: {
      title: 'Featured Products',
      columns: 3,
      showPrice: true,
      showRating: true,
      maxProducts: 6,
      selectedProducts: [] // Array of product IDs
    }
  },
  {
    id: 'product-carousel',
    name: 'Product Carousel',
    icon: ShoppingBagIcon,
    category: 'products',
    description: 'Sliding carousel of products',
    defaultProps: {
      title: 'Trending Now',
      autoplay: true,
      showDots: true,
      slidesToShow: 4,
      selectedProducts: [] // Array of product IDs
    }
  },
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    icon: ShoppingBagIcon,
    category: 'products',
    description: 'Featured product with detailed information',
    defaultProps: {
      title: 'Featured Product',
      featuredProduct: null, // Product ID
      showPrice: true,
      showDescription: true,
      buttonText: 'Add to Cart'
    }
  },

  // Content Components
  {
    id: 'image-gallery',
    name: 'Image Gallery',
    icon: PhotoIcon,
    category: 'media',
    description: 'Grid of images with lightbox functionality',
    defaultProps: {
      title: 'Gallery',
      columns: 3,
      spacing: 'medium',
      lightbox: true,
      images: [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1554306297-0c86e924d3d2?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
      ]
    }
  },
  {
    id: 'video-embed',
    name: 'Video Player',
    icon: PlayIcon,
    category: 'media',
    description: 'Embedded video player',
    defaultProps: {
      title: 'Watch Our Story',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      autoplay: false,
      controls: true,
      muted: false
    }
  },

  // Feature Components
  {
    id: 'feature-list',
    name: 'Feature List',
    icon: ListBulletIcon,
    category: 'features',
    description: 'List of features or benefits with icons',
    defaultProps: {
      title: 'Why Choose Us',
      features: [
        { icon: 'shipping', title: 'Free Shipping', description: 'On orders over $50' },
        { icon: 'support', title: '24/7 Support', description: 'Always here to help' },
        { icon: 'returns', title: 'Easy Returns', description: '30-day return policy' }
      ]
    }
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    icon: ChatBubbleLeftRightIcon,
    category: 'social',
    description: 'Customer reviews and testimonials',
    defaultProps: {
      title: 'What Our Customers Say',
      testimonials: [
        {
          name: 'Sarah Johnson',
          rating: 5,
          comment: 'Amazing products and fast shipping!',
          avatar: ''
        }
      ]
    }
  },

  // CTA Components
  {
    id: 'cta-banner',
    name: 'Call to Action',
    icon: MegaphoneIcon,
    category: 'cta',
    description: 'Promotional banner with call-to-action',
    defaultProps: {
      title: 'Special Offer',
      subtitle: 'Get 20% off your first order',
      buttonText: 'Shop Now',
      backgroundColor: '#3b82f6',
      textColor: '#ffffff'
    }
  },
  {
    id: 'newsletter',
    name: 'Newsletter Signup',
    icon: MegaphoneIcon,
    category: 'cta',
    description: 'Email subscription form',
    defaultProps: {
      title: 'Stay Updated',
      subtitle: 'Subscribe to get special offers and updates',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe'
    }
  },

  // Info Components
  {
    id: 'contact-info',
    name: 'Contact Info',
    icon: MapPinIcon,
    category: 'info',
    description: 'Contact details and location',
    defaultProps: {
      title: 'Visit Our Store',
      address: '123 Main Street, City, State 12345',
      phone: '(555) 123-4567',
      email: 'info@store.com',
      hours: 'Mon-Fri: 9AM-6PM'
    }
  },
  {
    id: 'about-section',
    name: 'About Section',
    icon: RectangleStackIcon,
    category: 'info',
    description: 'About us content with image',
    defaultProps: {
      title: 'About Our Store',
      content: 'We are passionate about providing quality products and exceptional customer service. Our team works hard to curate the best selection for our customers.',
      image: '',
      imagePosition: 'left'
    }
  },

  // Additional Hero Components
  {
    id: 'hero-video',
    name: 'Video Hero',
    icon: PlayIcon,
    category: 'hero',
    description: 'Hero section with background video',
    defaultProps: {
      title: 'Experience Excellence',
      subtitle: 'Watch our story unfold',
      buttonText: 'Learn More',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      autoplay: true,
      muted: true
    }
  },
  {
    id: 'hero-minimal',
    name: 'Minimal Hero',
    icon: RectangleStackIcon,
    category: 'hero',
    description: 'Clean, minimal hero with simple text',
    defaultProps: {
      title: 'Simple. Beautiful. Effective.',
      subtitle: 'Discover what matters most',
      alignment: 'center',
      showButton: false
    }
  },


  {
    id: 'product-categories',
    name: 'Category Grid',
    icon: TagIcon,
    category: 'products',
    description: 'Product categories with images',
    defaultProps: {
      title: 'Shop by Category',
      categories: [
        { name: 'Electronics', image: '', itemCount: 45 },
        { name: 'Clothing', image: '', itemCount: 78 },
        { name: 'Home & Garden', image: '', itemCount: 32 },
        { name: 'Sports', image: '', itemCount: 21 }
      ]
    }
  },

  // Additional Media Components
  {
    id: 'image-text',
    name: 'Image + Text',
    icon: PhotoIcon,
    category: 'media',
    description: 'Side-by-side image and text content',
    defaultProps: {
      title: 'Our Story',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: '',
      imagePosition: 'left',
      buttonText: 'Read More',
      showButton: true
    }
  },
  {
    id: 'before-after',
    name: 'Before/After',
    icon: PhotoIcon,
    category: 'media',
    description: 'Before and after comparison images',
    defaultProps: {
      title: 'See the Difference',
      beforeImage: '',
      afterImage: '',
      beforeLabel: 'Before',
      afterLabel: 'After'
    }
  },

  // Additional Feature Components
  {
    id: 'stats-counter',
    name: 'Statistics',
    icon: ListBulletIcon,
    category: 'features',
    description: 'Animated statistics counters',
    defaultProps: {
      title: 'Our Numbers Speak',
      stats: [
        { number: 10000, label: 'Happy Customers' },
        { number: 500, label: 'Products Sold' },
        { number: 50, label: 'Countries Served' },
        { number: 5, label: 'Years Experience' }
      ]
    }
  },
  {
    id: 'icon-grid',
    name: 'Icon Features',
    icon: StarIcon,
    category: 'features',
    description: 'Grid of features with icons',
    defaultProps: {
      title: 'Why Choose Us',
      columns: 4,
      features: [
        { icon: 'truck', title: 'Free Shipping', description: 'On orders over $50' },
        { icon: 'shield', title: 'Secure Payment', description: '100% secure checkout' },
        { icon: 'return', title: 'Easy Returns', description: '30-day return policy' },
        { icon: 'support', title: '24/7 Support', description: 'Always here to help' }
      ]
    }
  },

  // Additional Social Components
  {
    id: 'reviews-grid',
    name: 'Reviews Grid',
    icon: StarIcon,
    category: 'social',
    description: 'Customer reviews in a grid layout',
    defaultProps: {
      title: 'Customer Reviews',
      reviews: [
        { name: 'John Doe', rating: 5, comment: 'Amazing quality and fast shipping!', date: '2 days ago' },
        { name: 'Jane Smith', rating: 5, comment: 'Love this product. Highly recommended!', date: '1 week ago' },
        { name: 'Mike Johnson', rating: 4, comment: 'Great value for money.', date: '2 weeks ago' }
      ]
    }
  },
  {
    id: 'social-proof',
    name: 'Social Proof',
    icon: ChatBubbleLeftRightIcon,
    category: 'social',
    description: 'Social media mentions and logos',
    defaultProps: {
      title: 'As Featured In',
      logos: [],
      subtitle: 'Trusted by thousands of customers worldwide'
    }
  },

  // Layout Components
  {
    id: 'spacer',
    name: 'Spacer',
    icon: RectangleStackIcon,
    category: 'layout',
    description: 'Add vertical spacing between sections',
    defaultProps: {
      height: 60,
      backgroundColor: 'transparent'
    }
  },
  {
    id: 'divider',
    name: 'Divider',
    icon: RectangleStackIcon,
    category: 'layout',
    description: 'Visual divider line between sections',
    defaultProps: {
      style: 'solid',
      color: '#e5e7eb',
      thickness: 1,
      width: '100%'
    }
  }
]

const categories = [
  { id: 'all', name: 'All Components' },
  { id: 'hero', name: 'Hero' },
  { id: 'products', name: 'Products' },
  { id: 'media', name: 'Media' },
  { id: 'features', name: 'Features' },
  { id: 'social', name: 'Social' },
  { id: 'cta', name: 'Call to Action' },
  { id: 'info', name: 'Information' },
  { id: 'layout', name: 'Layout' }
]

export function ComponentLibrary({ onAddComponent, selectedComponent, onClose }: ComponentLibraryProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredComponents = componentTemplates.filter(component => {
    const matchesCategory = activeCategory === 'all' || component.category === activeCategory
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Debug logging (remove in production)
  // console.log('ComponentLibrary Debug:', {
  //   activeCategory,
  //   searchTerm,
  //   totalComponents: componentTemplates.length,
  //   filteredComponents: filteredComponents.length,
  //   categories: categories.map(c => ({ id: c.id, name: c.name }))
  // })

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <div className="p-3 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-dark-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Components
          </h2>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium rounded-full">
              {filteredComponents.length}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="sm:hidden p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg"
                title="Close sidebar"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field w-full mb-4"
        />

        {/* Categories */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Categories</p>
          {categories.map(category => {
            const categoryCount = category.id === 'all' 
              ? componentTemplates.length 
              : componentTemplates.filter(c => c.category === category.id).length
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                  activeCategory === category.id
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-800'
                }`}
              >
                <span>{category.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeCategory === category.id
                    ? 'bg-primary-200 text-primary-800 dark:bg-primary-800 dark:text-primary-200'
                    : 'bg-gray-200 text-gray-600 dark:bg-dark-700 dark:text-gray-400'
                }`}>
                  {categoryCount}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Components List */}
      <div className="flex-1 p-3 sm:p-6 lg:p-8 space-y-3 overflow-y-auto min-h-0">
        {filteredComponents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="mb-4">
              <svg className="h-12 w-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm">No components found</p>
            <p className="text-xs mt-1">Try selecting a different category or search term</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing {filteredComponents.length} component{filteredComponents.length !== 1 ? 's' : ''} in {activeCategory === 'all' ? 'all categories' : categories.find(c => c.id === activeCategory)?.name}
              </p>
            </div>
            {filteredComponents.map(component => (
              <div
                key={component.id}
                className="border border-gray-200 dark:border-dark-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => onAddComponent(component.id, component.defaultProps)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-900/40 transition-colors">
                      <component.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {component.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {component.description}
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 rounded capitalize">
                      {component.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-800 flex-shrink-0">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {filteredComponents.length} components available
          </p>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary-300 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-primary-200 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    </div>
  )
}