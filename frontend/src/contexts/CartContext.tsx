"use client"

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'

interface CartItem {
  id: number
  name: string
  price: number
  comparePrice?: number
  image: string
  slug: string
  quantity: number
  storeSlug: string
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: number; storeSlug: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number; storeSlug: string } }
  | { type: 'CLEAR_CART'; payload: { storeSlug: string } }
  | { type: 'LOAD_CART'; payload: CartState }

interface CartContextType {
  state: CartState
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (id: number, storeSlug: string) => void
  updateQuantity: (id: number, quantity: number, storeSlug: string) => void
  clearCart: (storeSlug: string) => void
  getCartForStore: (storeSlug: string) => CartItem[]
  getCartTotalForStore: (storeSlug: string) => number
  getCartItemCountForStore: (storeSlug: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id && item.storeSlug === action.payload.storeSlug
      )

      if (existingItemIndex > -1) {
        // Update existing item quantity
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex].quantity += action.payload.quantity

        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

        return {
          ...state,
          items: updatedItems,
          total: newTotal,
          itemCount: newItemCount
        }
      } else {
        // Add new item
        const newItems = [...state.items, action.payload]
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

        return {
          ...state,
          items: newItems,
          total: newTotal,
          itemCount: newItemCount
        }
      }
    }

    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(
        item => !(item.id === action.payload.id && item.storeSlug === action.payload.storeSlug)
      )
      const newTotal = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = filteredItems.reduce((sum, item) => sum + item.quantity, 0)

      return {
        ...state,
        items: filteredItems,
        total: newTotal,
        itemCount: newItemCount
      }
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item => {
        if (item.id === action.payload.id && item.storeSlug === action.payload.storeSlug) {
          return { ...item, quantity: action.payload.quantity }
        }
        return item
      }).filter(item => item.quantity > 0) // Remove items with quantity 0

      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

      return {
        ...state,
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount
      }
    }

    case 'CLEAR_CART': {
      const remainingItems = state.items.filter(item => item.storeSlug !== action.payload.storeSlug)
      const newTotal = remainingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const newItemCount = remainingItems.reduce((sum, item) => sum + item.quantity, 0)

      return {
        ...state,
        items: remainingItems,
        total: newTotal,
        itemCount: newItemCount
      }
    }

    case 'LOAD_CART': {
      return action.payload
    }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: parsedCart })
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state))
  }, [state])

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity: 1 } })
    toast.success(`${item.name} added to cart!`)
  }

  const removeFromCart = (id: number, storeSlug: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, storeSlug } })
    toast.success('Item removed from cart')
  }

  const updateQuantity = (id: number, quantity: number, storeSlug: string) => {
    if (quantity <= 0) {
      removeFromCart(id, storeSlug)
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity, storeSlug } })
    }
  }

  const clearCart = (storeSlug: string) => {
    dispatch({ type: 'CLEAR_CART', payload: { storeSlug } })
    toast.success('Cart cleared')
  }

  const getCartForStore = (storeSlug: string): CartItem[] => {
    return state.items.filter(item => item.storeSlug === storeSlug)
  }

  const getCartTotalForStore = (storeSlug: string): number => {
    return getCartForStore(storeSlug).reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const getCartItemCountForStore = (storeSlug: string): number => {
    return getCartForStore(storeSlug).reduce((sum, item) => sum + item.quantity, 0)
  }

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartForStore,
    getCartTotalForStore,
    getCartItemCountForStore
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 