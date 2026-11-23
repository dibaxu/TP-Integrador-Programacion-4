import { api } from '@/shared/api/axiosInstance'
import type { Producto, ProductoFiltros, ProductoInput, ProductosPaginados } from '../types'

export const productosApi = {
  list: async (params: ProductoFiltros) => (await api.get<ProductosPaginados>('/productos', { params })).data,
  save: async (data: ProductoInput, id?: number) => id === undefined
    ? (await api.post<Producto>('/productos', data)).data : (await api.put<Producto>(`/productos/${id}`, data)).data,
  stock: async (id: number, data: { stock: number; disponible: boolean }) => (await api.patch<Producto>(`/productos/${id}/stock`, data)).data,
  remove: async (id: number) => { await api.delete(`/productos/${id}`) },
}
