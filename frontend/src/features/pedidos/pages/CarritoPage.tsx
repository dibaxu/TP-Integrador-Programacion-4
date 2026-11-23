import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { EstadoVacio } from '@/shared/components/Estados'
import { money } from '@/shared/ui/format'

export function CarritoPage() {
  const { items, quitar, cambiarCantidad, vaciar } = useCartStore()
  const total = items.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0)
  return <section className="space-y-6"><header><p className="eyebrow">TU SELECCIÓN</p><h1>Carrito</h1></header>
    {!items.length ? <><EstadoVacio text="Tu carrito está vacío. Elegí algo rico del catálogo." /><Link className="btn-primary" to="/">Ver catálogo</Link></> : <>
      <div className="space-y-3">{items.map((item) => <article key={item.producto_id} className="card flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-40 flex-1"><h2 className="font-bold">{item.nombre}</h2><p className="text-sm text-slate-600">{money(item.precio_unitario)} por unidad</p></div>
        <label className="text-sm">Cantidad<input className="input mt-1 w-24" type="number" min={1} step={1} value={item.cantidad} onChange={(e) => cambiarCantidad(item.producto_id, Number(e.target.value))} /></label>
        <strong>{money(item.precio_unitario * item.cantidad)}</strong><button className="btn-danger" onClick={() => quitar(item.producto_id)} aria-label={`Quitar ${item.nombre}`}>Quitar</button>
      </article>)}</div><div className="card space-y-4"><div className="flex justify-between text-xl font-bold"><span>Total estimado</span><span>{money(total)}</span></div>
        <p className="text-sm text-slate-600">El stock y los precios se confirman al realizar el pedido.</p><div className="flex flex-wrap gap-3"><Link className="btn-primary" to="/checkout">Continuar al checkout</Link><Link className="btn-secondary" to="/">Seguir eligiendo</Link><button className="btn-secondary" onClick={vaciar}>Vaciar carrito</button></div></div>
    </>}
  </section>
}
