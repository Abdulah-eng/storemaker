import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { toast } from 'react-hot-toast'

// Types

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = this.getRefreshToken()
            if (refreshToken) {
              const response = await this.refreshAccessToken(refreshToken)
              const newToken = response.data.access_token
              this.setAccessToken(newToken)
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              return this.client(originalRequest)
            }
                  } catch {
          this.clearTokens()
          // Redirect to login or show login modal
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
        }
        }

        // Show error toast for non-401 errors
        if (error.response?.data?.error) {
          toast.error(error.response.data.error)
        } else if (error.message) {
          toast.error(error.message)
        }

        return Promise.reject(error)
      }
    )
  }

  // Token management
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refresh_token')
  }

  private setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
    }
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token)
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken)
    this.setRefreshToken(refreshToken)
  }

  private async refreshAccessToken(refreshToken: string) {
    return this.client.post('/auth/refresh', { refresh_token: refreshToken })
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config)
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config)
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config)
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config)
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config)
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.post('/auth/login', { email, password })
    const data = response.data as { access_token?: string; refresh_token?: string }
    if (data.access_token && data.refresh_token) {
      this.setTokens(data.access_token, data.refresh_token)
    }
    return response
  }

  async register(userData: {
    email: string
    password: string
    first_name: string
    last_name: string
  }) {
    const response = await this.post('/auth/register', userData)
    const data = response.data as { access_token?: string; refresh_token?: string }
    if (data.access_token && data.refresh_token) {
      this.setTokens(data.access_token, data.refresh_token)
    }
    return response
  }

  async logout() {
    this.clearTokens()
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  // Get current user info from token
  getCurrentUser() {
    const token = this.getAccessToken()
    if (!token) return null

    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]))
      return {
        id: payload.user_id,
        email: payload.email,
        role: payload.role,
      }
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient()
export default apiClient

// Export specific API functions for easier use
export const api = {
  // Auth
  login: (email: string, password: string) => apiClient.login(email, password),
  register: (userData: { email: string; password: string; first_name: string; last_name: string }) => apiClient.register(userData),
  logout: () => apiClient.logout(),
  isAuthenticated: () => apiClient.isAuthenticated(),
  getCurrentUser: () => apiClient.getCurrentUser(),

  // Users
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data: Record<string, unknown>) => apiClient.put('/user/profile', data),

  // Stores (public access by slug)
  getStoreBySlug: (slug: string) => apiClient.get(`/stores/${slug}`),
  
  // Store Management (authenticated, by ID)
  getStores: () => apiClient.get('/manage/stores'),
  createStore: (data: Record<string, unknown>) => apiClient.post('/manage/stores', data),
  createStoreWithAI: (data: Record<string, unknown>) => apiClient.post('/manage/stores/ai', data),
  getUserStores: () => apiClient.get('/manage/stores'),
  getStore: (id: string) => apiClient.get(`/manage/stores/${id}`),
  updateStore: (id: string, data: Record<string, unknown>) => apiClient.put(`/manage/stores/${id}`, data),
  deleteStore: (id: string) => apiClient.delete(`/manage/stores/${id}`),
  uploadStoreLogo: async (storeId: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post(`/manage/stores/${storeId}/logo`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  uploadStoreFavicon: async (storeId: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post(`/manage/stores/${storeId}/favicon`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },

  // Templates
  getTemplates: () => apiClient.get('/templates'),
  getTemplate: (id: number) => apiClient.get(`/templates/${id}`),

  // Products (management)
  getProducts: (storeId: number) => apiClient.get(`/manage/stores/${storeId}/products`),
  createProduct: (storeId: number, data: Record<string, unknown>) => apiClient.post(`/manage/stores/${storeId}/products`, data),
  updateProduct: (storeId: number, productId: number, data: Record<string, unknown>) => 
    apiClient.put(`/manage/stores/${storeId}/products/${productId}`, data),
  deleteProduct: (storeId: number, productId: number) => 
    apiClient.delete(`/manage/stores/${storeId}/products/${productId}`),

  // Products (public, by store slug)
  getStoreProducts: (storeSlug: string) => apiClient.get(`/stores/${storeSlug}/products`),
  getStoreProduct: (storeSlug: string, productSlug: string) => 
    apiClient.get(`/stores/${storeSlug}/products/${productSlug}`),

  // Orders (management)
  getOrders: (storeId: number) => apiClient.get(`/manage/stores/${storeId}/orders`),
  updateOrder: (storeId: number, orderId: number, data: Record<string, unknown>) => 
    apiClient.put(`/manage/stores/${storeId}/orders/${orderId}`, data),

  // Orders (public, for creating orders)
  createOrder: (storeSlug: string, data: Record<string, unknown>) => apiClient.post(`/stores/${storeSlug}/orders`, data),
  getOrderByNumber: (orderNumber: string) => apiClient.get(`/orders/${orderNumber}`),

  // Newsletter subscriptions
  subscribeToNewsletter: (storeSlug: string, email: string) => 
    apiClient.post(`/stores/${storeSlug}/newsletter/subscribe`, { email }),
  unsubscribeFromNewsletter: (storeSlug: string, email: string) => 
    apiClient.get(`/stores/${storeSlug}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`),

  // Store Customization (management)
  getStoreSettings: (storeId: number) => apiClient.get(`/manage/stores/${storeId}/settings`),
  updateStoreSettings: (storeId: number, data: Record<string, unknown>) => apiClient.put(`/manage/stores/${storeId}/settings`, data),
  getStoreTheme: (storeId: number) => apiClient.get(`/manage/stores/${storeId}/theme`),
  updateStoreTheme: (storeId: number, data: Record<string, unknown>) => apiClient.put(`/manage/stores/${storeId}/theme`, data),
  
  // Store Layout (management)
  	getStoreLayout: (storeId: number) => apiClient.get(`/manage/stores/${storeId}/layout`),
	getPublicStoreLayout: (storeSlug: string) => apiClient.get(`/stores/${storeSlug}/layout`),
	saveStoreLayout: (storeId: number, data: Record<string, unknown>) => apiClient.post(`/manage/stores/${storeId}/layout`, data),

  // Pages (management)
  getPages: (storeId: number) => apiClient.get(`/manage/stores/${storeId}/pages`),
  createPage: (storeId: number, data: Record<string, unknown>) => apiClient.post(`/manage/stores/${storeId}/pages`, data),
  updatePage: (storeId: number, pageId: number, data: Record<string, unknown>) => 
    apiClient.put(`/manage/stores/${storeId}/pages/${pageId}`, data),
  deletePage: (storeId: number, pageId: number) => 
    apiClient.delete(`/manage/stores/${storeId}/pages/${pageId}`),
    
  // Page layouts
  getPageLayout: (storeId: number, pageId: number) => apiClient.get(`/manage/stores/${storeId}/pages/${pageId}/layout`),
  savePageLayout: (storeId: number, pageId: number, data: Record<string, unknown>) => 
    apiClient.post(`/manage/stores/${storeId}/pages/${pageId}/layout`, data),
    
  // Public page layout (for rendering pages)
  getPublicPageLayout: (storeSlug: string, pageSlug: string) => apiClient.get(`/stores/${storeSlug}/pages/${pageSlug}/layout`),
    
  // Pages (public, by store slug)
  getStorePages: (storeSlug: string) => apiClient.get(`/stores/${storeSlug}/pages`),
  getStorePage: (storeSlug: string, pageSlug: string) => 
    apiClient.get(`/stores/${storeSlug}/pages/${pageSlug}`),

  // Admin API
  admin: {
    // Templates
    getAllTemplates: () => apiClient.get('/admin/templates'),
    getTemplate: (id: number) => apiClient.get(`/admin/templates/${id}`),
    createTemplate: (data: Record<string, unknown>) => apiClient.post('/admin/templates', data),
    updateTemplate: (id: number, data: Record<string, unknown>) => apiClient.put(`/admin/templates/${id}`, data),
    deleteTemplate: (id: number) => apiClient.delete(`/admin/templates/${id}`),

    // Stores
    getAllStores: () => apiClient.get('/admin/stores'),
    updateStoreStatus: (id: number, status: string) => apiClient.put(`/admin/stores/${id}/status`, { status }),

    // Analytics
    getSystemAnalytics: () => apiClient.get('/admin/analytics'),
  },
}