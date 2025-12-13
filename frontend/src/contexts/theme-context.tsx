"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif'
  },
  layout: {
    header: 'modern',
    hero: 'full-width',
    product_grid: '3-column',
    footer: 'minimal'
  }
}

interface ThemeContextType {
  theme: ThemeConfig
  updateTheme: (newTheme: Partial<ThemeConfig>) => void
  setTheme: (theme: ThemeConfig) => void
  resetTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: ThemeConfig
}

export function StoreThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeConfig>(initialTheme || defaultTheme)

  // Apply theme CSS variables to document root
  useEffect(() => {
    const root = document.documentElement
    
    // Apply color variables
    root.style.setProperty('--color-primary', theme.colors.primary)
    root.style.setProperty('--color-secondary', theme.colors.secondary)
    root.style.setProperty('--color-accent', theme.colors.accent)
    root.style.setProperty('--color-text', theme.colors.text)
    root.style.setProperty('--color-background', theme.colors.background)
    
    // Apply font variables
    root.style.setProperty('--font-heading', theme.fonts.heading)
    root.style.setProperty('--font-body', theme.fonts.body)
    
    // Apply theme class to body for conditional styling
    document.body.setAttribute('data-theme-primary', theme.colors.primary)
    document.body.setAttribute('data-theme-accent', theme.colors.accent)
  }, [theme])

  const updateTheme = (newTheme: Partial<ThemeConfig>) => {
    setThemeState(prev => ({
      ...prev,
      ...newTheme,
      colors: { ...prev.colors, ...(newTheme.colors || {}) },
      fonts: { ...prev.fonts, ...(newTheme.fonts || {}) },
      layout: { ...prev.layout, ...(newTheme.layout || {}) }
    }))
  }

  const setTheme = (newTheme: ThemeConfig) => {
    setThemeState(newTheme)
  }

  const resetTheme = () => {
    setThemeState(defaultTheme)
  }

  const value: ThemeContextType = {
    theme,
    updateTheme,
    setTheme,
    resetTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Utility function to apply theme styles to components
export function getThemeStyles(theme: ThemeConfig) {
  return {
    primary: { color: theme.colors.primary },
    secondary: { backgroundColor: theme.colors.secondary },
    accent: { backgroundColor: theme.colors.accent, color: '#ffffff' },
    text: { color: theme.colors.text },
    background: { backgroundColor: theme.colors.background },
    headingFont: { fontFamily: theme.fonts.heading },
    bodyFont: { fontFamily: theme.fonts.body }
  }
}

// CSS-in-JS utility for theme styles
export function createThemeCSS(theme: ThemeConfig): string {
  return `
    :root {
      --theme-primary: ${theme.colors.primary};
      --theme-secondary: ${theme.colors.secondary};
      --theme-accent: ${theme.colors.accent};
      --theme-text: ${theme.colors.text};
      --theme-background: ${theme.colors.background};
      --theme-font-heading: ${theme.fonts.heading};
      --theme-font-body: ${theme.fonts.body};
    }
    
    .theme-primary { color: var(--theme-primary) !important; }
    .theme-secondary { background-color: var(--theme-secondary) !important; }
    .theme-accent { background-color: var(--theme-accent) !important; color: white !important; }
    .theme-text { color: var(--theme-text) !important; }
    .theme-background { background-color: var(--theme-background) !important; }
    .theme-font-heading { font-family: var(--theme-font-heading) !important; }
    .theme-font-body { font-family: var(--theme-font-body) !important; }
  `
}