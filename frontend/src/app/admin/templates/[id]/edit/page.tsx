"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AdminLayout } from '@/components/layout/admin-layout'
import { StoreBuilder } from '@/components/store-builder/store-builder'
import { api } from '@/lib/api'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { isValidImageUrl, handleImageError, getImageUrl } from '@/lib/image-utils'

interface TemplateFormData {
  name: string
  description: string
  category: "general" | "fashion" | "electronics" | "food" | "beauty" | "home"
  preview_url: string
  thumbnail_url: string
  is_premium: boolean
}

interface Template {
  id: number
  name: string
  description: string
  category: string
  preview_url: string
  thumbnail_url: string
  is_premium: boolean
  config: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function EditTemplatePage() {
  const { isLoading, isAuthenticated, user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string
  
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    category: 'general',
    preview_url: '',
    thumbnail_url: '',
    is_premium: false,
  })
  const [template, setTemplate] = useState<Template | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true)
  const [templateConfig, setTemplateConfig] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (isAuthenticated && user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    if (isAuthenticated && templateId) {
      loadTemplate()
    }
  }, [isLoading, isAuthenticated, user, router, templateId])

  const loadTemplate = async () => {
    try {
      setIsLoadingTemplate(true)
      const response = await api.admin.getTemplate(parseInt(templateId))
      const templateData = response.data as Template
      console.log('Template data loaded:', templateData)
      setTemplate(templateData)
      
      // Populate form data
      setFormData({
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        preview_url: templateData.preview_url,
        thumbnail_url: templateData.thumbnail_url,
        is_premium: templateData.is_premium,
      })

      // Set template config if available
      if (templateData.config) {
        console.log('Loading template config:', templateData.config)
        setTemplateConfig(templateData.config)
      } else {
        console.log('No template config found')
      }
    } catch (error) {
      console.error('Failed to load template:', error)
      toast.error('Failed to load template')
      router.push('/admin/templates')
    } finally {
      setIsLoadingTemplate(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSaveTemplate = async () => {
    if (!formData.name.trim()) {
      toast.error('Template name is required')
      return
    }

    setIsSaving(true)
    try {
      // Use the latest templateConfig
      if (!templateConfig) {
        toast.error('Please save the template configuration first using the save button in the builder')
        setIsSaving(false)
        return
      }

      const templateData = {
        ...formData,
        config: templateConfig
      }

      console.log('Saving template with config:', templateConfig)
      console.log('Full template data:', templateData)

      await api.admin.updateTemplate(parseInt(templateId), templateData)
      toast.success('Template updated successfully')
      router.push('/admin/templates')
    } catch (error) {
      console.error('Failed to update template:', error)
      toast.error('Failed to update template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBuilderSave = (config: Record<string, unknown>) => {
    console.log('Template configuration received:', config)
    setTemplateConfig(config)
    toast.success('Template configuration saved')
  }



  if (isLoading || isLoadingTemplate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null // Will redirect
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Template not found</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/templates"
              className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Templates
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Edit Template
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Update the template information and layout.
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Update Template'}
          </button>
        </div>

        {/* Template Form */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Template Information
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Template Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter template name"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                name="category"
                id="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="general">General</option>
                <option value="fashion">Fashion</option>
                <option value="electronics">Electronics</option>
                <option value="food">Food & Restaurant</option>
                <option value="beauty">Beauty</option>
                <option value="home">Home & Garden</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter template description"
              />
            </div>

            <div>
              <label htmlFor="preview_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Preview URL
              </label>
              <input
                type="url"
                name="preview_url"
                id="preview_url"
                value={formData.preview_url}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="https://example.com/preview"
              />
            </div>

            <div>
              <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Thumbnail URL
              </label>
              <input
                type="url"
                name="thumbnail_url"
                id="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_premium"
                  id="is_premium"
                  checked={formData.is_premium}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_premium" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Premium Template
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Template Builder */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Template Builder
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Use the builder below to edit your template layout and components. 
              Make sure to save your changes using the save button in the builder before updating the template.
            </p>
          </div>
          <div className="p-6">
            <StoreBuilder
              store={{
                id: 0, // Template creation mode
                name: formData.name || 'Template Preview',
                slug: 'template-preview',
                subdomain: 'template-preview',
                domain: 'template-preview.storemaker.com',
                description: formData.description,
                status: 'draft',
                owner_id: 0,
                template_id: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }}
                             template={{
                 id: parseInt(templateId),
                 name: formData.name,
                 description: formData.description,
                 category: formData.category,
                 preview_url: formData.preview_url,
                 thumbnail_url: formData.thumbnail_url,
                 is_premium: formData.is_premium,
                 is_active: template.is_active,
                 config: template.config, // Always use the original template config to prevent re-renders
                 created_at: template.created_at,
                 updated_at: template.updated_at,
               }}
              onSave={handleBuilderSave}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
} 