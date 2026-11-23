import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pedidosApi } from '../api/pedidos'
import type { PedidoFiltros } from '../api/pedidos'
import type { EstadoPedido, PedidoCreate } from '../types'

export function usePedidos(filters: PedidoFiltros) {
  return useQuery({ queryKey: ['pedidos', filters], queryFn: () => pedidosApi.list(filters) })
}
export function usePedido(id: number) { return useQuery({ queryKey: ['pedidos', 'detalle', id], queryFn: () => pedidosApi.get(id) }) }
export function useResumenPedidos() { return useQuery({ queryKey: ['resumen'], queryFn: pedidosApi.summary }) }
function useInvalidarPedidos() {
  const client = useQueryClient()
  return () => Promise.all(['pedidos', 'productos', 'resumen'].map((key) => client.invalidateQueries({ queryKey: [key] })))
}
export function useCrearPedido() {
  const invalidate = useInvalidarPedidos()
  return useMutation({ mutationFn: (data: PedidoCreate) => pedidosApi.create(data), onSuccess: invalidate })
}
export function useCambiarEstadoPedido() {
  const invalidate = useInvalidarPedidos()
  return useMutation({ mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => pedidosApi.state(id, estado), onSuccess: invalidate })
}
export function useCancelarPedido() {
  const invalidate = useInvalidarPedidos()
  return useMutation({ mutationFn: pedidosApi.cancel, onSuccess: invalidate })
}
