"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  HomeIcon,
  DocumentTextIcon,
  PaintBrushIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface StoreNavProps {
  storeId: number
  storeName?: string
}

const storeNavigation = [
  { name: 'Overview', href: '', icon: HomeIcon },
  { name: 'Home Builder', href: '/builder', icon: PaintBrushIcon },
  { name: 'Pages', href: '/pages', icon: DocumentTextIcon },
  // Removed products page link; default nav shows pages only
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

export function StoreNav({ storeId, storeName }: StoreNavProps) {
  const pathname = usePathname()
  const baseHref = `/dashboard/stores/${storeId}`

  return (
    <div className="border-b border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 sm:space-x-6 min-w-0 flex-1">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                title="Back to dashboard"
              >
                <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <span className="text-gray-400 dark:text-gray-500 text-sm sm:text-base">/</span>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {storeName || 'Store'}
              </h1>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-4 sm:space-x-8 -mb-px overflow-x-auto scrollbar-hide">
          {storeNavigation.map((item) => {
            const href = baseHref + item.href
            const isActive = pathname === href || (item.href && pathname.startsWith(href))
            
            return (
              <Link
                key={item.name}
                href={href}
                className={`group inline-flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-dark-600'
                }`}
              >
                <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${
                  isActive 
                    ? 'text-blue-500 dark:text-blue-400' 
                    : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                }`} />
                <span className="hidden sm:inline">{item.name}</span>
                <span className="sm:hidden">{item.name.charAt(0)}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}