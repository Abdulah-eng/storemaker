"use client"

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Store, Template, Product } from '@/types'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { ThemeCustomizer } from './theme-customizer'
import { ComponentLibrary } from './component-library'
import { StorePreview } from './store-preview'
import { ProductCarousel } from '../ui/carousel'
import { 
  PaintBrushIcon,
  EyeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  ArrowLeftIcon,
  Squares2X2Icon,
  PencilIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

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

// Component Editor for editing component properties
interface ComponentEditorProps {
  component?: PageComponent
  store: Store
  onUpdate: (id: string, props: ComponentProps) => void
  onClose: () => void
}

function ComponentEditor({ component, store, onUpdate, onClose }: ComponentEditorProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Load products for the store
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true)
        const response = await api.getProducts(store.id)
        setProducts((response.data as Product[]) || [])
      } catch (error) {
        console.error('Failed to load products:', error)
        toast.error('Failed to load products')
      } finally {
        setLoadingProducts(false)
      }
    }

    loadProducts()
  }, [store.id])

  if (!component) return null

  const handlePropertyChange = (key: string, value: string | number | boolean | unknown[]) => {
    onUpdate(component.id, {
      ...component.props,
      [key]: value
    })
  }

  const renderPropertyEditor = (key: string, value: unknown) => {
    // Handle arrays (like images array for image gallery)
    if (Array.isArray(value)) {
      if (key === 'images') {
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1')}
            </label>
            
            {/* Add Image URL */}
            <div className="flex space-x-2">
              <input
                type="url"
                placeholder="Enter image URL..."
                className="input-field flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement
                    const newImages = [...value, input.value]
                    handlePropertyChange(key, newImages)
                    input.value = ''
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                  if (input.value.trim()) {
                    const newImages = [...value, input.value.trim()]
                    handlePropertyChange(key, newImages)
                    input.value = ''
                  }
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>

            {/* File Upload */}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-dark-800 dark:bg-dark-700 hover:bg-gray-100 dark:border-dark-600 dark:hover:border-dark-500 transition-colors">
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Upload Image</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = URL.createObjectURL(file)
                      const newImages = [...value, url]
                      handlePropertyChange(key, newImages)
                    }
                  }}
                />
              </label>
            </div>

            {/* Image List */}
            <div className="space-y-2">
              {value.map((imageUrl: string, index: number) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <img 
                    src={imageUrl} 
                    alt={`Image ${index + 1}`}
                    className="w-12 h-12 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Crect width="48" height="48" fill="%23f3f4f6"/%3E%3Ctext x="24" y="24" text-anchor="middle" fill="%236b7280" font-size="10"%3EImage%3C/text%3E%3C/svg%3E'
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{imageUrl}</p>
                  </div>
                  <button
                    onClick={() => {
                      const newImages = value.filter((_: string, i: number) => i !== index)
                      handlePropertyChange(key, newImages)
                    }}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      }
      
      // Handle product selection
      if (key === 'selectedProducts' || key === 'featuredProduct') {
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium mb-1 capitalize">
              {key === 'selectedProducts' ? 'Select Products' : 'Select Featured Product'}
            </label>
            
            {loadingProducts ? (
              <div className="text-center py-4">
                <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-4">
                <ShoppingBagIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No products available</p>
                <p className="text-xs text-gray-400">Add products in the dashboard first</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                                         className={`flex items-center space-x-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                       key === 'selectedProducts' 
                         ? (Array.isArray(value) && value.includes(product.id))
                           ? 'border-blue-500 bg-blue-50'
                           : 'border-gray-200 hover:border-gray-300'
                         : (typeof value === 'number' && value === product.id)
                         ? 'border-blue-500 bg-blue-50'
                         : 'border-gray-200 hover:border-gray-300'
                     }`}
                    onClick={() => {
                      if (key === 'selectedProducts') {
                        const currentProducts = Array.isArray(value) ? value : []
                        const newProducts = currentProducts.includes(product.id)
                          ? currentProducts.filter(id => id !== product.id)
                          : [...currentProducts, product.id]
                        handlePropertyChange(key, newProducts)
                      } else {
                        handlePropertyChange(key, product.id)
                      }
                    }}
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23f3f4f6"/%3E%3Ctext x="20" y="20" text-anchor="middle" fill="%236b7280" font-size="8"%3ENo Image%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBagIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">${product.price}</p>
                    </div>
                                         <div className="flex items-center space-x-1">
                       {key === 'selectedProducts' 
                         ? (Array.isArray(value) && value.includes(product.id))
                           ? <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                           : <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                         : (typeof value === 'number' && value === product.id)
                         ? <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                         : <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                       }
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }
      
      // Handle stats array
      if (key === 'stats') {
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1')} ({value.length} items)
            </label>
            
            {/* Stats List */}
            <div className="space-y-3">
              {value.map((stat: Stat, index: number) => (
                <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Stat {index + 1}</span>
                    <button
                      onClick={() => {
                        const newStats = value.filter((_: Stat, i: number) => i !== index)
                        handlePropertyChange(key, newStats)
                      }}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Number</label>
                      <input
                        type="number"
                        value={stat.number || 0}
                        onChange={(e) => {
                          const newStats = [...value]
                          newStats[index] = { ...stat, number: parseInt(e.target.value) || 0 }
                          handlePropertyChange(key, newStats)
                        }}
                        className="input-field w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Label</label>
                      <input
                        type="text"
                        value={stat.label || ''}
                        onChange={(e) => {
                          const newStats = [...value]
                          newStats[index] = { ...stat, label: e.target.value }
                          handlePropertyChange(key, newStats)
                        }}
                        className="input-field w-full text-sm"
                        placeholder="e.g., Happy Customers"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Stat */}
            <button
              onClick={() => {
                const newStats = [...value, { number: 0, label: 'New Stat' }]
                handlePropertyChange(key, newStats)
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              + Add Stat
            </button>
          </div>
        )
      }
      
      // Handle other arrays (like features, testimonials, etc.)
      return (
        <div>
          <label className="block text-sm font-medium mb-1 capitalize">
            {key.replace(/([A-Z])/g, ' $1')} ({value.length} items)
          </label>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Array editing not yet implemented for this type
          </div>
        </div>
      )
    }

    if (typeof value === 'boolean') {
      return (
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handlePropertyChange(key, e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
        </label>
      )
    }

    if (typeof value === 'number') {
      return (
        <div>
          <label className="block text-sm font-medium mb-1 capitalize">
            {key.replace(/([A-Z])/g, ' $1')}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => handlePropertyChange(key, parseInt(e.target.value) || 0)}
            className="input-field w-full"
          />
        </div>
      )
    }

    if (typeof value === 'string') {
      if (key.toLowerCase().includes('color') || key.toLowerCase().includes('background')) {
        return (
          <div>
            <label className="block text-sm font-medium mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1')}
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={value}
                onChange={(e) => handlePropertyChange(key, e.target.value)}
                className="w-12 h-8 rounded border"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handlePropertyChange(key, e.target.value)}
                className="input-field flex-1"
                placeholder="#000000"
              />
            </div>
          </div>
        )
      }

      if (key.toLowerCase().includes('image') || key.toLowerCase().includes('backgroundimage')) {
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1')}
            </label>
            
            {/* URL Input */}
            <input
              type="url"
              value={value}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
              className="input-field w-full"
              placeholder="Enter image URL or upload below..."
            />
            
            {/* File Upload */}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-dark-800 dark:bg-dark-700 hover:bg-gray-100 dark:border-dark-600 dark:hover:border-dark-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP (MAX. 10MB)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = URL.createObjectURL(file)
                      handlePropertyChange(key, url)
                    }
                  }}
                />
              </label>
            </div>
            
            {/* Image Preview */}
            {value && value.trim() && isValidUrl(value) && (
              <div className="mt-3">
                <Image 
                  src={value}
                  alt="Preview" 
                  width={300}
                  height={128}
                  className="w-full max-h-32 object-cover rounded-lg border border-gray-300 dark:border-dark-600 shadow-sm"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    img.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        )
      }

      if (key.toLowerCase().includes('video') || key.toLowerCase().includes('videourl')) {
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1')}
            </label>
            
            {/* URL Input */}
            <input
              type="url"
              value={value}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
              className="input-field w-full"
              placeholder="Enter video URL (MP4, YouTube, Vimeo) or upload below..."
            />
            
            {/* File Upload */}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-dark-800 dark:bg-dark-700 hover:bg-gray-100 dark:border-dark-600 dark:hover:border-dark-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">MP4, WEBM, MOV (MAX. 50MB)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = URL.createObjectURL(file)
                      handlePropertyChange(key, url)
                    }
                  }}
                />
              </label>
            </div>
            
            {/* Video Preview */}
            {value && (
              <div className="mt-3">
                <video 
                  src={value}
                  className="w-full max-h-32 object-cover rounded-lg border border-gray-300 dark:border-dark-600 shadow-sm"
                  controls={false}
                  muted
                  onError={(e) => {
                    (e.target as HTMLVideoElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        )
      }

      if (key.toLowerCase().includes('url')) {
        return (
          <div>
            <label className="block text-sm font-medium mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              type="url"
              value={value}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
              className="input-field w-full"
              placeholder="https://..."
            />
          </div>
        )
      }

      if (value.length > 50) {
        return (
          <div>
            <label className="block text-sm font-medium mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1')}
            </label>
            <textarea
              value={value}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
              className="input-field w-full"
              rows={3}
            />
          </div>
        )
      }

      return (
        <div>
          <label className="block text-sm font-medium mb-1 capitalize">
            {key.replace(/([A-Z])/g, ' $1')}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => handlePropertyChange(key, e.target.value)}
            className="input-field w-full"
          />
        </div>
      )
    }

    return null
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
          Edit {component.type.replace('-', ' ')}
        </h3>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(component.props).filter(([, value]) => 
          typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || Array.isArray(value)
        ).map(([key, value]) => (
          <div key={key}>
            {renderPropertyEditor(key, value)}
          </div>
        ))}
      </div>
    </div>
  )
}

// Component Preview for displaying components in the canvas
interface ComponentPreviewProps {
  component: PageComponent
  themeConfig: ThemeConfig | null
  previewMode: 'desktop' | 'mobile'
  products: Product[]
  isLoadingProducts: boolean
}

function ComponentPreview({ component, themeConfig, previewMode, products, isLoadingProducts }: ComponentPreviewProps) {
  const baseStyles = {
    backgroundColor: themeConfig?.colors?.background || '#ffffff',
    color: themeConfig?.colors?.text || '#1f2937',
    fontFamily: themeConfig?.fonts?.body || 'Inter'
  }

  const primaryColor = themeConfig?.colors?.primary || '#3b82f6'
  const accentColor = themeConfig?.colors?.accent || '#10b981'
  const headingFont = themeConfig?.fonts?.heading || 'Inter'

  // Helper function to get responsive classes based on preview mode
  const getResponsiveClasses = (desktop: string, mobile: string) => {
    switch (previewMode) {
      case 'mobile':
        return mobile
      default:
        return desktop
    }
  }

  switch (component.type) {
    case 'hero-banner':
      return (
        <div 
          className={`relative min-h-96 md:min-h-[600px] lg:min-h-[700px] flex items-center justify-center text-center bg-cover bg-center bg-no-repeat overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`}
          style={{
            backgroundImage: component.props.backgroundImage ? `url(${component.props.backgroundImage})` : `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            backgroundColor: component.props.backgroundImage ? 'transparent' : primaryColor
          }}
        >
          {/* Overlay */}
          {component.props.overlay && (
            <div className="absolute inset-0 bg-black opacity-50"></div>
          )}
          
          <div className={`relative z-10 px-6 py-12 ${getResponsiveClasses('max-w-4xl', 'max-w-sm')}`}>
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white"
              style={{ 
                fontFamily: headingFont,
                textShadow: component.props.overlay || component.props.backgroundImage ? '2px 2px 4px rgba(0,0,0,0.7)' : '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {String(component.props.title || 'Hero Title')}
            </h1>
            <p 
              className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed text-white"
              style={{ 
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
        <div className={`min-h-80 md:min-h-96 lg:min-h-[500px] overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={baseStyles}>
          <div className={`mx-auto px-6 py-12 ${getResponsiveClasses('max-w-7xl', 'max-w-sm')}`}>
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
                  className="aspect-square lg:aspect-[4/3] rounded-2xl bg-cover bg-center bg-no-repeat shadow-2xl w-full"
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
          className={`relative min-h-80 md:min-h-96 lg:min-h-[600px] flex items-center justify-center text-center overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`}
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
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
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
          <div className={`relative z-10 px-6 py-12 ${getResponsiveClasses('max-w-4xl', 'max-w-sm')}`}>
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
          className={`min-h-64 md:min-h-80 lg:min-h-96 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`}
          style={baseStyles}
        >
          <div className={`px-6 py-12 ${getResponsiveClasses('max-w-4xl', 'max-w-sm')} ${
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

    case 'product-grid': {
      // Get selected products if specified, otherwise show all products
      const selectedProductIds = component.props.selectedProducts || []
      const gridProducts = selectedProductIds.length > 0 
        ? products.filter(p => selectedProductIds.includes(p.id))
        : products.slice(0, Math.min(Number(component.props.maxProducts) || 6, products.length))
      
      console.log('Product Grid Debug:', {
        componentProps: component.props,
        selectedProductIds,
        totalProducts: products.length,
        gridProducts: gridProducts.length,
        products: products.slice(0, 3) // Show first 3 products for debugging
      })
      
      return (
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={baseStyles}>
          <h2 
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: primaryColor, fontFamily: headingFont }}
          >
            {String(component.props.title || 'Featured Products')}
          </h2>
          {isLoadingProducts ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
            </div>
          ) : gridProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">No products available</p>
              <p className="text-sm text-gray-400">Add products in the dashboard first</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${
              Number(component.props.columns) === 4 ? 'grid-cols-2 md:grid-cols-4' :
              Number(component.props.columns) === 3 ? 'grid-cols-2 md:grid-cols-3' :
              Number(component.props.columns) === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            }`}>
              {gridProducts.map((product) => (
                <div key={product.id} className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect width="300" height="300" fill="%23f3f4f6"/%3E%3Ctext x="150" y="150" text-anchor="middle" fill="%236b7280" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{product.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          ${product.price}
                        </span>
                        {product.compare_price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.compare_price}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // Mock add to cart for builder preview
                        console.log('Add to Cart clicked in builder preview:', product.name)
                        toast.success(`${product.name} added to cart!`)
                      }}
                      className="w-full mt-3 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    case 'product-carousel': {
      // Get selected products if specified, otherwise show all products
      const carouselProductIds = component.props.selectedProducts || []
      const carouselProducts = carouselProductIds.length > 0 
        ? products.filter(p => carouselProductIds.includes(p.id))
        : products.slice(0, Math.min(Number(component.props.maxProducts) || 5, products.length))
      
      console.log('Product Carousel Debug:', {
        componentProps: component.props,
        carouselProductIds,
        totalProducts: products.length,
        carouselProducts: carouselProducts.length,
        products: products.slice(0, 3) // Show first 3 products for debugging
      })
      
      return (
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={baseStyles}>
          <h2 
            className="text-2xl font-bold mb-8 text-center"
            style={{ color: primaryColor, fontFamily: headingFont }}
          >
            {String(component.props.title || 'Trending Now')}
          </h2>
          {isLoadingProducts ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
            </div>
          ) : carouselProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">No products available</p>
              <p className="text-sm text-gray-400">Add products in the dashboard first</p>
            </div>
          ) : (
                      <ProductCarousel
            products={carouselProducts.map(product => ({
              id: product.id,
              name: product.name,
              price: product.price,
              comparePrice: product.compare_price,
              images: product.images || [],
              slug: product.slug
            }))}
            slidesToShow={Number(component.props.slidesToShow) || 4}
            autoplay={Boolean(component.props.autoplay)}
            showDots={Boolean(component.props.showDots)}
            showArrows={true}
            infinite={true}
            showAddToCart={true}
            onAddToCart={(product) => {
              // Mock function for store builder preview
              console.log('Add to Cart clicked in builder preview:', product.name)
              toast.success(`${product.name} added to cart!`)
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
          )}
        </div>
      )
    }

    case 'feature-list':
      return (
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={baseStyles}>
          <h2 
            className="text-2xl font-bold mb-8 text-center"
            style={{ color: primaryColor, fontFamily: headingFont }}
          >
            {String(component.props.title || 'Features')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Array.isArray(component.props.features) ? component.props.features : []).slice(0, 3).map((feature: Feature, i: number) => (
              <div key={i} className="text-center">
                <div 
                  className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: accentColor }}
                >
                  <span className="text-white text-xl">★</span>
                </div>
                <h3 
                  className="font-semibold mb-2"
                  style={{ color: primaryColor, fontFamily: headingFont }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: baseStyles.color }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )

    case 'cta-banner':
      return (
        <div 
          className={`p-8 text-center overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`}
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
            className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold"
          >
            {String(component.props.buttonText || 'Shop Now')}
          </button>
        </div>
      )

    case 'newsletter':
      return (
        <div className={`p-6 sm:p-8 text-center overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={baseStyles}>
          <h2 
            className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4"
            style={{ color: primaryColor, fontFamily: headingFont }}
          >
            {String(component.props.title || 'Stay Updated')}
          </h2>
          <p className="text-base sm:text-lg mb-4 sm:mb-6 px-2" style={{ color: baseStyles.color }}>
            {String(component.props.subtitle || 'Subscribe for updates')}
          </p>
          <div className={`mx-auto px-2 w-full ${getResponsiveClasses('max-w-md', 'w-full')}`}>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <input
                type="email"
                placeholder={String(component.props.placeholder || 'Enter your email')}
                className="flex-1 px-4 py-3 border rounded-lg sm:rounded-l-lg sm:rounded-r-none text-base min-w-0 w-full"
                disabled
              />
              <button 
                className="px-6 py-3 rounded-lg sm:rounded-l-none sm:rounded-r-lg font-semibold text-white text-base flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                {String(component.props.buttonText || 'Subscribe')}
              </button>
            </div>
          </div>
        </div>
      )

    case 'product-showcase': {
      // Get the featured product if specified, otherwise show first available product
      const featuredProductId = component.props.featuredProduct
      const showcaseProduct = featuredProductId 
        ? products.find(p => p.id === featuredProductId)
        : products[0]
      
      return (
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={baseStyles}>
          <div className={`mx-auto ${getResponsiveClasses('max-w-4xl', 'max-w-sm')}`}>
            {isLoadingProducts ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
              </div>
            ) : !showcaseProduct ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">No products available</p>
                <p className="text-sm text-gray-400">Add products in the dashboard first</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {showcaseProduct.images && showcaseProduct.images.length > 0 ? (
                    <img
                      src={showcaseProduct.images[0]}
                      alt={showcaseProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="200" y="200" text-anchor="middle" fill="%236b7280" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  {component.props.showBadge && (
                    <span 
                      className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-4"
                      style={{ backgroundColor: accentColor, color: '#ffffff' }}
                    >
                      {String(component.props.badgeText || 'FEATURED')}
                    </span>
                  )}
                  <h2 
                    className="text-3xl font-bold mb-4"
                    style={{ color: primaryColor, fontFamily: headingFont }}
                  >
                    {showcaseProduct.name}
                  </h2>
                  <p className="text-lg mb-4" style={{ color: baseStyles.color }}>
                    {showcaseProduct.description || 'Product description'}
                  </p>
                  <div className="flex items-center space-x-4 mb-6">
                    <span className="text-2xl font-bold" style={{ color: accentColor }}>
                      ${showcaseProduct.price}
                    </span>
                    {showcaseProduct.compare_price && (
                      <span className="text-lg line-through text-gray-500">
                        ${showcaseProduct.compare_price}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      // Mock add to cart for builder preview
                      console.log('Add to Cart clicked in builder preview:', showcaseProduct.name)
                      toast.success(`${showcaseProduct.name} added to cart!`)
                    }}
                    className="px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'stats-counter':
      return (
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={{ backgroundColor: themeConfig?.colors?.secondary || '#f8fafc' }}>
          <div className={`mx-auto ${getResponsiveClasses('max-w-6xl', 'max-w-sm')}`}>
            <h2 
              className="text-3xl font-bold text-center mb-12"
              style={{ color: primaryColor, fontFamily: headingFont }}
            >
              {String(component.props.title || 'Our Numbers Speak')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {(Array.isArray(component.props.stats) ? component.props.stats : []).slice(0, 4).map((stat: Stat, i: number) => (
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

    case 'reviews-grid':
      return (
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={baseStyles}>
          <h2 
            className="text-2xl font-bold mb-8 text-center"
            style={{ color: primaryColor, fontFamily: headingFont }}
          >
            {String(component.props.title || 'Customer Reviews')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Array.isArray(component.props.reviews) ? component.props.reviews : []).slice(0, 3).map((review: Review, i: number) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <div className="font-medium">{review.name || 'Customer'}</div>
                    <div className="text-yellow-400">
                      {'★'.repeat(review.rating || 5)}
                    </div>
                  </div>
                </div>
                <p className="text-sm" style={{ color: baseStyles.color }}>
                  &ldquo;{review.comment || 'Great product!'}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )

    case 'spacer':
      return (
        <div 
          style={{
            height: `${Number(component.props.height) || 60}px`,
            backgroundColor: String(component.props.backgroundColor || 'transparent')
          }}
          className="flex items-center justify-center"
        >
          <div className="text-xs text-gray-400 opacity-50">
            Spacer ({String(component.props.height || 60)}px)
          </div>
        </div>
      )

    case 'divider':
      return (
        <div className="p-4 flex items-center justify-center" style={baseStyles}>
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
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={baseStyles}>
          <h2 
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: primaryColor, fontFamily: headingFont }}
          >
            {String(component.props.title || 'Image Gallery')}
          </h2>
          <div 
            className={`grid gap-4 ${
              Number(component.props.columns) === 4 ? 'grid-cols-2 md:grid-cols-4' :
              Number(component.props.columns) === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
            }`}
          >
            {(Array.isArray(component.props.images) ? component.props.images : []).slice(0, 6).map((imageUrl: string, i: number) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
                {imageUrl && imageUrl.trim() && isValidUrl(imageUrl) ? (
                  <Image 
                    src={imageUrl} 
                    alt={`Gallery image ${i + 1}`}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      img.style.display = 'none'
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
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={baseStyles}>
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

    case 'about-section':
      return (
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={baseStyles}>
          <div className={`mx-auto ${getResponsiveClasses('max-w-6xl', 'max-w-sm')}`}>
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
              component.props.imagePosition === 'right' ? 'lg:grid-flow-col-dense' : ''
            }`}>
              {/* Image */}
              <div className={`order-1 ${component.props.imagePosition === 'right' ? 'lg:order-2' : ''}`}>
                {component.props.image && isValidUrl(String(component.props.image)) ? (
                  <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                    <Image 
                      src={String(component.props.image)} 
                      alt="About us"
                      width={600}
                      height={400}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.style.display = 'none'
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
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={{ backgroundColor: themeConfig?.colors?.secondary || '#f8fafc' }}>
          <div className={`mx-auto ${getResponsiveClasses('max-w-4xl', 'max-w-sm')}`}>
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
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={baseStyles}>
          <div className={`mx-auto ${getResponsiveClasses('max-w-6xl', 'max-w-sm')}`}>
            <h2 
              className="text-3xl font-bold text-center mb-12"
              style={{ color: primaryColor, fontFamily: headingFont }}
            >
              {String(component.props.title || 'What Our Customers Say')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(Array.isArray(component.props.testimonials) ? component.props.testimonials : []).slice(0, 6).map((testimonial: Testimonial, i: number) => (
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
                      {testimonial.avatar && isValidUrl(testimonial.avatar) ? (
                        <Image 
                          src={testimonial.avatar} 
                          alt={String(testimonial.name || 'Customer')}
                          width={40}
                          height={40}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement
                            img.style.display = 'none'
                          }}
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
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={baseStyles}>
          <h2 
            className="text-2xl font-bold mb-8 text-center"
            style={{ color: primaryColor, fontFamily: headingFont }}
          >
            {String(component.props.title || 'Customer Reviews')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Array.isArray(component.props.reviews) ? component.props.reviews : []).slice(0, 3).map((review: Review, i: number) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <div className="font-medium">{review.name || 'Customer'}</div>
                    <div className="text-yellow-400">
                      {'★'.repeat(review.rating || 5)}
                    </div>
                  </div>
                </div>
                <p className="text-sm" style={{ color: baseStyles.color }}>
                  &ldquo;{review.comment || 'Great product!'}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )

    case 'social-proof':
      return (
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={{ backgroundColor: themeConfig?.colors?.secondary || '#f8fafc' }}>
          <div className={`mx-auto ${getResponsiveClasses('max-w-6xl', 'max-w-sm')}`}>
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
              {(Array.isArray(component.props.logos) ? component.props.logos : []).slice(0, 6).map((logo: Logo, i: number) => (
                <div key={i} className="flex items-center justify-center">
                  {logo.url && isValidUrl(logo.url) ? (
                    <Image 
                      src={logo.url} 
                      alt={String(logo.name || 'Partner')}
                      width={96}
                      height={48}
                      className="h-12 opacity-60 hover:opacity-100 transition-opacity"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.style.display = 'none'
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
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={baseStyles}>
          <div className={`mx-auto ${getResponsiveClasses('max-w-6xl', 'max-w-sm')}`}>
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
              {(Array.isArray(component.props.features) ? component.props.features : []).slice(0, 8).map((feature: Feature, i: number) => (
                <div key={i} className="text-center">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: themeConfig?.colors?.secondary || '#f8fafc' }}
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
                    {feature.title}
                  </h3>
                  <p className="text-sm" style={{ color: baseStyles.color }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'before-after':
      return (
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={baseStyles}>
          <div className={`mx-auto ${getResponsiveClasses('max-w-4xl', 'max-w-sm')}`}>
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
                    <Image 
                      src={String(component.props.beforeImage)} 
                      alt="Before"
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.style.display = 'none'
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
                    <Image 
                      src={String(component.props.afterImage)} 
                      alt="After"
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.style.display = 'none'
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
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={baseStyles}>
          <div className={`mx-auto ${getResponsiveClasses('max-w-6xl', 'max-w-sm')}`}>
            <h2 
              className="text-3xl font-bold text-center mb-12"
              style={{ color: primaryColor, fontFamily: headingFont }}
            >
              {String(component.props.title || 'Shop by Category')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(Array.isArray(component.props.categories) ? component.props.categories : []).slice(0, 8).map((category: Category, i: number) => (
                <div key={i} className="group cursor-pointer">
                  <div className="aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow mb-4">
                    {category.image && isValidUrl(String(category.image)) ? (
                      <Image 
                        src={String(category.image)} 
                        alt={String(category.name || 'Category')}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement
                          img.style.display = 'none'
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
        <div className={`p-6 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`} style={baseStyles}>
          <div className={`mx-auto ${getResponsiveClasses('max-w-6xl', 'max-w-sm')}`}>
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
              component.props.imagePosition === 'right' ? 'lg:grid-flow-col-dense' : ''
            }`}>
              {/* Image */}
              <div className={`order-1 ${component.props.imagePosition === 'right' ? 'lg:order-2' : ''}`}>
                {component.props.image && isValidUrl(String(component.props.image)) ? (
                  <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                    <Image 
                      src={String(component.props.image)} 
                      alt="Content"
                      width={600}
                      height={400}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.style.display = 'none'
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

    default:
      return (
        <div 
          className={`p-6 min-h-24 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden ${getResponsiveClasses('max-w-full', 'max-w-sm')}`}
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

interface StoreBuilderProps {
  store: Store
  template?: Template
  pageId?: number
  pageType?: string
  pageTitle?: string
  onSave?: (config: Record<string, unknown>) => void
}

interface ComponentProps {
  [key: string]: string | number | boolean | object
}

interface Feature {
  title: string
  description: string
}

interface Stat {
  number: number
  label: string
}

interface Review {
  name: string
  rating: number
  comment: string
  date?: string
}

interface Testimonial {
  name: string
  rating: number
  comment: string
  avatar?: string
  date?: string
}

interface Logo {
  name: string
  url?: string
}

interface Feature {
  icon: string
  title: string
  description: string
}

interface Category {
  name: string
  image?: string
  itemCount?: number
}

interface Stat {
  number: number
  label: string
}

interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    background: string
  }
  fonts: {
    heading: string
    body: string
  }
  layout: {
    header: string
    hero: string
    product_grid: string
    footer: string
    [key: string]: string
  }
}

interface PageComponent {
  id: string
  type: string
  props: ComponentProps
  order: number
}

interface BuilderState {
  components: PageComponent[]
  selectedComponent: string | null
  editingComponent: string | null
  previewMode: 'desktop' | 'mobile' 
  activePanel: 'theme' | 'components' | 'edit' | 'preview'
  sidebarCollapsed: boolean
}

/**
 * StoreBuilder Component
 * 
 * This component handles building store layouts and page designs:
 * - When pageId is provided: Edits a specific page (e.g., home, about, contact)
 * - When pageId is not provided: Edits the main store layout (fallback behavior)
 * 
 * Note: The main store builder route (/dashboard/stores/[id]/builder) now automatically
 * redirects to the home page builder for better UX.
 */
export function StoreBuilder({ store, template, pageId, pageType, pageTitle, onSave }: StoreBuilderProps) {
  const [builderState, setBuilderState] = useState<BuilderState>({
    components: [],
    selectedComponent: null,
    editingComponent: null,
    previewMode: 'desktop',
    activePanel: 'components',
    sidebarCollapsed: false // Start with sidebar open
  })

  // Debug logging for panel changes (remove in production)
  // console.log('StoreBuilder Debug:', {
  //   activePanel: builderState.activePanel,
  //   sidebarCollapsed: builderState.sidebarCollapsed,
  //   componentsCount: builderState.components.length
  // })

  const [showPreview, setShowPreview] = useState(false)
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load products for the store
  const loadProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true)
      const response = await api.getProducts(store.id!)
      const productsData = (response.data as Product[]) || []
      setProducts(productsData)
      console.log('Loaded products for store builder:', productsData)
    } catch (error) {
      console.error('Failed to load products:', error)
      // Continue without products
    } finally {
      setIsLoadingProducts(false)
    }
  }, [store.id])

  // Load store layout and theme from backend
  const loadStoreLayout = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Skip loading store layout if we're in template creation mode (store.id === 0)
      if (store.id === 0) {
        console.log('Template creation mode - skipping store layout load')
        setBuilderState(prev => ({
          ...prev,
          components: []
        }))
        return
      }
      
      // If building a specific page, load page layout instead of store layout
      if (pageId) {
        try {
          // Load page-specific layout
          const response = await api.getPageLayout(store.id!, pageId)
          const layoutData = response.data as {
            components: PageComponent[]
            theme: ThemeConfig
          }
          
          if (layoutData.components && layoutData.components.length > 0) {
            setBuilderState(prev => ({
              ...prev,
              components: layoutData.components.sort((a, b) => a.order - b.order)
            }))
            console.log(`Loaded page layout with ${layoutData.components.length} components`)
          } else {
            // Start with empty components for new page
            setBuilderState(prev => ({
              ...prev,
              components: []
            }))
            console.log('Starting with empty page layout')
          }
          
          if (layoutData.theme) {
            setThemeConfig(layoutData.theme)
          }
        } catch (error) {
          console.warn('Could not load page layout, starting with empty components:', error)
          setBuilderState(prev => ({
            ...prev,
            components: []
          }))
        }
      } else {
        // Load store layout by default (this will be used for the home page)
        try {
          const response = await api.getStoreLayout(store.id!)
          const layoutData = response.data as {
            components: PageComponent[]
            theme: ThemeConfig
          }
          
          console.log('Loaded store layout data:', layoutData)
          
          if (layoutData.components && layoutData.components.length > 0) {
            // Ensure components have proper IDs and are sorted by order
            const processedComponents = layoutData.components
              .map(comp => ({
                ...comp,
                id: comp.id || `component-${Date.now()}-${Math.random()}`
              }))
              .sort((a, b) => a.order - b.order)
            
            setBuilderState(prev => ({
              ...prev,
              components: processedComponents
            }))
            
            console.log('Loaded', processedComponents.length, 'store components')
          } else {
            console.log('No saved store components found')
            setBuilderState(prev => ({
              ...prev,
              components: []
            }))
          }
          
          if (layoutData.theme) {
            setThemeConfig(layoutData.theme)
            console.log('Loaded theme configuration')
          }
        } catch (error) {
          console.warn('Could not load store layout:', error)
          setBuilderState(prev => ({
            ...prev,
            components: []
          }))
        }
      }
    } catch (error) {
      console.error('Failed to load layout:', error)
      // Initialize with template data if available
      if (template?.config) {
        try {
          const templateConfig = typeof template.config === 'string' 
            ? JSON.parse(template.config) 
            : template.config
          
          if (templateConfig.theme) {
            setThemeConfig(templateConfig.theme)
            console.log('Loaded theme from template')
          }
          
          // Also try to load components from template if available
          if (templateConfig.components && Array.isArray(templateConfig.components)) {
            const templateComponents = templateConfig.components
              .map((comp: PageComponent, index: number) => ({
                ...comp,
                id: comp.id || `template-component-${index}`,
                order: comp.order || index
              }))
              .sort((a: PageComponent, b: PageComponent) => a.order - b.order)
            
            setBuilderState(prev => ({
              ...prev,
              components: templateComponents
            }))
            
            console.log('Loaded', templateComponents.length, 'components from template')
          }
        } catch (e) {
          console.error('Failed to parse template config:', e)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [store.id, template, pageId])

  // Save store layout and theme to backend
  const saveStoreLayout = useCallback(async (components: PageComponent[], theme: ThemeConfig | null) => {
    if (isSaving) return

    try {
      setIsSaving(true)
      console.log('Saving layout with', components.length, 'components')
      
      const layoutData = {
        components,
        theme
      }

      if (onSave) {
        // For template creation, call the onSave callback
        onSave(layoutData)
        console.log('Template configuration saved')
      } else if (store.id && store.id !== 0) {
        // For regular store building, save to the appropriate location
        if (pageId) {
          // Save page-specific layout
          await api.savePageLayout(store.id, pageId, layoutData)
          console.log(`Page layout saved for page ${pageId}`)
        } else {
          // Save to store layout (this will be used for the home page)
          await api.saveStoreLayout(store.id, layoutData)
          console.log('Store layout saved successfully')
        }
        
        setLastSaved(new Date())
        toast.success('Layout saved successfully!')
      }
    } catch (error) {
      console.error('Failed to save layout:', error)
      toast.error('Failed to save layout')
    } finally {
      setIsSaving(false)
    }
  }, [store.id, isSaving, pageId, onSave])



  // Load initial data
  useEffect(() => {
    loadStoreLayout()
    loadProducts()
  }, [loadStoreLayout, loadProducts])

  // Disable body scroll behavior to prevent interference with independent scrolling areas
  useEffect(() => {
    const originalScrollBehavior = document.body.style.scrollBehavior
    document.body.style.scrollBehavior = 'auto'
    
    // Debug: Log scroll areas
    console.log('Store builder mounted, setting up independent scrolling')
    
    return () => {
      document.body.style.scrollBehavior = originalScrollBehavior
    }
  }, [])

  // Debug: Add scroll event listeners to verify independence
  useEffect(() => {
    const sidebarScroll = document.querySelector('.sidebar-scrollbar')
    const mainScroll = document.querySelector('.main-scrollbar')
    
    if (sidebarScroll) {
      const handleSidebarScroll = (e: Event) => {
        console.log('Sidebar scrolling:', e.target)
        console.log('Sidebar scrollTop:', (e.target as Element).scrollTop)
        console.log('Sidebar scrollHeight:', (e.target as Element).scrollHeight)
        console.log('Sidebar clientHeight:', (e.target as Element).clientHeight)
        e.stopPropagation()
      }
      sidebarScroll.addEventListener('scroll', handleSidebarScroll)
      
      // Debug: Check if content is overflowing
      setTimeout(() => {
        const target = sidebarScroll as Element
        console.log('Sidebar debug info:')
        console.log('scrollHeight:', target.scrollHeight)
        console.log('clientHeight:', target.clientHeight)
        console.log('Can scroll:', target.scrollHeight > target.clientHeight)
        console.log('Height calculation:', 'calc(100vh - 200px)')
        console.log('Viewport height:', window.innerHeight)
        console.log('Calculated height:', window.innerHeight - 200)
      }, 1000)
      
      return () => {
        sidebarScroll.removeEventListener('scroll', handleSidebarScroll)
      }
    }
  }, [builderState.activePanel])

  const handleThemeSave = useCallback((theme: ThemeConfig) => {
    setThemeConfig(theme)
  }, [])

  const handleThemeChange = useCallback((theme: ThemeConfig) => {
    setThemeConfig(theme)
  }, [])

  const handlePreview = useCallback(() => {
    setShowPreview(true)
  }, [])

  const addComponent = useCallback((componentType: string, props: ComponentProps) => {
    const newComponent: PageComponent = {
      id: `component-${Date.now()}`,
      type: componentType,
      props,
      order: builderState.components.length
    }

    setBuilderState(prev => ({
      ...prev,
      components: [...prev.components, newComponent],
      selectedComponent: newComponent.id,
      activePanel: 'edit',
      editingComponent: newComponent.id
    }))

    // Auto-scroll to the new component after it's added
    setTimeout(() => {
      document.getElementById(`component-${newComponent.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }, 200)
  }, [builderState.components.length])

  const updateComponent = useCallback((id: string, props: ComponentProps) => {
    setBuilderState(prev => ({
      ...prev,
      components: prev.components.map(comp =>
        comp.id === id ? { ...comp, props } : comp
      )
    }))
  }, [])

  const removeComponent = useCallback((id: string) => {
    setBuilderState(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp.id !== id),
      selectedComponent: prev.selectedComponent === id ? null : prev.selectedComponent,
      editingComponent: prev.editingComponent === id ? null : prev.editingComponent
    }))
  }, [])

  const editComponent = useCallback((id: string) => {
    setBuilderState(prev => ({
      ...prev,
      selectedComponent: id,
      editingComponent: id,
      activePanel: 'edit'
    }))
  }, [])

  const duplicateComponent = useCallback((id: string) => {
    const component = builderState.components.find(comp => comp.id === id)
    if (component) {
      const newComponent: PageComponent = {
        ...component,
        id: `component-${Date.now()}`,
        order: component.order + 1
      }
      
      setBuilderState(prev => ({
        ...prev,
        components: prev.components.map(comp => 
          comp.order > component.order ? { ...comp, order: comp.order + 1 } : comp
        ).concat(newComponent).sort((a, b) => a.order - b.order),
        selectedComponent: prev.selectedComponent,
        editingComponent: prev.editingComponent,
        previewMode: prev.previewMode,
        activePanel: prev.activePanel,
        sidebarCollapsed: prev.sidebarCollapsed
      }))
    }
  }, [builderState.components])

  const moveComponent = useCallback((id: string, direction: 'up' | 'down') => {
    setBuilderState(prev => {
      const component = prev.components.find(comp => comp.id === id)
      if (!component) return prev

      const newComponents = [...prev.components]
      const currentIndex = newComponents.findIndex(comp => comp.id === id)
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

      if (targetIndex < 0 || targetIndex >= newComponents.length) return prev

      const temp = newComponents[currentIndex]
      newComponents[currentIndex] = newComponents[targetIndex]
      newComponents[targetIndex] = temp
      
      return {
        ...prev,
        components: newComponents.map((comp, index) => ({
          ...comp,
          order: index
        }))
      }
    })
  }, [])



  const panels = [
    { 
      id: 'components' as const, 
      name: 'Components', 
      icon: Squares2X2Icon,
      description: 'Add and manage page components'
    },
    { 
      id: 'edit' as const, 
      name: 'Edit', 
      icon: Cog6ToothIcon,
      description: 'Edit selected component properties'
    },
    { 
      id: 'theme' as const, 
      name: 'Theme', 
      icon: PaintBrushIcon,
      description: 'Customize colors, fonts, and layout'
    },
    { 
      id: 'preview' as const, 
      name: 'Preview', 
      icon: EyeIcon,
      description: 'Preview your store design'
    }
  ]

  const previewModes = [
    { id: 'desktop' as const, icon: ComputerDesktopIcon, name: 'Desktop' },
    { id: 'mobile' as const, icon: DevicePhoneMobileIcon, name: 'Mobile' }
  ]

  if (showPreview) {
    return (
      <StorePreview
        store={store}
        theme={themeConfig}
        components={builderState.components}
        onClose={() => setShowPreview(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700 sticky top-0 z-40 flex-shrink-0">
        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <Link
              href="/dashboard"
              className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg flex-shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                {pageId ? `Editing Page` : 'Editing Home Page'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {store.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
            {/* Save Status */}
            <div className="hidden sm:flex items-center space-x-2 text-xs">
              {isSaving ? (
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full mr-1"></div>
                  Saving...
                </div>
              ) : lastSaved ? (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <div className="h-2 w-2 bg-green-600 rounded-full mr-2"></div>
                  Saved {lastSaved.toLocaleTimeString()}
                </div>
              ) : null}
            </div>

            {/* View Store Button */}
            <Link
              href={`/stores/${store.slug}`}
              target="_blank"
              className="hidden sm:flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              title="View Live Store"
            >
              <EyeIcon className="h-3 w-3 mr-1" />
              <span className="hidden lg:inline">View Store</span>
              <span className="lg:hidden">View</span>
            </Link>

            {/* Manual Save Button */}
            <button
              onClick={() => saveStoreLayout(builderState.components, themeConfig)}
              disabled={isSaving}
              className="hidden sm:flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
              title="Save Now"
            >
              {isSaving ? (
                <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full mr-1"></div>
              ) : (
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              )}
              <span className="hidden lg:inline">Save</span>
            </button>

            {/* Last Saved Indicator */}
            {lastSaved && (
              <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 ml-2">
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}

            {/* Sidebar Toggle for Mobile */}
            <button
              onClick={() => setBuilderState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))}
              className="sm:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg"
            >
              <Squares2X2Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Mobile View Store Button */}
            <Link
              href={`/stores/${store.slug}`}
              target="_blank"
              className="sm:hidden p-2 text-primary-600 hover:text-primary-700 transition-colors rounded-lg"
              title="View Live Store"
            >
              <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>

            {/* Preview Mode Selector */}
            <div className="hidden md:flex items-center space-x-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
              {previewModes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setBuilderState(prev => ({ ...prev, previewMode: mode.id }))}
                  className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                    builderState.previewMode === mode.id
                      ? 'bg-white dark:bg-dark-700 text-primary-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
                  title={mode.name}
                >
                  <mode.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              ))}
            </div>

            <button
              onClick={handlePreview}
              className="btn-primary px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
            >
              <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>
        </div>

        {/* Panel Tabs */}
        <div className="flex overflow-x-auto border-t border-gray-200 dark:border-dark-700 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {panels.map(panel => (
            <button
              key={panel.id}
              onClick={() => setBuilderState(prev => ({ 
                ...prev, 
                activePanel: panel.id,
                sidebarCollapsed: false // Ensure sidebar opens when panel is selected
              }))}
              className={`flex items-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                builderState.activePanel === panel.id
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <panel.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">{panel.name}</span>
              <span className="sm:hidden">{panel.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Mobile Backdrop */}
        {!builderState.sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 sm:hidden"
            onClick={() => setBuilderState(prev => ({ ...prev, sidebarCollapsed: true, activePanel: null }))}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-700 transition-all duration-300 flex-shrink-0 ${
          builderState.sidebarCollapsed 
            ? 'w-0 sm:w-80 lg:w-96 overflow-hidden sm:overflow-visible' 
            : 'w-80 sm:w-80 lg:w-96'
        } ${builderState.sidebarCollapsed ? 'absolute sm:relative z-30 sm:z-auto' : 'absolute sm:relative z-30 sm:z-auto'}`}>
          <div 
            className="overflow-y-auto sidebar-scrollbar"
            style={{ 
              scrollBehavior: 'auto', 
              overscrollBehavior: 'contain',
              isolation: 'isolate',
              height: 'calc(100vh - 200px)',
              maxHeight: 'calc(100vh - 200px)'
            }}
          >
            {builderState.activePanel === 'components' && (
              <ComponentLibrary
                onAddComponent={addComponent}
                selectedComponent={builderState.selectedComponent}
                onClose={() => setBuilderState(prev => ({ ...prev, sidebarCollapsed: true, activePanel: null }))}
              />
            )}

            {builderState.activePanel === 'edit' && builderState.editingComponent && (
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:hidden">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Edit Component
                  </h2>
                  <button
                    onClick={() => setBuilderState(prev => ({ ...prev, sidebarCollapsed: true, activePanel: null }))}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg"
                    title="Close sidebar"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <ComponentEditor
                  component={builderState.components.find(c => c.id === builderState.editingComponent)}
                  store={store}
                  onUpdate={updateComponent}
                  onClose={() => setBuilderState(prev => ({ ...prev, editingComponent: null, activePanel: 'components' }))}
                />
              </div>
            )}

            {builderState.activePanel === 'edit' && !builderState.editingComponent && (
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:hidden">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Edit Component
                  </h2>
                  <button
                    onClick={() => setBuilderState(prev => ({ ...prev, sidebarCollapsed: true, activePanel: null }))}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg"
                    title="Close sidebar"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="text-center py-8">
                  <Cog6ToothIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Select a Component
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Click on a component in the canvas to edit its properties
                  </p>
                </div>
              </div>
            )}

            {builderState.activePanel === 'theme' && (
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:hidden">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Theme Customizer
                  </h2>
                  <button
                    onClick={() => setBuilderState(prev => ({ ...prev, sidebarCollapsed: true, activePanel: null }))}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg"
                    title="Close sidebar"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <ThemeCustomizer
                  store={store}
                  template={template}
                  onSave={handleThemeSave}
                  onPreview={handlePreview}
                  onThemeChange={handleThemeChange}
                  initialTheme={themeConfig}
                />
              </div>
            )}

            {builderState.activePanel === 'preview' && (
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:hidden">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Preview Mode
                  </h2>
                  <button
                    onClick={() => setBuilderState(prev => ({ ...prev, sidebarCollapsed: true, activePanel: null }))}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg"
                    title="Close sidebar"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="text-center">
                  <EyeIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Preview Mode
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    See how your store looks on different devices
                  </p>
                  <button
                    onClick={handlePreview}
                    className="btn-primary w-full"
                  >
                    Open Full Preview
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 bg-gray-100 dark:bg-dark-800 overflow-hidden">
          <div 
            className="overflow-y-auto main-scrollbar"
            style={{ 
              scrollBehavior: 'auto', 
              overscrollBehavior: 'contain',
              isolation: 'isolate',
              height: 'calc(100vh - 120px)',
              maxHeight: 'calc(100vh - 120px)',
              paddingBottom: '4rem'
            }}
          >
            <div className="pt-2 sm:pt-4 px-1 sm:px-4 lg:px-6 xl:px-8 pb-16 sm:pb-20 min-h-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-full min-h-96">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading store layout...</p>
                  </div>
                </div>
              ) : (
              <div className={`mx-auto bg-white dark:bg-dark-900 shadow-xl rounded-xl overflow-hidden transition-all duration-300 mb-8 ${
                builderState.previewMode === 'desktop' ? 'max-w-full' : 'max-w-md'
              }`}>
                {/* Store Header Preview */}
                <div 
                  className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200 dark:border-dark-700 sticky top-0 z-10 backdrop-blur-sm"
                  style={{
                    backgroundColor: `${themeConfig?.colors?.secondary || '#f8fafc'}dd`,
                    fontFamily: themeConfig?.fonts?.heading || 'Inter'
                  }}
                >
                  <h2 
                    className="text-lg sm:text-xl font-bold"
                    style={{ color: themeConfig?.colors?.primary || '#3b82f6' }}
                  >
                    {store.name}
                  </h2>
                  <p 
                    className="text-xs sm:text-sm"
                    style={{ color: themeConfig?.colors?.text || '#1f2937' }}
                  >
                    {store.description || 'Your store description'}
                  </p>
                </div>

                {/* Components Canvas */}
                <div className="min-h-[700px] px-3 sm:px-6 lg:px-8 pb-16">
                  {builderState.components.length === 0 ? (
                  <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
                    <div className="text-center p-8 pb-20">
                      <Squares2X2Icon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Start Building Your Store</h3>
                      <p className="text-sm mb-4 max-w-sm">Add components from the sidebar to create your store layout</p>
                      <button
                        onClick={() => setBuilderState(prev => ({ ...prev, activePanel: 'components', sidebarCollapsed: false }))}
                        className="btn-primary"
                      >
                        Add Components
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-3 sm:p-6 lg:p-8 pb-16">
                    {builderState.components
                      .sort((a, b) => a.order - b.order)
                      .map((component, index) => (
                        <div
                          key={component.id}
                          id={`component-${component.id}`}
                          className={`group border-2 border-dashed rounded-xl transition-all duration-200 scroll-mt-4 ${
                            builderState.selectedComponent === component.id
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg ring-2 ring-primary-200 dark:ring-primary-800'
                              : 'border-gray-300 dark:border-dark-600 hover:border-primary-300 hover:shadow-md'
                          }`}
                          onClick={() => {
                            setBuilderState(prev => ({ 
                              ...prev, 
                              selectedComponent: component.id,
                              editingComponent: component.id,
                              activePanel: 'edit'
                            }))
                            // Scroll to component on selection
                            setTimeout(() => {
                              document.getElementById(`component-${component.id}`)?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                              })
                            }, 100)
                          }}
                        >
                          <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-200 dark:border-dark-700">
                            <div className="flex items-center space-x-2 flex-shrink-0 min-w-0">
                              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 capitalize truncate">
                                {component.type.replace('-', ' ')}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                #{index + 1}
                              </span>
                            </div>
                            <div className="flex items-center space-x-0.5 sm:space-x-1 overflow-x-auto">
                              {/* Always visible action buttons with better styling */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  moveComponent(component.id, 'up')
                                }}
                                disabled={index === 0}
                                className="p-1 sm:p-2 bg-white dark:bg-dark-800 rounded-md shadow-sm border border-gray-200 dark:border-dark-600 text-gray-600 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
                                title="Move up"
                              >
                                <ChevronUpIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  moveComponent(component.id, 'down')
                                }}
                                disabled={index === builderState.components.length - 1}
                                className="p-1 sm:p-2 bg-white dark:bg-dark-800 rounded-md shadow-sm border border-gray-200 dark:border-dark-600 text-gray-600 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
                                title="Move down"
                              >
                                <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  editComponent(component.id)
                                }}
                                className="p-1 sm:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md shadow-sm border border-blue-200 dark:border-blue-800 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all flex-shrink-0"
                                title="Edit"
                              >
                                <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  duplicateComponent(component.id)
                                }}
                                className="p-1 sm:p-2 bg-green-50 dark:bg-green-900/20 rounded-md shadow-sm border border-green-200 dark:border-green-800 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all flex-shrink-0"
                                title="Duplicate"
                              >
                                <Squares2X2Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeComponent(component.id)
                                }}
                                className="p-1 sm:p-2 bg-red-50 dark:bg-red-900/20 rounded-md shadow-sm border border-red-200 dark:border-red-800 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex-shrink-0"
                                title="Delete"
                              >
                                <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                            </div>
                          </div>
                          <ComponentPreview 
                            component={component}
                            themeConfig={themeConfig}
                            previewMode={builderState.previewMode}
                            products={products}
                            isLoadingProducts={isLoadingProducts}
                          />
                                                  </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {!builderState.sidebarCollapsed && (
        <div 
          className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setBuilderState(prev => ({ ...prev, sidebarCollapsed: true }))}
        />
      )}

      {/* Floating Action Button - Add Component */}
      <button
        onClick={() => setBuilderState(prev => ({ 
          ...prev, 
          activePanel: 'components', 
          sidebarCollapsed: false 
        }))}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        title="Add Component"
      >
        <Squares2X2Icon className="h-6 w-6" />
      </button>

      {/* Scroll to Top Button */}
      {builderState.components.length > 3 && (
        <button
          onClick={() => {
            const canvasElement = document.querySelector('main .overflow-y-auto')
            if (canvasElement) {
              canvasElement.scrollTo({ top: 0, behavior: 'auto' })
            }
          }}
          className="fixed bottom-6 left-6 z-30 w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          title="Scroll to Top"
        >
          <ChevronUpIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}