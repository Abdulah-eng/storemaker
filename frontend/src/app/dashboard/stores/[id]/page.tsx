"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api'
import { Store } from '@/types'
import { StoreLayout } from '@/components/layout/store-layout'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function StoreManagePage() {
  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const storeId = params.id as string
  
  const [store, setStore] = useState<Store | null>(null)
  const [isLoadingStore, setIsLoadingStore] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (isAuthenticated && storeId) {
      fetchStore()
    }
  }, [isLoading, isAuthenticated, router, storeId])

  const fetchStore = async () => {
    try {
      setIsLoadingStore(true)
      const response = await api.getStore(parseInt(storeId))
      setStore(response.data as Store)
    } catch (error) {
      console.error('Failed to fetch store:', error)
      toast.error('Failed to load store')
      router.push('/dashboard')
    } finally {
      setIsLoadingStore(false)
    }
  }

  const handleActivateStore = async () => {
    try {
      await api.updateStore(parseInt(storeId), { status: 'active' })
      toast.success('Store activated successfully!')
      fetchStore() // Refresh store data
    } catch (error) {
      console.error('Failed to activate store:', error)
      toast.error('Failed to activate store')
    }
  }

  const handleDeactivateStore = async () => {
    try {
      await api.updateStore(parseInt(storeId), { status: 'draft' })
      toast.success('Store deactivated successfully!')
      fetchStore() // Refresh store data
    } catch (error) {
      console.error('Failed to deactivate store:', error)
      toast.error('Failed to deactivate store')
    }
  }

  if (isLoading || isLoadingStore) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!isAuthenticated || !store) {
    return null
  }

  return (
    <StoreLayout storeId={parseInt(storeId)} storeName={store.name}>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Store Overview
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage your store settings, products, and analytics
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full text-center ${
              store.status === 'active' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : store.status === 'draft'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {store.status}
            </span>
            {/* Status Toggle Button */}
            {store.status === 'draft' ? (
              <button
                onClick={handleActivateStore}
                className="btn-primary w-full sm:w-auto"
              >
                Activate Store
              </button>
            ) : store.status === 'active' ? (
              <button
                onClick={handleDeactivateStore}
                className="btn-secondary w-full sm:w-auto"
              >
                Deactivate Store
              </button>
            ) : null}
            
            {store.status === 'active' && (
              <Link
                href={`/stores/${store.slug}`}
                target="_blank"
                className="btn-secondary w-full sm:w-auto text-center"
              >
                View Store
              </Link>
            )}
          </div>
        </div>

        {/* Draft Store Warning */}
        {store.status === 'draft' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Store is in Draft Mode
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Your store is not publicly accessible. Click "Activate Store" to make it live.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Store Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="card p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Store Information</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {store.logo ? (
                    <img src={store.logo} alt="Logo" className="h-12 w-12 rounded object-contain bg-white border" />
                  ) : (
                    <div className="h-12 w-12 rounded bg-gray-100 border flex items-center justify-center text-gray-400">Logo</div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        if (!e.target.files || e.target.files.length === 0) return
                        const file = e.target.files[0]
                        try {
                          const res = await api.uploadStoreLogo(parseInt(storeId), file)
                          const url = (res.data as any).url as string
                          await api.updateStore(store.id.toString(), { logo: url })
                          toast.success('Logo updated')
                          fetchStore()
                        } catch (err) {
                          toast.error('Failed to upload logo')
                        }
                      }}
                      className="block text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {store.favicon ? (
                    <img src={store.favicon} alt="Favicon" className="h-8 w-8 rounded object-contain bg-white border" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-gray-100 border flex items-center justify-center text-gray-400 text-xs">Icon</div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        if (!e.target.files || e.target.files.length === 0) return
                        const file = e.target.files[0]
                        try {
                          const res = await api.uploadStoreFavicon(parseInt(storeId), file)
                          const url = (res.data as any).url as string
                          await api.updateStore(store.id.toString(), { favicon: url })
                          toast.success('Favicon updated')
                          fetchStore()
                        } catch (err) {
                          toast.error('Failed to upload favicon')
                        }
                      }}
                      className="block text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Store Name
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 break-words">{store.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 break-words">
                    {store.description || 'No description provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Store URL
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 break-words">
                    {store.domain || `${store.subdomain}.storemaker.com`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Created
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {new Date(store.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Quick Actions */}
            <div className="card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/dashboard/stores/${store.id}/builder`}
                  className="w-full btn-primary text-center sm:text-left flex items-center justify-center sm:justify-start"
                  title="Design your store's home page layout and components"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span className="hidden sm:inline">Design Home Page</span>
                  <span className="sm:hidden">Design Home</span>
                </Link>
                <button className="w-full btn-secondary text-center sm:text-left">
                  <span className="hidden sm:inline">Edit Store Settings</span>
                  <span className="sm:hidden">Settings</span>
                </button>
                <button className="w-full btn-secondary text-center sm:text-left">
                  <span className="hidden sm:inline">Manage Products</span>
                  <span className="sm:hidden">Products</span>
                </button>
                <button className="w-full btn-secondary text-center sm:text-left">
                  <span className="hidden sm:inline">View Orders</span>
                  <span className="sm:hidden">Orders</span>
                </button>
                <button className="w-full btn-secondary text-center sm:text-left">
                  Analytics
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Store Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Total Products</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Total Orders</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Revenue</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Visitors</span>
                  <span className="font-semibold">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  )
}