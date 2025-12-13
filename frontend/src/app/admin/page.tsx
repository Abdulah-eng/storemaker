"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AdminLayout } from '@/components/layout/admin-layout'
import { api } from '@/lib/api'
import { 
  BuildingStorefrontIcon, 
  UserGroupIcon, 
  Squares2X2Icon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface SystemAnalytics {
  total_stores: number
  active_stores: number
  total_users: number
  total_products: number
  total_orders: number
  total_templates: number
}

export default function AdminDashboardPage() {
  const { isLoading, isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (isAuthenticated && user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    if (isAuthenticated) {
      fetchAnalytics()
    }
  }, [isLoading, isAuthenticated, user, router])

  const fetchAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true)
      const response = await api.admin.getSystemAnalytics()
      setAnalytics(response.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null // Will redirect
  }

  const stats = [
    {
      name: 'Total Stores',
      value: analytics?.total_stores || 0,
      icon: BuildingStorefrontIcon,
      href: '/admin/stores',
      color: 'bg-blue-500',
    },
    {
      name: 'Active Stores',
      value: analytics?.active_stores || 0,
      icon: BuildingStorefrontIcon,
      href: '/admin/stores',
      color: 'bg-green-500',
    },
    {
      name: 'Total Users',
      value: analytics?.total_users || 0,
      icon: UserGroupIcon,
      href: '/admin/users',
      color: 'bg-purple-500',
    },
    {
      name: 'Templates',
      value: analytics?.total_templates || 0,
      icon: Squares2X2Icon,
      href: '/admin/templates',
      color: 'bg-orange-500',
    },
    {
      name: 'Total Products',
      value: analytics?.total_products || 0,
      icon: ShoppingBagIcon,
      href: '/admin/stores',
      color: 'bg-indigo-500',
    },
    {
      name: 'Total Orders',
      value: analytics?.total_orders || 0,
      icon: ShoppingCartIcon,
      href: '/admin/stores',
      color: 'bg-pink-500',
    },
  ]

  const quickActions = [
    {
      name: 'Create Template',
      description: 'Create a new store template',
      href: '/admin/templates/create',
      icon: Squares2X2Icon,
    },
    {
      name: 'View All Stores',
      description: 'Manage all stores in the system',
      href: '/admin/stores',
      icon: BuildingStorefrontIcon,
    },
    {
      name: 'System Analytics',
      description: 'View detailed system analytics',
      href: '/admin/analytics',
      icon: ChartBarIcon,
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, {user?.first_name}. Here's what's happening with your system.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              href={stat.href}
              className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow hover:shadow-md transition-shadow"
            >
              <dt>
                <div className={`absolute rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {isLoadingAnalytics ? '...' : stat.value.toLocaleString()}
                </p>
              </dd>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <action.icon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {action.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Activity
          </h2>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <p className="text-gray-500 dark:text-gray-400">
              Recent activity will be displayed here. This feature is coming soon.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
} 