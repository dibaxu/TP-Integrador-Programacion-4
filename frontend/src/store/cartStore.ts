import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '@/features/productos/types'

export interface CartItem { producto_id: number; nombre: string; precio_unitario: number; cantidad: number }
interface CartState {
  items: CartItem[]; agregar: (product: Producto) => void; quitar: (id: number) => void
  cambiarCantidad: (id: number, cantidad: number) => void; vaciar: () => void; total: () => number
}
export const useCartStore = create<CartState>()(persist((set, get) => ({
  items: [],
  agregar: (product) => set((state) => {
    const existing = state.items.find((item) => item.producto_id === product.id)
    return { items: existing ? state.items.map((item) => item.producto_id === product.id
      ? { ...item, cantidad: item.cantidad + 1, precio_unitario: product.precio_base, nombre: product.nombre } : item)
      : [...state.items, { producto_id: product.id, nombre: product.nombre, precio_unitario: product.precio_base, cantidad: 1 }] }
  }),
  quitar: (id) => set((state) => ({ items: state.items.filter((item) => item.producto_id !== id) })),
  cambiarCantidad: (id, cantidad) => { if (Number.isSafeInteger(cantidad) && cantidad >= 1)
    set((state) => ({ items: state.items.map((item) => item.producto_id === id ? { ...item, cantidad } : item) })) },
  vaciar: () => set({ items: [] }),
  total: () => get().items.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0),
}), { name: 'foodstore-cart', partialize: ({ items }) => ({ items }) }))
