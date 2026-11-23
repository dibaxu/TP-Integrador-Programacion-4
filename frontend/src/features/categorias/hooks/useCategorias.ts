import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriasApi } from '../api/categorias'
import type { CategoriaInput } from '../types'

export function useCategorias() { return useQuery({ queryKey: ['categorias'], queryFn: categoriasApi.list }) }
export function useGuardarCategoria(id?: number) {
  const client = useQueryClient()
  return useMutation({ mutationFn: (data: CategoriaInput) => categoriasApi.save(data, id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['categorias'] }) })
}
export function useEliminarCategoria() {
  const client = useQueryClient()
  return useMutation({ mutationFn: categoriasApi.remove, onSuccess: async () => {
    await Promise.all([client.invalidateQueries({ queryKey: ['categorias'] }), client.invalidateQueries({ queryKey: ['productos'] })])
  } })
}
