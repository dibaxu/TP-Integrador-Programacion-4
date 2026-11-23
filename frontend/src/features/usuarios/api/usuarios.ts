import { api } from '@/shared/api/axiosInstance'
import type { Usuario } from '@/features/auth/types'

export const usuariosApi = {
  list: async () => (await api.get<Usuario[]>('/admin/usuarios')).data,
  state: async (user: Usuario) => (await api.post<Usuario>(`/admin/usuarios/${user.id}/${user.disabled ? 'activar' : 'desactivar'}`)).data,
}
