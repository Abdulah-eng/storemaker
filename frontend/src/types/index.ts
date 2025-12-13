// User types
export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'merchant' | 'customer'
  is_active: boolean
  created_at: string
}

export interface UserRegistrationData {
  email: string
  password: string
  first_name: string
  last_name: string
}

export interface UserLoginData {
  email: string
  password: string
}

export interface AuthResponse {
  message: string
  user: User
  access_token: string
  refresh_token: string
}

// Store types
export interface Store {
  id: number
  name: string
  slug: string
  description: string
  logo: string
  favicon: string
  domain: string
  subdomain: string
  status: 'active' | 'inactive' | 'draft'
  owner_id: number
  template_id?: number
  created_at: string
  updated_at: string
}

export interface StoreCreateData {
  name: string
  description?: string
  template_id?: number
}

export interface StoreUpdateData {
  name?: string
  description?: string
  logo?: string
  favicon?: string
  domain?: string
  status?: 'active' | 'inactive' | 'draft'
}

// Template types
export interface Template {
  id: number
  name: string
  description: string
  category: 'fashion' | 'electronics' | 'food' | 'beauty' | 'home' | 'general'
  preview_url: string
  thumbnail_url: string
  config: Record<string, any>
  is_active: boolean
  is_premium: boolean
  created_at: string
  updated_at: string
}

export interface TemplateCreateData {
  name: string
  description: string
  category: Template['category']
  preview_url: string
  thumbnail_url: string
  config: Record<string, any>
  is_premium: boolean
}

// Product types
export interface ProductVariant {
  id: string
  name: string
  price: number
  sku: string
  stock: number
  options: Record<string, string>
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  compare_price?: number
  sku: string
  images: string[]
  variants: ProductVariant[]
  status: 'active' | 'inactive' | 'draft'
  stock: number
  weight?: number
  is_digital: boolean
  seo_title: string
  seo_description: string
  store_id: number
  category_id?: number
  created_at: string
  updated_at: string
}

export interface ProductCreateData {
  name: string
  description: string
  short_description: string
  price: number
  compare_price?: number
  sku: string
  images: string[]
  variants: ProductVariant[]
  stock: number
  weight?: number
  is_digital: boolean
  seo_title: string
  seo_description: string
  category_id?: number
}

// Category types
export interface Category {
  id: number
  name: string
  slug: string
  description: string
  image: string
  parent_id?: number
  store_id: number
  created_at: string
  updated_at: string
}

// Order types
export interface ShippingAddress {
  first_name: string
  last_name: string
  company: string
  address1: string
  address2: string
  city: string
  province: string
  country: string
  postal_code: string
  phone: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  variant_id: string
  quantity: number
  price: number
  product_title: string
  product_sku: string
}

export interface Order {
  id: number
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  customer_email: string
  customer_id?: number
  store_id: number
  subtotal_price: number
  tax_price: number
  shipping_price: number
  total_price: number
  currency: string
  shipping_address: ShippingAddress
  billing_address: ShippingAddress
  notes: string
  order_items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderCreateData {
  customer_email: string
  shipping_address: ShippingAddress
  billing_address: ShippingAddress
  items: Array<{
    product_id: number
    variant_id: string
    quantity: number
  }>
  notes: string
}

// Customization types
export interface StoreSettings {
  id: number
  store_id: number
  currency: string
  language: string
  timezone: string
  allow_guest_checkout: boolean
  require_shipping: boolean
  tax_included: boolean
  tax_rate: number
  shipping_rate: number
  free_shipping_min: number
  order_prefix: string
}

export interface StoreTheme {
  id: number
  store_id: number
  colors: Record<string, string>
  fonts: Record<string, string>
  logo_url: string
  favicon_url: string
  header_style: string
  footer_style: string
  button_style: string
  custom_css: string
}

export interface Page {
  id: number
  title: string
  slug: string
  content: string
  type: 'home' | 'about' | 'contact' | 'privacy' | 'terms' | 'custom'
  is_published: boolean
  seo_title: string
  seo_description: string
  store_id: number
  sections: Section[]
  created_at: string
  updated_at: string
}

export interface Section {
  id: number
  name: string
  type: 'hero' | 'features' | 'products' | 'text' | 'image' | 'video' | 'testimonials' | 'faq' | 'contact'
  config: Record<string, any>
  order: number
  is_visible: boolean
  page_id: number
  components: Component[]
  created_at: string
  updated_at: string
}

export interface Component {
  id: number
  name: string
  type: 'text' | 'image' | 'button' | 'form' | 'list' | 'card'
  config: Record<string, any>
  order: number
  is_visible: boolean
  section_id: number
  created_at: string
  updated_at: string
}

// API response types
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Form types
export interface FormErrors {
  [key: string]: string | undefined
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system'

// Page types
export type PageType = 'home' | 'about' | 'contact' | 'privacy' | 'terms' | 'custom'

export interface PageCreateData {
  title: string
  slug?: string
  content: string
  type: PageType
  is_published?: boolean
  seo_title?: string
  seo_description?: string
}

// Component types for store builder
export interface PageComponent {
  id: string
  type: string
  props: Record<string, unknown>
  order: number
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
  layout?: {
    header: string
    hero: string
    product_grid: string
    footer: string
  }
}