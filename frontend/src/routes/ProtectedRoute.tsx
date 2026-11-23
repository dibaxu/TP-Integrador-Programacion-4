import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/features/auth/types'

export function ProtectedRoute({ role }: { role?: Role }) {
  const user = useAuthStore((s) => s.usuario), checking = useAuthStore((s) => s.cargando), location = useLocation()
  if (checking) return <p role="status">Verificando sesión…</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (role && user.role !== role) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
