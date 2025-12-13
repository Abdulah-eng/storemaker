"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api'
import { Store, Template, Page } from '@/types'
import { StoreBuilder } from '@/components/store-builder/store-builder'
import toast from 'react-hot-toast'

export default function StoreBuilderPage() {
  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const storeId = params.id as string
  
  const [store, setStore] = useState<Store | null>(null)
  const [template, setTemplate] = useState<Template | null>(null)
  const [homePage, setHomePage] = useState<Page | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const loadStoreData = useCallback(async () => {
    try {
      setIsLoadingData(true)
      
      // Validate store ID
      const id = parseInt(storeId)
      if (isNaN(id) || id <= 0) {
        toast.error('Invalid store ID')
        router.push('/dashboard')
        return
      }
      
      // Load store data
      const storeResponse = await api.getStore(id)
      const storeData = storeResponse.data as Store
      
      // Validate store data
      if (!storeData || !storeData.id) {
        toast.error('Store not found')
        router.push('/dashboard')
        return
      }
      
      setStore(storeData)

      // Load template if store has one
      if (storeData.template_id) {
        try {
          const templateResponse = await api.getTemplate(storeData.template_id)
          setTemplate(templateResponse.data as Template)
        } catch (templateError) {
          console.warn('Failed to load template:', templateError)
          // Continue without template
        }
      }

      // Load pages to find the home page
      try {
        const pagesResponse = await api.getPages(id)
        const pages = Array.isArray(pagesResponse.data) ? pagesResponse.data : []
        const foundHomePage = pages.find((p: Page) => p.type === 'home' || p.slug === 'home')
        
        if (foundHomePage) {
          setHomePage(foundHomePage)
          // Automatically redirect to the home page builder
          setIsRedirecting(true)
          router.push(`/dashboard/stores/${id}/pages/${foundHomePage.id}/builder`)
          return
        }
      } catch (pagesError) {
        console.warn('Failed to load pages:', pagesError)
        // Continue without pages - will show store layout builder
      }
    } catch (error) {
      console.error('Failed to load store data:', error)
      toast.error('Failed to load store')
      router.push('/dashboard')
    } finally {
      setIsLoadingData(false)
    }
  }, [storeId, router])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (isAuthenticated && storeId && !isRedirecting) {
      loadStoreData()
    }
  }, [isLoading, isAuthenticated, router, storeId, loadStoreData, isRedirecting])

  if (isLoading || isLoadingData || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isRedirecting ? 'Redirecting to home page builder...' : 'Loading store builder...'}
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !store) {
    return null
  }

  // If no home page found, show a message and option to create one
  if (!homePage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <svg className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Home Page Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your store doesn't have a home page yet. Create one to start building your store design.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/dashboard/stores/${store.id}/pages/new?type=home`)}
              className="w-full btn-primary"
            >
              Create Home Page
            </button>
            <button
              onClick={() => router.push(`/dashboard/stores/${store.id}/pages`)}
              className="w-full btn-secondary"
            >
              Manage Pages
            </button>
          </div>
        </div>
      </div>
    )
  }

  // This should not be reached due to redirect, but fallback to store layout builder
  return <StoreBuilder store={store} template={template || undefined} />
}