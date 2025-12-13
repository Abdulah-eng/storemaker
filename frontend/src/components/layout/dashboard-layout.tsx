"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import {
  HomeIcon,
  BuildingStorefrontIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'My Stores', href: '/dashboard', icon: BuildingStorefrontIcon },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-dark-900 shadow-xl">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 dark:border-dark-700">
            <Link href="/" className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400">
              StoreMaker
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 p-1"
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-dark-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-dark-900 shadow-lg">
          <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-dark-700">
            <Link href="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
              StoreMaker
            </Link>
          </div>
          
          <nav className="flex-1 px-6 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-700">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.first_name?.charAt(0) || user?.email?.charAt(0)}
                </span>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 bg-white dark:bg-dark-900 shadow-sm border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 p-1"
            >
              <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                Welcome back, {user?.first_name || 'User'}!
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 sm:hidden">
                Welcome back!
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}