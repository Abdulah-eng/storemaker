"use client"

import { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Store, Page, PageType } from '@/types'
import { StoreLayout } from '@/components/layout/store-layout'
import { StoreBuilder } from '@/components/store-builder/store-builder'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function PageBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = parseInt(params.id as string)
  const pageId = parseInt(params.pageId as string)
  
  const [store, setStore] = useState<Store | null>(null)
  const [page, setPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadStoreAndPage = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Load store info
      const storeResponse = await api.getStore(storeId)
      const storeData = storeResponse.data as Store
      setStore(storeData)

      // Load page info
      const pagesResponse = await api.getPages(storeId)
      const pages = Array.isArray(pagesResponse.data) ? pagesResponse.data : []
      const foundPage = pages.find((p: Page) => p.id === pageId)
      
      if (!foundPage) {
        toast.error('Page not found')
        router.push(`/dashboard/stores/${storeId}/pages`)
        return
      }

      setPage(foundPage)
    } catch (error) {
      console.error('Failed to load store and page:', error)
      toast.error('Failed to load page')
      router.push(`/dashboard/stores/${storeId}/pages`)
    } finally {
      setIsLoading(false)
    }
  }, [storeId, pageId, router])

  useEffect(() => {
    if (storeId && pageId) {
      loadStoreAndPage()
    }
  }, [storeId, pageId, loadStoreAndPage])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!store || !page) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Link
                href={`/dashboard/stores/${storeId}/pages`}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                  Page Builder
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  Designing: {page.title}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <Link
                href={`/dashboard/stores/${storeId}/pages/${pageId}/edit`}
                className="px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Back to Edit</span>
                <span className="sm:hidden">Edit</span>
              </Link>
              {page.is_published && (
                <Link
                  href={`/stores/${store.slug}/pages/${page.slug}`}
                  target="_blank"
                  className="px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">View Page</span>
                  <span className="sm:hidden">View</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-3 sm:p-4 mx-2 sm:mx-4 mt-2 sm:mt-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 000-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-2 sm:ml-3">
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              <strong>Page Builder:</strong> <span className="hidden sm:inline">You can now design and save page-specific layouts that won't affect your main store layout. Use the save button to persist your changes.</span>
              <span className="sm:hidden">Design and save page layouts. Use save to persist changes.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Page Builder */}
      <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
        <StoreBuilder 
          store={store} 
          pageId={pageId}
          pageType={page.type}
          pageTitle={page.title}
        />
      </div>
    </div>
  )
} 