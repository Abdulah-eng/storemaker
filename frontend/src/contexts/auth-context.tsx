"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types'
import { api } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<any>
  register: (userData: any) => Promise<any>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      try {
        if (api.isAuthenticated()) {
          const currentUser = api.getCurrentUser()
          if (currentUser) {
            setUser({
              id: currentUser.id,
              email: currentUser.email,
              first_name: '',
              last_name: '',
              role: currentUser.role,
              is_active: true,
              created_at: '',
            })
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        api.logout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password)
      setUser((response.data as any).user)
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: any) => {
    try {
      const response = await api.register(userData)
      setUser((response.data as any).user)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    api.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const response = await api.getProfile()
      setUser(response.data as any)
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}