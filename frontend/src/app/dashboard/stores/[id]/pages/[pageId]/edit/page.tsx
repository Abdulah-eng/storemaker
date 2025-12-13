"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Page, PageType, Store } from '@/types'
import { StoreLayout } from '@/components/layout/store-layout'
import { ArrowLeftIcon, DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import toast from 'react-hot-toast'

const PAGE_TYPES: { value: PageType; label: string; description: string }[] = [
  { value: 'about', label: 'About Page', description: 'Information about your store or company' },
  { value: 'contact', label: 'Contact Page', description: 'Contact information and form' },
  { value: 'privacy', label: 'Privacy Policy', description: 'Privacy policy and data handling' },
  { value: 'terms', label: 'Terms of Service', description: 'Terms and conditions' },
  { value: 'custom', label: 'Custom Page', description: 'Any other type of page' }
]

export default function EditPagePage() {
  const params = useParams()
  const router = useRouter()
  const storeId = parseInt(params.id as string)
  const pageId = parseInt(params.pageId as string)
  
  const [page, setPage] = useState<Page | null>(null)
  const [store, setStore] = useState<Store | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    type: 'custom' as PageType,
    is_published: false,
    seo_title: '',
    seo_description: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadStore = useCallback(async () => {
    try {
      const response = await api.getStore(storeId)
      setStore(response.data as Store)
    } catch (error) {
      console.error('Failed to load store:', error)
    }
  }, [storeId])

  const loadPage = useCallback(async () => {
    try {
      setIsLoading(true)
      // Since we don't have a direct getPage endpoint for management, 
      // we'll get all pages and find the one we need
      const response = await api.getPages(storeId)
      const pages = Array.isArray(response.data) ? response.data : []
      const foundPage = pages.find((p: Page) => p.id === pageId)
      
      if (!foundPage) {
        toast.error('Page not found')
        router.push(`/dashboard/stores/${storeId}/pages`)
        return
      }

      setPage(foundPage)
      setFormData({
        title: foundPage.title,
        slug: foundPage.slug,
        content: foundPage.content,
        type: foundPage.type,
        is_published: foundPage.is_published,
        seo_title: foundPage.seo_title || '',
        seo_description: foundPage.seo_description || ''
      })
    } catch (error) {
      console.error('Failed to load page:', error)
      toast.error('Failed to load page')
      router.push(`/dashboard/stores/${storeId}/pages`)
    } finally {
      setIsLoading(false)
    }
  }, [storeId, pageId, router])

  useEffect(() => {
    if (storeId && pageId) {
      loadStore()
      loadPage()
    }
  }, [storeId, pageId, loadStore, loadPage])

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
      await api.updatePage(storeId, pageId, formData as unknown as Record<string, unknown>)
      toast.success('Page updated successfully')
      router.push(`/dashboard/stores/${storeId}/pages`)
    } catch (error) {
      console.error('Failed to update page:', error)
      toast.error('Failed to update page')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!page) {
    return null
  }

  return (
    <StoreLayout storeId={storeId}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href={`/dashboard/stores/${storeId}/pages`}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Edit Page
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Update your page content and settings
            </p>
          </div>
        </div>

                 {/* Action Buttons */}
         <div className="flex items-center space-x-3">
           <Link
             href={`/dashboard/stores/${storeId}/pages/${pageId}/builder`}
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
             </svg>
             <span>Design Page</span>
           </Link>
           
           {page.is_published && store && (
             <Link
               href={`/stores/${store.slug}/pages/${page.slug}`}
               target="_blank"
               className="bg-gray-100 hover:bg-gray-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
             >
               <EyeIcon className="h-5 w-5" />
               <span>Preview</span>
             </Link>
           )}
         </div>
      </div>

             {/* Info Banner */}
       <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded mb-6">
         <div className="flex">
           <div className="flex-shrink-0">
             <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 000-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
             </svg>
           </div>
           <div className="ml-3">
             <p className="text-sm text-blue-800 dark:text-blue-200">
               <strong>Page Management:</strong> This form edits the page content and metadata. To design the page layout, use the "Design Page" button which now supports saving page-specific layouts.
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Note: This creates additional pages. To design your main store layout, use the "Design Your Store" button in the store overview.
          </p>
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
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                Changing the slug will affect the page URL
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
              Page is published
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
                <span>Saving...</span>
              </>
            ) : (
              <>
                <DocumentTextIcon className="h-5 w-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
      </div>
    </StoreLayout>
  )
}