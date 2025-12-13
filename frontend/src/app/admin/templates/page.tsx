"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AdminLayout } from '@/components/layout/admin-layout'
import { api } from '@/lib/api'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { isValidImageUrl, handleImageError, getImageUrl } from '@/lib/image-utils'

interface Template {
  id: number
  name: string
  description: string
  category: string
  preview_url: string
  thumbnail_url: string
  is_active: boolean
  is_premium: boolean
  created_at: string
  updated_at: string
}

export default function AdminTemplatesPage() {
  const { isLoading, isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)

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
      fetchTemplates()
    }
  }, [isLoading, isAuthenticated, user, router])

  const fetchTemplates = async () => {
    try {
      setIsLoadingTemplates(true)
      const response = await api.admin.getAllTemplates()
      setTemplates(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return
    }

    try {
      await api.admin.deleteTemplate(templateId)
      setTemplates(prev => prev.filter(template => template.id !== templateId))
      toast.success('Template deleted successfully')
    } catch (error) {
      console.error('Failed to delete template:', error)
      toast.error('Failed to delete template')
    }
  }

  const handleToggleStatus = async (templateId: number, currentStatus: boolean) => {
    try {
      await api.admin.updateTemplate(templateId, { is_active: !currentStatus })
      setTemplates(prev => prev.map(template => 
        template.id === templateId 
          ? { ...template, is_active: !currentStatus }
          : template
      ))
      toast.success(`Template ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error('Failed to update template status:', error)
      toast.error('Failed to update template status')
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

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Templates
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage store templates for your platform.
            </p>
          </div>
          <Link
            href="/admin/templates/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Template
          </Link>
        </div>

        {/* Templates List */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          {isLoadingTemplates ? (
            <div className="p-8 text-center">
              <div className="spinner h-8 w-8 mx-auto"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No templates found.</p>
              <Link
                href="/admin/templates/create"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-400 dark:bg-indigo-900 dark:hover:bg-indigo-800"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create your first template
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {templates.map((template) => (
                <li key={template.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {isValidImageUrl(template.thumbnail_url) ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={template.thumbnail_url}
                            alt={template.name}
                            onError={handleImageError}
                          />
                        ) : null}
                        <div className={`h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${isValidImageUrl(template.thumbnail_url) ? 'hidden' : ''}`}>
                          <span className="text-gray-500 dark:text-gray-400 text-xs">No image</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {template.name}
                          </h3>
                          <div className="ml-2 flex items-center space-x-2">
                            {template.is_premium && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Premium
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              template.is_active 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {template.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {template.description}
                        </p>
                        <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span className="capitalize">{template.category}</span>
                          <span className="mx-2">•</span>
                          <span>Created {new Date(template.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(template.id, template.is_active)}
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
                          template.is_active
                            ? 'text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-900 dark:hover:bg-red-800'
                            : 'text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-400 dark:bg-green-900 dark:hover:bg-green-800'
                        }`}
                      >
                        {template.is_active ? (
                          <>
                            <XMarkIcon className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </button>
                      <Link
                        href={`/admin/templates/${template.id}/edit`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-900 dark:hover:bg-red-800"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  )
} 