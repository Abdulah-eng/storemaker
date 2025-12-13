"use client"

import { useState, useEffect } from 'react'
import { Store, Template } from '@/types'
import { 
  SwatchIcon, 
  PaintBrushIcon, 
  CogIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface ThemeCustomizerProps {
  store: Store
  template?: Template
  onSave: (themeData: ThemeConfig) => void
  onPreview: () => void
  onThemeChange?: (themeData: ThemeConfig) => void
  initialTheme?: ThemeConfig | null
}

export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    background: string
  }
  fonts: {
    heading: string
    body: string
  }
  layout: {
    header: string
    hero: string
    product_grid: string
    footer: string
  }
}

const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#3b82f6',
    secondary: '#f8fafc',
    accent: '#10b981',
    text: '#1f2937',
    background: '#ffffff'
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter'
  },
  layout: {
    header: 'modern',
    hero: 'full-width',
    product_grid: '3-column',
    footer: 'minimal'
  }
}

const colorPresets = [
  {
    name: 'Blue Ocean',
    colors: {
      primary: '#3b82f6',
      secondary: '#f1f5f9',
      accent: '#0ea5e9',
      text: '#1e293b',
      background: '#ffffff'
    }
  },
  {
    name: 'Green Nature',
    colors: {
      primary: '#10b981',
      secondary: '#f0fdf4',
      accent: '#22c55e',
      text: '#0f172a',
      background: '#ffffff'
    }
  },
  {
    name: 'Purple Luxury',
    colors: {
      primary: '#8b5cf6',
      secondary: '#faf5ff',
      accent: '#a855f7',
      text: '#1f2937',
      background: '#ffffff'
    }
  },
  {
    name: 'Dark Modern',
    colors: {
      primary: '#06b6d4',
      secondary: '#1f2937',
      accent: '#0891b2',
      text: '#f9fafb',
      background: '#111827'
    }
  },
  {
    name: 'Warm Orange',
    colors: {
      primary: '#ea580c',
      secondary: '#fff7ed',
      accent: '#fb923c',
      text: '#1c1917',
      background: '#ffffff'
    }
  },
  {
    name: 'Rose Gold',
    colors: {
      primary: '#e11d48',
      secondary: '#fff1f2',
      accent: '#f43f5e',
      text: '#1f2937',
      background: '#ffffff'
    }
  }
]

const fontOptions = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Source Sans Pro', value: 'Source Sans Pro, sans-serif' },
  { name: 'Nunito Sans', value: 'Nunito Sans, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' }
]

const layoutOptions = {
  header: [
    { name: 'Modern', value: 'modern', description: 'Clean modern header with centered logo' },
    { name: 'Clean', value: 'clean', description: 'Minimalist header design' },
    { name: 'Minimal', value: 'minimal', description: 'Ultra-minimal header' }
  ],
  hero: [
    { name: 'Full Width', value: 'full-width', description: 'Hero spans full viewport width' },
    { name: 'Split Layout', value: 'split-layout', description: 'Text and image side by side' },
    { name: 'Minimal Hero', value: 'minimal-hero', description: 'Simple centered text' }
  ],
  product_grid: [
    { name: '2 Columns', value: '2-column', description: 'Two products per row' },
    { name: '3 Columns', value: '3-column', description: 'Three products per row' },
    { name: '4 Columns', value: '4-column', description: 'Four products per row' }
  ],
  footer: [
    { name: 'Minimal', value: 'minimal', description: 'Simple footer with basic info' },
    { name: 'Detailed', value: 'detailed', description: 'Comprehensive footer with links' }
  ]
}

export function ThemeCustomizer({ store, template, onSave, onPreview, onThemeChange, initialTheme }: ThemeCustomizerProps) {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    if (initialTheme) {
      return {
        colors: { ...defaultTheme.colors, ...initialTheme.colors },
        fonts: { ...defaultTheme.fonts, ...initialTheme.fonts },
        layout: { ...defaultTheme.layout, ...initialTheme.layout }
      }
    }
    return defaultTheme
  })
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'layout'>('colors')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Load template configuration if available
    if (template?.config && !initialTheme) {
      try {
        const config = typeof template.config === 'string' 
          ? JSON.parse(template.config) 
          : template.config
        
        setThemeConfig({
          colors: config.colors || defaultTheme.colors,
          fonts: config.fonts || defaultTheme.fonts,
          layout: config.layout || defaultTheme.layout
        })
      } catch (error) {
        console.error('Error parsing template config:', error)
      }
    }
  }, [template, initialTheme])



  const updateColors = (colorKey: keyof ThemeConfig['colors'], value: string) => {
    const newTheme = {
      ...themeConfig,
      colors: {
        ...themeConfig.colors,
        [colorKey]: value
      }
    }
    setThemeConfig(newTheme)
    setHasChanges(true)
    // Apply theme changes immediately in real-time
    if (onThemeChange) {
      onThemeChange(newTheme)
    }
  }

  const updateFonts = (fontKey: keyof ThemeConfig['fonts'], value: string) => {
    const newTheme = {
      ...themeConfig,
      fonts: {
        ...themeConfig.fonts,
        [fontKey]: value
      }
    }
    setThemeConfig(newTheme)
    setHasChanges(true)
    // Apply theme changes immediately in real-time
    if (onThemeChange) {
      onThemeChange(newTheme)
    }
  }

  const updateLayout = (layoutKey: keyof ThemeConfig['layout'], value: string) => {
    const newTheme = {
      ...themeConfig,
      layout: {
        ...themeConfig.layout,
        [layoutKey]: value
      }
    }
    setThemeConfig(newTheme)
    setHasChanges(true)
    // Apply theme changes immediately in real-time
    if (onThemeChange) {
      onThemeChange(newTheme)
    }
  }

  const applyPreset = (preset: typeof colorPresets[0]) => {
    const newTheme = {
      ...themeConfig,
      colors: preset.colors
    }
    setThemeConfig(newTheme)
    setHasChanges(true)
    // Apply theme changes immediately in real-time
    if (onThemeChange) {
      onThemeChange(newTheme)
    }
    toast.success(`Applied ${preset.name} preset`)
  }

  const resetToDefault = () => {
    setThemeConfig(defaultTheme)
    setHasChanges(true)
    // Apply theme changes immediately in real-time
    if (onThemeChange) {
      onThemeChange(defaultTheme)
    }
    toast.success('Reset to default theme')
  }

  const resetToTemplate = () => {
    if (template?.config) {
      try {
        const config = typeof template.config === 'string' 
          ? JSON.parse(template.config) 
          : template.config
        
        const newTheme = {
          colors: config.colors || defaultTheme.colors,
          fonts: config.fonts || defaultTheme.fonts,
          layout: config.layout || defaultTheme.layout
        }
        
        setThemeConfig(newTheme)
        setHasChanges(true)
        // Apply theme changes immediately in real-time
        if (onThemeChange) {
          onThemeChange(newTheme)
        }
        toast.success('Reset to template theme')
      } catch (error) {
        toast.error('Error loading template theme')
      }
    }
  }

  const handleSave = () => {
    onSave(themeConfig)
    setHasChanges(false)
    toast.success('Theme saved successfully!')
  }

  const tabs = [
    { id: 'colors', name: 'Colors', icon: SwatchIcon },
    { id: 'fonts', name: 'Fonts', icon: DocumentTextIcon },
    { id: 'layout', name: 'Layout', icon: CogIcon }
  ] as const

  // Guard against undefined themeConfig
  if (!themeConfig?.colors || !themeConfig?.fonts || !themeConfig?.layout) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading theme...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-1 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-3 border-b border-gray-200 dark:border-dark-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Theme Customizer
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              title="Save"
              className="flex items-center justify-center p-2 sm:p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </button>
            <button
              onClick={onPreview}
              title="Preview"
              className="flex items-center justify-center p-2 sm:p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-0.5 bg-gray-100 dark:bg-dark-800 p-0.5 rounded-lg overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center px-1 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex-1 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-dark-700 text-primary-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon className="h-3 w-3 flex-shrink-0" />
              <span className="ml-1 hidden sm:inline">{tab.name}</span>
              <span className="ml-1 sm:hidden">{tab.name.charAt(0)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-1 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-3 overflow-y-auto">
        {activeTab === 'colors' && (
          <div className="space-y-6">
            {/* Color Presets */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Color Presets
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="p-2 sm:p-3 border border-gray-200 dark:border-dark-600 rounded-lg hover:border-primary-300 transition-colors text-left"
                  >
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      {Object.values(preset.colors).slice(0, 3).map((color, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-200 flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {preset.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Colors */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Custom Colors
              </h3>
              
              {themeConfig?.colors && Object.entries(themeConfig.colors).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => updateColors(key as keyof ThemeConfig['colors'], e.target.value)}
                      className="w-8 h-8 sm:w-10 sm:h-8 rounded border border-gray-300 dark:border-dark-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateColors(key as keyof ThemeConfig['colors'], e.target.value)}
                      className="w-16 sm:w-20 px-2 py-1 text-xs border border-gray-300 dark:border-dark-600 rounded dark:bg-dark-700 dark:text-gray-100"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Live Preview */}
            <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Color Preview
              </h4>
              <div 
                className="h-24 sm:h-32 rounded-lg p-3 sm:p-4 flex items-center justify-center"
                style={{ 
                  backgroundColor: themeConfig?.colors?.background || '#ffffff',
                  border: `2px solid ${themeConfig?.colors?.secondary || '#f8fafc'}`
                }}
              >
                <div className="text-center">
                  <h5 
                    className="text-sm sm:text-lg font-bold mb-1 sm:mb-2"
                    style={{ 
                      color: themeConfig?.colors?.primary || '#3b82f6',
                      fontFamily: themeConfig?.fonts?.heading || 'Inter'
                    }}
                  >
                    {store.name}
                  </h5>
                  <p 
                    className="text-xs sm:text-sm mb-2 sm:mb-3"
                    style={{ color: themeConfig?.colors?.text || '#1f2937' }}
                  >
                    Sample store description
                  </p>
                  <button
                    className="px-3 sm:px-4 py-1 sm:py-2 rounded text-white text-xs sm:text-sm font-medium"
                    style={{ backgroundColor: themeConfig?.colors?.accent || '#10b981' }}
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fonts' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Font Selections */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Heading Font
                </label>
                <select
                  value={themeConfig?.fonts?.heading || 'Inter'}
                  onChange={(e) => updateFonts('heading', e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Body Font
                </label>
                <select
                  value={themeConfig?.fonts?.body || 'Inter'}
                  onChange={(e) => updateFonts('body', e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Font Preview */}
            <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Font Preview
              </h4>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h1 
                    className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100"
                    style={{ fontFamily: themeConfig?.fonts?.heading || 'Inter' }}
                  >
                    Heading Font Preview
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    {themeConfig?.fonts?.heading || 'Inter'}
                  </p>
                </div>
                <div>
                  <p 
                    className="text-sm sm:text-base text-gray-700 dark:text-gray-300"
                    style={{ fontFamily: themeConfig?.fonts?.body || 'Inter' }}
                  >
                    This is how your body text will appear throughout your store. It should be easy to read and complement your heading font choice.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {themeConfig?.fonts?.body || 'Inter'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(layoutOptions).map(([section, options]) => (
              <div key={section}>
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 capitalize">
                  {section.replace('_', ' ')} Style
                </h3>
                <div className="space-y-2">
                  {options.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-start p-2 sm:p-3 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={section}
                        value={option.value}
                        checked={themeConfig?.layout?.[section as keyof ThemeConfig['layout']] === option.value}
                        onChange={(e) => updateLayout(section as keyof ThemeConfig['layout'], e.target.value)}
                        className="mr-2 sm:mr-3 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                          {option.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 dark:border-dark-700 px-1 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={resetToDefault}
              className="flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowPathIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Reset to Default</span>
              <span className="sm:hidden">Reset</span>
            </button>
            {template && (
              <button
                onClick={resetToTemplate}
                className="flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowPathIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Reset to Template</span>
                <span className="sm:hidden">Template</span>
              </button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            {hasChanges && (
              <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                Unsaved changes
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              title="Save Theme"
              className={`flex items-center justify-center p-2 sm:p-3 font-medium rounded-lg transition-colors ${
                hasChanges
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-dark-700 dark:text-gray-400'
              }`}
            >
              <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}