"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Store, Page } from '@/types'
import { StoreLayout } from '@/components/layout/store-layout'
import { 
  PlusIcon, 
  DocumentTextIcon, 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function StorePagesPage() {
  const params = useParams()
  const storeId = parseInt(params.id as string)
  
  const [store, setStore] = useState<Store | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadStoreAndPages = async () => {
    try {
      setIsLoading(true)
      
      // Load store info
      const storeResponse = await api.getStore(storeId)
      const storeData = storeResponse.data as Store
      setStore(storeData)

      // Load pages
      const pagesResponse = await api.getPages(storeId)
      const pagesData = Array.isArray(pagesResponse.data) ? pagesResponse.data : []
      
      // Add home page if it doesn't exist
      const hasHomePage = pagesData.some(page => page.slug === 'home')
      if (!hasHomePage) {
        const homePage: Page = {
          id: 0, // Temporary ID for home page
          title: 'Home',
          slug: 'home',
          content: 'Welcome to our store',
          type: 'home',
          is_published: true,
          seo_title: 'Home',
          seo_description: 'Welcome to our store',
          store_id: storeId,
          sections: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        pagesData.unshift(homePage) // Add home page at the beginning
      }
      
      setPages(pagesData as Page[])
    } catch (error) {
      console.error('Failed to load store and pages:', error)
      toast.error('Failed to load pages')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (storeId) {
      loadStoreAndPages()
    }
  }, [storeId])

  const handleDeletePage = async (pageId: number) => {
    if (!confirm('Are you sure you want to delete this page?')) {
      return
    }

    try {
      await api.deletePage(storeId, pageId)
      toast.success('Page deleted successfully')
      loadStoreAndPages()
    } catch (error) {
      console.error('Failed to delete page:', error)
      toast.error('Failed to delete page')
    }
  }

  const togglePublished = async (page: Page) => {
    try {
      await api.updatePage(storeId, page.id, {
        ...page,
        is_published: !page.is_published
      })
      toast.success(`Page ${page.is_published ? 'unpublished' : 'published'} successfully`)
      loadStoreAndPages()
    } catch (error) {
      console.error('Failed to update page:', error)
      toast.error('Failed to update page')
    }
  }

  const getPageTypeIcon = (type: string) => {
    switch (type) {
      case 'about':
        return '👤'
      case 'contact':
        return '📞'
      case 'privacy':
        return '🔒'
      case 'terms':
        return '📋'
      case 'custom':
        return '📄'
      default:
        return '📄'
    }
  }

  const getPageTypeLabel = (type: string) => {
    switch (type) {
      case 'about':
        return 'About'
      case 'contact':
        return 'Contact'
      case 'privacy':
        return 'Privacy Policy'
      case 'terms':
        return 'Terms of Service'
      case 'custom':
        return 'Custom Page'
      default:
        return 'Page'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <StoreLayout storeId={storeId} storeName={store?.name}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Pages
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your store's custom pages
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            💡 Tip: To design your main store layout, use the "Design Your Store" button in the store overview
          </p>
        </div>
        <Link
          href={`/dashboard/stores/${storeId}/pages/new`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Page</span>
        </Link>
      </div>



      {/* Pages List */}
      <div className="bg-white dark:bg-dark-900 shadow-sm border border-gray-200 dark:border-dark-700 rounded-lg overflow-hidden">
        {pages.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No pages yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first custom page to get started
            </p>
            <Link
              href={`/dashboard/stores/${storeId}/pages/new`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create Page</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-dark-700">
            {pages.map((page) => (
              <div key={page.id} className="p-6 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {page.slug === 'home' ? '🏠' : getPageTypeIcon(page.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {page.title}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-dark-700 dark:text-gray-300">
                          {page.slug === 'home' ? 'Home' : getPageTypeLabel(page.type)}
                        </span>
                        {page.is_published ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        /{page.slug}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        {page.slug === 'home' ? 'Default page' : `Created ${new Date(page.created_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Design Page */}
                    {page.slug === 'home' ? (
                      <Link
                        href={`/dashboard/stores/${storeId}/builder`}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Design home page"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/stores/${storeId}/pages/${page.id}/builder`}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Design page"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </Link>
                    )}

                    {/* View Page */}
                    {page.is_published && store && (
                      <Link
                        href={`/stores/${store.slug}/pages/${page.slug}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="View page"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                    )}

                    {/* Edit Page - Only show for non-home pages */}
                    {page.slug !== 'home' && (
                      <Link
                        href={`/dashboard/stores/${storeId}/pages/${page.id}/edit`}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Edit page"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                    )}

                    {/* Toggle Published - Only show for non-home pages */}
                    {page.slug !== 'home' && (
                      <button
                        onClick={() => togglePublished(page)}
                        className={`p-2 transition-colors ${
                          page.is_published
                            ? 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                            : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                        }`}
                        title={page.is_published ? 'Unpublish page' : 'Publish page'}
                      >
                        <GlobeAltIcon className="h-5 w-5" />
                      </button>
                    )}

                    {/* Delete Page - Only show for non-home pages */}
                    {page.slug !== 'home' && (
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete page"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </StoreLayout>
  )
}