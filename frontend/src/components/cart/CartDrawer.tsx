"use client"

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { XMarkIcon, TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  storeSlug: string
  theme?: {
    colors?: {
      primary?: string
      accent?: string
    }
  }
}

export function CartDrawer({ isOpen, onClose, storeSlug, theme }: CartDrawerProps) {
  const { getCartForStore, getCartTotalForStore, removeFromCart, updateQuantity } = useCart()
  const cartItems = getCartForStore(storeSlug)
  const cartTotal = getCartTotalForStore(storeSlug)

  const primaryColor = theme?.colors?.primary || '#3b82f6'
  const accentColor = theme?.colors?.accent || '#f59e0b'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">Your cart is empty</p>
                <p className="text-sm text-gray-400">Add some products to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.storeSlug}`} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" fill="%23f3f4f6"/%3E%3Ctext x="32" y="32" text-anchor="middle" fill="%236b7280" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.storeSlug)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="text-sm text-gray-900 w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.storeSlug)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id, item.storeSlug)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-semibold text-gray-900">${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="space-y-2">
                <Link
                  href={`/stores/${storeSlug}/checkout`}
                  className="w-full block text-center py-3 px-4 rounded-lg font-semibold text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: accentColor }}
                  onClick={onClose}
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  href={`/stores/${storeSlug}/pages/home`}
                  className="w-full block text-center py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium transition-colors hover:bg-gray-50"
                  onClick={onClose}
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 