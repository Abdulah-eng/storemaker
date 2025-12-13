"use client"

import Link from 'next/link'
import { Store } from '@/types'
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline'

interface StoreCardProps {
  store: Store
  onDelete: () => void
}

export function StoreCard({ store, onDelete }: StoreCardProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      return date.toLocaleDateString()
    } catch (error) {
      console.error('Date parsing error:', error)
      return 'Invalid date'
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button, a')) {
      return
    }
    
    if (store.id) {
      window.location.href = `/dashboard/stores/${store.id}`
    }
  }

  return (
    <div 
      onClick={handleCardClick}
      className="card p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer relative group"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center min-w-0 flex-1">
          {store.logo ? (
            <img
              src={store.logo}
              alt={store.name}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <BuildingStorefrontIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />
            </div>
          )}
          <div className="ml-2 sm:ml-3 min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {store.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
              {store.slug ? `${store.slug}.storemaker.com` : store.domain || store.subdomain || 'No domain set'}
            </p>
          </div>
        </div>
        
        <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${getStatusColor(store.status || 'draft')}`}>
          {store.status || 'draft'}
        </span>
      </div>

      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
        {store.description || 'No description provided'}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <ChartBarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">0 orders</span>
            <span className="sm:hidden">0</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 opacity-70 group-hover:opacity-100 transition-opacity">
          {store.status === 'active' && store.slug && (
            <Link
              href={`/stores/${store.slug}`}
              target="_blank"
              className="p-1.5 sm:p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800"
              title="View Live Store"
              onClick={(e) => e.stopPropagation()}
            >
              <EyeIcon className="h-4 w-4" />
            </Link>
          )}
          
          <Link
            href={store.id ? `/dashboard/stores/${store.id}` : '#'}
            className={`p-1.5 sm:p-2 transition-colors rounded-lg ${
              store.id 
                ? 'text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-800'
                : 'text-gray-300 cursor-not-allowed dark:text-gray-600'
            }`}
            title={store.id ? "Edit Store" : "Store data loading..."}
            onClick={(e) => {
              e.stopPropagation()
              if (!store.id) e.preventDefault()
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </Link>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (store.id) onDelete()
            }}
            className={`p-1.5 sm:p-2 transition-colors rounded-lg ${
              store.id 
                ? 'text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-gray-300 cursor-not-allowed dark:text-gray-600'
            }`}
            title={store.id ? "Delete Store" : "Store data loading..."}
            disabled={!store.id}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-500 dark:text-gray-400 truncate">
            Created {formatDate(store.created_at)}
          </span>
          <Link
            href={store.id ? `/dashboard/stores/${store.id}` : '#'}
            className={`font-medium transition-colors flex-shrink-0 ml-2 ${
              store.id 
                ? 'text-primary-600 hover:text-primary-700 dark:text-primary-400'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              if (!store.id) e.preventDefault()
            }}
          >
            <span className="hidden sm:inline">Manage →</span>
            <span className="sm:hidden">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}