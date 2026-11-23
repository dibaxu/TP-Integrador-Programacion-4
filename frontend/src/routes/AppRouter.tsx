import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { MainLayout, AdminLayout } from '@/shared/layout/MainLayout'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import { CatalogoPage } from '@/features/productos/pages/CatalogoPage'
import { AdminProductosPage } from '@/features/productos/pages/AdminProductosPage'
import { AdminCategoriasPage } from '@/features/categorias/pages/AdminCategoriasPage'
import { CarritoPage } from '@/features/pedidos/pages/CarritoPage'
import { CheckoutPage } from '@/features/pedidos/pages/CheckoutPage'
import { PedidosPage } from '@/features/pedidos/pages/PedidosPage'
import { AdminResumenPage } from '@/features/pedidos/pages/AdminResumenPage'
import { AdminUsuariosPage } from '@/features/usuarios/pages/AdminUsuariosPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return <BrowserRouter><Routes><Route element={<MainLayout />}>
    <Route index element={<CatalogoPage />} />
    <Route path="login" element={<AuthPage key="login" />} /><Route path="register" element={<AuthPage register key="register" />} />
    <Route path="carrito" element={<CarritoPage />} />
    <Route path="unauthorized" element={<section className="card space-y-4"><h1>Acceso denegado</h1><p>Tu cuenta no tiene permiso para abrir esta página.</p><Link to="/" className="btn-primary">Volver al inicio</Link></section>} />
    <Route element={<ProtectedRoute />}><Route path="checkout" element={<CheckoutPage />} /><Route path="mis-pedidos" element={<PedidosPage />} /></Route>
    <Route element={<ProtectedRoute role="admin" />}><Route path="admin" element={<AdminLayout />}>
      <Route path="resumen" element={<AdminResumenPage />} /><Route path="categorias" element={<AdminCategoriasPage />} />
      <Route path="productos" element={<AdminProductosPage />} /><Route path="pedidos" element={<PedidosPage admin />} /><Route path="usuarios" element={<AdminUsuariosPage />} />
    </Route></Route>
    <Route path="*" element={<section className="card space-y-4"><h1>Página no encontrada</h1><Link to="/" className="btn-primary">Volver al inicio</Link></section>} />
  </Route></Routes></BrowserRouter>
}
