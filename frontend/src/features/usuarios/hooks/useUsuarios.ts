import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usuariosApi } from '../api/usuarios'

export function useUsuarios() { return useQuery({ queryKey: ['usuarios'], queryFn: usuariosApi.list }) }
export function useEstadoUsuario() {
  const client = useQueryClient()
  return useMutation({ mutationFn: usuariosApi.state, onSuccess: () => client.invalidateQueries({ queryKey: ['usuarios'] }) })
}
