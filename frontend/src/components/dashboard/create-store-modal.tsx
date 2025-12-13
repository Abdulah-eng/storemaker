"use client"

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Store, Template } from '@/types'
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface CreateStoreModalProps {
  isOpen: boolean
  onClose: () => void
  onStoreCreated: (store: Store) => void
}

export function CreateStoreModal({ isOpen, onClose, onStoreCreated }: CreateStoreModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_id: null as number | null,
  })
  const [aiFormData, setAiFormData] = useState({
    name: '',
    description: '',
    industry: '',
    business_type: '',
  })
  const [isAIMode, setIsAIMode] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Industry options for AI mode
  const industryOptions = [
    'Fashion & Apparel',
    'Electronics & Technology',
    'Food & Beverage',
    'Health & Beauty',
    'Home & Garden',
    'Sports & Fitness',
    'Books & Media',
    'Toys & Games',
    'Automotive',
    'Jewelry & Accessories',
    'Pet Supplies',
    'Art & Crafts',
    'Other'
  ]

  // Business type options for AI mode
  const businessTypeOptions = [
    'Retail Store',
    'Online Marketplace',
    'Boutique',
    'Restaurant/Cafe',
    'Service Business',
    'Manufacturer',
    'Wholesaler',
    'Dropshipping',
    'Subscription Service',
    'Digital Products',
    'Other'
  ]

  useEffect(() => {
    if (isOpen) {
      fetchTemplates()
    }
  }, [isOpen])

  const fetchTemplates = async () => {
    try {
      setIsLoadingTemplates(true)
      const response = await api.getTemplates()
      
      // Handle different response formats
      const data = response.data as unknown
      let templatesData = []
      if (Array.isArray(data)) {
        templatesData = data
      } else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
        templatesData = data.data
      } else if (data && typeof data === 'object' && 'templates' in data && Array.isArray(data.templates)) {
        templatesData = data.templates
      }
      
      setTemplates(templatesData)
    } catch {
      console.error('Failed to fetch templates')
      toast.error('Failed to load templates')
      setTemplates([]) // Ensure templates is always an array
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (isAIMode) {
      setAiFormData(prev => ({ ...prev, [name]: value }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setAiFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleTemplateSelect = (templateId: number) => {
    setFormData(prev => ({ ...prev, template_id: templateId }))
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (isAIMode) {
      if (!aiFormData.name.trim()) {
        newErrors.name = 'Store name is required'
      }
      if (!aiFormData.description.trim()) {
        newErrors.description = 'Business description is required'
      }
      if (!aiFormData.industry) {
        newErrors.industry = 'Industry is required'
      }
      if (!aiFormData.business_type) {
        newErrors.business_type = 'Business type is required'
      }
    } else {
      if (!formData.name.trim()) {
        newErrors.name = 'Store name is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      let response
      if (isAIMode) {
        response = await api.createStoreWithAI(aiFormData)
        toast.success('Store created successfully with AI assistance!')
      } else {
        response = await api.createStore(formData)
        toast.success('Store created successfully!')
      }
      
      onStoreCreated((response.data as any).store || response.data)
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        template_id: null,
      })
      setAiFormData({
        name: '',
        description: '',
        industry: '',
        business_type: '',
      })
      setErrors({})
    } catch (error: any) {
      console.error('Failed to create store:', error)
      toast.error(error.response?.data?.error || 'Failed to create store')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (isLoading) return
    onClose()
    // Reset form after a delay to avoid visual glitch
    setTimeout(() => {
      setFormData({
        name: '',
        description: '',
        template_id: null,
      })
      setAiFormData({
        name: '',
        description: '',
        industry: '',
        business_type: '',
      })
      setErrors({})
      setIsAIMode(false)
    }, 200)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-2 sm:px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose} />

        <div className="inline-block w-full max-w-lg sm:max-w-2xl my-4 sm:my-8 overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-dark-900 rounded-xl shadow-xl sm:align-middle">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-dark-700">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Create New Store
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              disabled={isLoading}
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-dark-700">
            <div className="flex space-x-2 sm:space-x-4">
              <button
                type="button"
                onClick={() => setIsAIMode(false)}
                className={`flex-1 py-2 px-2 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  !isAIMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700'
                }`}
              >
                <span className="hidden sm:inline">Manual Creation</span>
                <span className="sm:hidden">Manual</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAIMode(true)}
                className={`flex-1 py-2 px-2 sm:px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                  isAIMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700'
                }`}
              >
                <SparklesIcon className="h-4 w-4" />
                <span className="hidden sm:inline">AI-Powered</span>
                <span className="sm:hidden">AI</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={isAIMode ? aiFormData.name : formData.name}
                onChange={handleInputChange}
                className={`input-field ${errors.name ? 'ring-red-500 border-red-300' : ''}`}
                placeholder={isAIMode ? "My Awesome AI Store" : "My Awesome Store"}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {isAIMode ? (
              // AI Mode Form
              <>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Business Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={aiFormData.description}
                    onChange={handleInputChange}
                    className={`input-field resize-none ${errors.description ? 'ring-red-500 border-red-300' : ''}`}
                    placeholder="Describe your business, products, target audience, and what makes you unique..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Industry *
                    </label>
                    <select
                      id="industry"
                      name="industry"
                      value={aiFormData.industry}
                      onChange={handleSelectChange}
                      className={`input-field ${errors.industry ? 'ring-red-500 border-red-300' : ''}`}
                    >
                      <option value="">Select Industry</option>
                      {industryOptions.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                    {errors.industry && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.industry}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="business_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Type *
                    </label>
                    <select
                      id="business_type"
                      name="business_type"
                      value={aiFormData.business_type}
                      onChange={handleSelectChange}
                      className={`input-field ${errors.business_type ? 'ring-red-500 border-red-300' : ''}`}
                    >
                      <option value="">Select Business Type</option>
                      {businessTypeOptions.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.business_type && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.business_type}</p>
                    )}
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        AI-Powered Store Creation
                      </h4>
                      <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 mt-1">
                        Our AI will automatically generate a complete store with theme, layout, and components tailored to your business.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Manual Mode Form
              <>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input-field resize-none"
                    placeholder="Tell customers what makes your store special..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Choose a Template (Optional)
                  </label>
                  
                  {isLoadingTemplates ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="p-3 sm:p-4 border border-gray-200 dark:border-dark-700 rounded-lg animate-pulse">
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-80 sm:max-h-96 overflow-y-auto">
                      <div
                        className={`group p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          formData.template_id === null
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                            : 'border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600'
                        }`}
                        onClick={() => handleTemplateSelect(null as any)}
                      >
                        <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-dark-800 rounded-lg mb-3 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 dark:bg-dark-600 rounded mx-auto mb-2"></div>
                            <p className="text-xs text-gray-500">Blank Canvas</p>
                          </div>
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                          Blank Template
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Start from scratch with complete freedom
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 rounded">
                            custom
                          </span>
                          <span className="text-xs text-green-600 font-medium">FREE</span>
                        </div>
                      </div>
                      
                      {Array.isArray(templates) && templates.map(template => {
                        let colors = { primary: '#3b82f6', secondary: '#f8fafc', accent: '#10b981' }
                        try {
                          const config = typeof template.config === 'string' ? JSON.parse(template.config) : template.config
                          colors = config.colors || colors
                        } catch (e) {
                          // Use defaults
                        }

                        return (
                          <div
                            key={template.id}
                            className={`group p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              formData.template_id === template.id
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                                : 'border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600'
                            }`}
                            onClick={() => handleTemplateSelect(template.id)}
                          >
                            {/* Template Preview */}
                            <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-dark-800 rounded-lg mb-3 overflow-hidden">
                              <div className="w-full h-full" style={{ backgroundColor: colors.secondary }}>
                                {/* Header */}
                                <div className="h-4 flex items-center px-2" style={{ backgroundColor: colors.primary }}>
                                  <div className="w-8 h-1 bg-white opacity-80 rounded"></div>
                                </div>
                                {/* Content Area */}
                                <div className="p-2">
                                  <div className="h-8 rounded mb-1" style={{ backgroundColor: colors.primary, opacity: 0.3 }}></div>
                                  <div className="grid grid-cols-3 gap-1">
                                    {[1,2,3].map(i => (
                                      <div key={i} className="aspect-square rounded" style={{ backgroundColor: colors.accent, opacity: 0.4 }}></div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                {template.name}
                              </h4>
                              {template.is_premium && (
                                <span className="text-xs text-amber-600 font-medium bg-amber-100 px-2 py-1 rounded">
                                  PRO
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {template.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 rounded capitalize">
                                {template.category}
                              </span>
                              <div className="flex items-center space-x-1">
                                {/* Color swatches */}
                                <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: colors.primary }}></div>
                                <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: colors.accent }}></div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-dark-700">
              <button
                type="button"
                onClick={handleClose}
                className="btn-ghost w-full sm:w-auto order-2 sm:order-1"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn-primary w-full sm:w-auto order-1 sm:order-2 ${isAIMode ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner h-4 w-4 mr-2"></div>
                    <span className="hidden sm:inline">{isAIMode ? 'Creating with AI...' : 'Creating...'}</span>
                    <span className="sm:hidden">{isAIMode ? 'Creating...' : 'Creating...'}</span>
                  </div>
                ) : (
                  <>
                    <span className="hidden sm:inline">{isAIMode ? 'Create with AI' : 'Create Store'}</span>
                    <span className="sm:hidden">{isAIMode ? 'Create AI Store' : 'Create Store'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}