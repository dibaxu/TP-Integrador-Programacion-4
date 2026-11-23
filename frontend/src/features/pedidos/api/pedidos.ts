import { api } from '@/shared/api/axiosInstance'
import type { EstadoPedido, Pedido, PedidoCreate, PedidosPaginados, ResumenPedidos } from '../types'

export interface PedidoFiltros { skip: number; limit: number; estado?: EstadoPedido }
export const pedidosApi = {
  list: async (params: PedidoFiltros) => (await api.get<PedidosPaginados>('/pedidos', { params })).data,
  get: async (id: number) => (await api.get<Pedido>(`/pedidos/${id}`)).data,
  create: async (data: PedidoCreate) => (await api.post<Pedido>('/pedidos', data)).data,
  state: async (id: number, estado: EstadoPedido) => (await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado })).data,
  cancel: async (id: number) => (await api.patch<Pedido>(`/pedidos/${id}/cancelar`)).data,
  summary: async () => (await api.get<ResumenPedidos>('/pedidos/resumen')).data,
}
