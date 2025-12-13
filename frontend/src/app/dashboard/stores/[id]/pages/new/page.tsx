"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { PageCreateData, PageType } from '@/types'
import { StoreLayout } from '@/components/layout/store-layout'
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import toast from 'react-hot-toast'

const PAGE_TYPES: { value: PageType; label: string; description: string }[] = [
  { value: 'home', label: 'Home Page', description: 'Main landing page for your store' },
  { value: 'about', label: 'About Page', description: 'Information about your store or company' },
  { value: 'contact', label: 'Contact Page', description: 'Contact information and form' },
  { value: 'privacy', label: 'Privacy Policy', description: 'Privacy policy and data handling' },
  { value: 'terms', label: 'Terms of Service', description: 'Terms and conditions' },
  { value: 'custom', label: 'Custom Page', description: 'Any other type of page' }
]

export default function NewPagePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const storeId = parseInt(params.id as string)
  
  const [formData, setFormData] = useState<PageCreateData>({
    title: '',
    slug: '',
    content: '',
    type: 'custom',
    is_published: false,
    seo_title: '',
    seo_description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle URL parameters to pre-select page type
  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (typeParam && ['home', 'about', 'contact', 'privacy', 'terms', 'custom'].includes(typeParam)) {
      setFormData(prev => ({
        ...prev,
        type: typeParam as PageType,
        title: typeParam === 'home' ? 'Home' : prev.title,
        slug: typeParam === 'home' ? 'home' : prev.slug
      }))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Page title is required')
      return
    }

    if (!formData.content.trim()) {
      toast.error('Page content is required')
      return
    }

    try {
      setIsSubmitting(true)
      
      // For home pages, ensure slug is 'home'
      const pageData = {
        ...formData,
        slug: formData.type === 'home' ? 'home' : formData.slug
      }
      
      await api.createPage(storeId, pageData as unknown as Record<string, unknown>)
      toast.success('Page created successfully')
      
      // Redirect to builder if it's a home page, otherwise to pages list
      if (formData.type === 'home') {
        router.push(`/dashboard/stores/${storeId}/builder`)
      } else {
        router.push(`/dashboard/stores/${storeId}/pages`)
      }
    } catch (error) {
      console.error('Failed to create page:', error)
      toast.error('Failed to create page')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      // Auto-generate slug from title if slug is empty
      slug: prev.slug === '' ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : prev.slug
    }))
  }

  return (
    <StoreLayout storeId={storeId}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href={`/dashboard/stores/${storeId}/pages`}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Create New Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add a custom page to your store
          </p>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Page Creation:</strong> This form creates a basic page with content. After creating the page, you can use the page builder to design a custom layout that won't affect your main store layout.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-dark-900 shadow-sm border border-gray-200 dark:border-dark-700 rounded-lg p-6">
          <div className="space-y-6">
            {/* Page Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Page Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PAGE_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors ${
                      formData.type === type.value
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                        : 'border-gray-300 dark:border-dark-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as PageType }))}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {type.label}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Page Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter page title"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL Slug
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-dark-600 bg-gray-50 dark:bg-dark-800 text-gray-500 dark:text-gray-400 text-sm">
                  /pages/
                </span>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-r-lg dark:bg-dark-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="page-url-slug"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to auto-generate from title
              </p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your page content here... You can use HTML tags for formatting."
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                HTML tags are supported for formatting
              </p>
            </div>
          </div>
        </div>

        {/* SEO Section */}
        <div className="bg-white dark:bg-dark-900 shadow-sm border border-gray-200 dark:border-dark-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            SEO Settings
          </h3>
          <div className="space-y-6">
            {/* SEO Title */}
            <div>
              <label htmlFor="seo_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                id="seo_title"
                value={formData.seo_title}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Custom title for search engines"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to use page title
              </p>
            </div>

            {/* SEO Description */}
            <div>
              <label htmlFor="seo_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SEO Description
              </label>
              <textarea
                id="seo_description"
                value={formData.seo_description}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description for search engines"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Recommended: 150-160 characters
              </p>
            </div>
          </div>
        </div>

        {/* Publish Settings */}
        <div className="bg-white dark:bg-dark-900 shadow-sm border border-gray-200 dark:border-dark-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Publish Settings
          </h3>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-dark-600 rounded"
            />
            <label htmlFor="is_published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Publish this page immediately
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Unpublished pages are only visible to store owners
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href={`/dashboard/stores/${storeId}/pages`}
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <DocumentTextIcon className="h-5 w-5" />
                <span>Create Page</span>
              </>
            )}
          </button>
        </div>
      </form>
      </div>
    </StoreLayout>
  )
}