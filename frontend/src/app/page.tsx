"use client"

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      const mobileMenuElement = mobileMenuRef.current
      const toggleButtonElement = toggleButtonRef.current
      
      // Don't close if clicking on the toggle button or inside the mobile menu
      if (mobileMenuElement && 
          !mobileMenuElement.contains(target) && 
          toggleButtonElement &&
          !toggleButtonElement.contains(target)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])
  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 text-gray-900 dark:text-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-dark-950/90 backdrop-blur-md border-b border-gray-200 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
              StoreMaker
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-2 lg:space-x-4">
              <Link href="/auth/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-2 lg:px-3 py-2 text-sm lg:text-base transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="bg-primary-600 hover:bg-primary-700 text-white px-3 lg:px-4 py-2 rounded-lg transition-colors text-sm lg:text-base font-medium">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex sm:hidden items-center">
              <button
                ref={toggleButtonRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
                aria-label="Toggle mobile menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="sm:hidden bg-white dark:bg-dark-950 border-t border-gray-200 dark:border-dark-700">
            <div className="px-4 py-4 space-y-3">
              <Link 
                href="/auth/login" 
                className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 py-2 text-base transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register" 
                className="block bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg transition-colors text-center font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Build Your Dream{' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Ecommerce Store
              </span>{' '}
              in Minutes
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto px-4 sm:px-0">
              Create stunning, conversion-optimized online stores with our AI-powered platform. 
              No coding required, unlimited customization, and built for scale.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
              <Link href="/auth/register" className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-colors text-center">
                Start Building Free
              </Link>
              <Link href="#demo" className="w-full sm:w-auto text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-lg border border-gray-300 dark:border-dark-700 transition-colors text-center">
                Watch Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">10K+</div>
                <div className="text-gray-600 dark:text-gray-400">Stores Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">99.9%</div>
                <div className="text-gray-600 dark:text-gray-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">24/7</div>
                <div className="text-gray-600 dark:text-gray-400">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4 sm:px-0">
              Powerful features designed to help you create, customize, and grow your online business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-dark-900 p-8 rounded-xl border border-gray-200 dark:border-dark-700 text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Store Creation</h3>
              <p className="text-gray-600 dark:text-gray-400">Let AI help you build your perfect store in minutes with intelligent suggestions.</p>
            </div>
            
            <div className="bg-white dark:bg-dark-900 p-8 rounded-xl border border-gray-200 dark:border-dark-700 text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-3">Beautiful Templates</h3>
              <p className="text-gray-600 dark:text-gray-400">Choose from dozens of professionally designed templates optimized for conversion.</p>
            </div>
            
            <div className="bg-white dark:bg-dark-900 p-8 rounded-xl border border-gray-200 dark:border-dark-700 text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-3">Drag & Drop Builder</h3>
              <p className="text-gray-600 dark:text-gray-400">Customize every aspect of your store with our intuitive visual editor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 dark:bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Launch Your Store?
          </h2>
          <p className="text-lg sm:text-xl text-primary-100 mb-8 max-w-2xl mx-auto px-4 sm:px-0">
            Join thousands of successful merchants who chose StoreMaker to power their online business.
          </p>
          <Link href="/auth/register" className="inline-block bg-white text-primary-600 hover:bg-gray-100 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-colors">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">StoreMaker</div>
            <p className="text-gray-600 dark:text-gray-400 mb-8 px-4 sm:px-0">
              The easiest way to create and manage your online store.
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm sm:text-base">&copy; 2024 StoreMaker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
