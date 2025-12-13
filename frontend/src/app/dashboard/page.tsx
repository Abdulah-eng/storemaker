"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api'
import { Store } from '@/types'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StoreCard } from '@/components/dashboard/store-card'
import { CreateStoreModal } from '@/components/dashboard/create-store-modal'
import { PlusIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [isLoadingStores, setIsLoadingStores] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (isAuthenticated) {
      fetchStores()
    }
  }, [isLoading, isAuthenticated, router])

  const fetchStores = async () => {
    try {
      setIsLoadingStores(true)
      const response = await api.getStores()
      console.log('Stores response:', response.data) // Debug log
      
      // Handle different response formats
      const data = response.data as any
      let storesData = []
      if (Array.isArray(data)) {
        storesData = data
      } else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
        storesData = data.data
      } else if (data && typeof data === 'object' && 'stores' in data && Array.isArray(data.stores)) {
        storesData = data.stores
      }
      
      console.log('Parsed stores data:', storesData) // Debug log
      setStores(storesData)
    } catch (error) {
      console.error('Failed to fetch stores:', error)
      toast.error('Failed to load stores')
      setStores([]) // Ensure stores is always an array
    } finally {
      setIsLoadingStores(false)
    }
  }

  const handleStoreCreated = (newStore: Store) => {
    setStores(prev => Array.isArray(prev) ? [...prev, newStore] : [newStore])
    setShowCreateModal(false)
    toast.success('Store created successfully!')
    // Refresh the stores list to get the complete data
    setTimeout(() => {
      fetchStores()
    }, 1000)
  }

  const handleDeleteStore = async (storeId: number) => {
    if (!storeId || !confirm('Are you sure you want to delete this store?')) return

    try {
      await api.deleteStore(storeId)
      setStores(prev => Array.isArray(prev) ? prev.filter(store => store.id !== storeId) : [])
      toast.success('Store deleted successfully')
    } catch {
      toast.error('Failed to delete store')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              My Stores
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage your ecommerce stores and track their performance
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center justify-center sm:justify-start w-full sm:w-auto"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Store
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="card p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg flex-shrink-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-600 rounded"></div>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Stores</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">{Array.isArray(stores) ? stores.length : 0}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 rounded"></div>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Stores</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {Array.isArray(stores) ? stores.filter(store => store.status === 'active').length : 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex-shrink-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-600 rounded"></div>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Draft Stores</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {Array.isArray(stores) ? stores.filter(store => store.status === 'draft').length : 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 rounded"></div>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">$0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stores Grid */}
        <div>
          {isLoadingStores ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-4 sm:p-6 animate-pulse">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : !Array.isArray(stores) || stores.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No stores yet
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Create your first store to start selling online
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary w-full sm:w-auto"
              >
                Create Your First Store
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.isArray(stores) && stores.map((store, index) => (
                <StoreCard
                  key={store.id || `store-${index}`}
                  store={store}
                  onDelete={() => handleDeleteStore(store.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateStoreModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onStoreCreated={handleStoreCreated}
      />
    </DashboardLayout>
  )
}