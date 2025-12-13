"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AdminLayout } from '@/components/layout/admin-layout'
import { CustomComponentCreator } from '@/components/admin/custom-component-creator'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function CreateCustomComponentPage() {
  const { isLoading, isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (isAuthenticated && user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
  }, [isLoading, isAuthenticated, user, router])

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

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/components"
            className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Components
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Create Custom Component
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Build a custom component that can be used in store templates.
            </p>
          </div>
        </div>

        {/* Component Creator */}
        <CustomComponentCreator />
      </div>
    </AdminLayout>
  )
} 