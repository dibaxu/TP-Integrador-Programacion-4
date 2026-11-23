import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productosApi } from '../api/productos'
import type { ProductoFiltros, ProductoInput } from '../types'

export function useProductos(filters: ProductoFiltros) {
  return useQuery({ queryKey: ['productos', filters], queryFn: () => productosApi.list(filters) })
}
export function useGuardarProducto(id?: number) {
  const client = useQueryClient()
  return useMutation({ mutationFn: (data: ProductoInput) => productosApi.save(data, id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['productos'] }) })
}
export function useEliminarProducto() {
  const client = useQueryClient()
  return useMutation({ mutationFn: productosApi.remove, onSuccess: () => client.invalidateQueries({ queryKey: ['productos'] }) })
}
export function useStock(id: number) {
  const client = useQueryClient()
  return useMutation({ mutationFn: (data: { stock: number; disponible: boolean }) => productosApi.stock(id, data),
    onSuccess: () => client.invalidateQueries({ queryKey: ['productos'] }) })
}
