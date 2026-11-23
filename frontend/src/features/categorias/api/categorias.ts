import { api } from '@/shared/api/axiosInstance'
import type { Categoria, CategoriaInput } from '../types'

export const categoriasApi = {
  list: async () => (await api.get<Categoria[]>('/categorias')).data,
  save: async (data: CategoriaInput, id?: number) => id === undefined
    ? (await api.post<Categoria>('/categorias', data)).data : (await api.put<Categoria>(`/categorias/${id}`, data)).data,
  remove: async (id: number) => { await api.delete(`/categorias/${id}`) },
}
