"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AdminLayout } from '@/components/layout/admin-layout'
import { StoreBuilder } from '@/components/store-builder/store-builder'
import { api } from '@/lib/api'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface TemplateFormData {
  name: string
  description: string
  category: string
  preview_url: string
  thumbnail_url: string
  is_premium: boolean
}

export default function CreateTemplatePage() {
  const { isLoading, isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    category: 'general',
    preview_url: '',
    thumbnail_url: '',
    is_premium: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [templateConfig, setTemplateConfig] = useState<any>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (isAuthenticated && user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
  }, [isLoading, isAuthenticated, user, router])

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

    if (!templateConfig) {
      toast.error('Please build the template first')
      return
    }

    setIsSaving(true)
    try {
      const templateData = {
        ...formData,
        config: templateConfig
      }

      await api.admin.createTemplate(templateData)
      toast.success('Template created successfully')
      router.push('/admin/templates')
    } catch (error) {
      console.error('Failed to create template:', error)
      toast.error('Failed to create template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBuilderSave = (config: any) => {
    setTemplateConfig(config)
    toast.success('Template configuration saved')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null // Will redirect
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
                Create Template
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Build a new store template using the template builder.
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving || !templateConfig}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Template'}
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
              Use the builder below to create your template layout and components.
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
              onSave={handleBuilderSave}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
} 