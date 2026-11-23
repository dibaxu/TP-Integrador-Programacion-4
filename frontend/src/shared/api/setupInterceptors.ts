import axios from 'axios'
import { api } from './axiosInstance'
import { useAuthStore } from '@/store/authStore'

const interceptor = api.interceptors.response.use((response) => response, (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const path = (error.config?.url ?? '').replace(/\/$/, '')
    const expected = ['/auth/token', '/auth/me'].some((route) => path.endsWith(route))
    const disabled = error.response?.status === 400 && error.response.data?.detail === 'Cuenta de usuario desactivada'
    if ((!expected && error.response?.status === 401) || disabled) useAuthStore.getState().clearSession()
  }
  return Promise.reject(error)
})
if (import.meta.hot) import.meta.hot.dispose(() => api.interceptors.response.eject(interceptor))
