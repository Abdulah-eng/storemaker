"use client"

import { DashboardLayout } from './dashboard-layout'
import { StoreNav } from './store-nav'

interface StoreLayoutProps {
  children: React.ReactNode
  storeId: number
  storeName?: string
}

export function StoreLayout({ children, storeId, storeName }: StoreLayoutProps) {
  return (
    <DashboardLayout>
      <StoreNav storeId={storeId} storeName={storeName} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </DashboardLayout>
  )
}