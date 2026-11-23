import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { EstadoError } from '@/shared/components/Estados'

const adminLinks = [['/admin/resumen', 'Resumen'], ['/admin/categorias', 'Categorías'], ['/admin/productos', 'Productos'], ['/admin/pedidos', 'Pedidos'], ['/admin/usuarios', 'Usuarios']]

export function MainLayout() {
  const user = useAuthStore((s) => s.usuario), logout = useAuthStore((s) => s.logout)
  const checking = useAuthStore((s) => s.cargando)
  const quantity = useCartStore((s) => s.items.reduce((sum, item) => sum + item.cantidad, 0))
  const [error, setError] = useState<unknown>(null), [busy, setBusy] = useState(false), navigate = useNavigate()
  return <><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
    <Link to="/" className="text-2xl font-black tracking-tight text-emerald-950">Food Store<span className="text-emerald-600">.</span></Link>
    <nav aria-label="Principal" className="flex flex-wrap items-center gap-4 text-sm font-semibold"><NavLink to="/">Catálogo</NavLink><NavLink to="/carrito">Carrito ({quantity})</NavLink>
      {!checking && user ? <><NavLink to="/mis-pedidos">Mis pedidos</NavLink>{user.role === 'admin' && <NavLink to="/admin/resumen">Panel admin</NavLink>}
        <span className="text-slate-500">{user.full_name} · {user.role}</span><button className="btn-secondary" disabled={busy} onClick={async () => { setBusy(true); setError(null); try { await logout(); navigate('/login') } catch (e) { setError(e) } finally { setBusy(false) } }}>Cerrar sesión</button></>
        : !checking ? <><NavLink to="/login">Ingresar</NavLink><Link className="btn-primary" to="/register">Crear cuenta</Link></> : <span>Verificando sesión…</span>}
    </nav></div></header>
    <main className="mx-auto min-h-[75vh] max-w-6xl px-5 py-8"><EstadoError error={error} /><Outlet /></main>
    <footer className="mx-auto max-w-6xl border-t border-slate-200 px-5 py-6 text-sm text-slate-500">Food Store · Programación IV · Pedro Sota</footer>
  </>
}

export function AdminLayout() {
  return <div className="space-y-7"><nav aria-label="Administración" className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2">
    {adminLinks.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => `rounded-lg px-4 py-2 text-sm font-semibold ${isActive ? 'bg-emerald-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</NavLink>)}
  </nav><Outlet /></div>
}
