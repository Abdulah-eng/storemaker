"use client"

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function StorePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  useEffect(() => {
    // Redirect to home page instead of showing root page
    if (slug) {
      router.replace(`/stores/${slug}/pages/home`)
    }
  }, [slug, router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="spinner h-12 w-12 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to store...</p>
      </div>
    </div>
  )
}