import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/features/auth/api/auth'
import { queryClient } from '@/shared/api/queryClient'
import type { Usuario } from '@/features/auth/types'

interface AuthState {
  usuario: Usuario | null; cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>; checkSession: () => Promise<void>; clearSession: () => void
}
let checking: Promise<void> | null = null
let revision = 0

function clearUserQueries() {
  queryClient.removeQueries({ predicate: (query) => !['productos', 'categorias'].includes(String(query.queryKey[0])) })
}

export const useAuthStore = create<AuthState>()(persist((set, get) => ({
  usuario: null, cargando: true,
  clearSession: () => { revision++; clearUserQueries(); set({ usuario: null, cargando: false }) },
  login: async (username, password) => {
    revision++
    await authApi.login(username, password)
    const usuario = await authApi.me()
    clearUserQueries()
    set({ usuario, cargando: false })
  },
  logout: async () => { await authApi.logout(); get().clearSession() },
  checkSession: () => {
    if (checking) return checking
    const current = revision
    set({ cargando: true })
    checking = (async () => {
      try { const usuario = await authApi.me(); if (current === revision) set({ usuario }) }      
      catch { if (current === revision) set({ usuario: null }) }
      finally { if (current === revision) set({ cargando: false }); checking = null }
    })()
    return checking
  },
}), { name: 'foodstore-auth', partialize: ({ usuario }) => ({ usuario }) }))
