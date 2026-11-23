import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { EstadoError, EstadoVacio } from '@/shared/components/Estados'
import Campo from '@/shared/ui/Campo'
import { money } from '@/shared/ui/format'
import { useCrearPedido } from '../hooks/usePedidos'
import type { FormaPago } from '../types'

export function CheckoutPage() {
  const { items, vaciar } = useCartStore(), create = useCrearPedido(), navigate = useNavigate()
  const form = useForm({ defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: async ({ value }) => {
      try { await create.mutateAsync({ ...value, items: items.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })) }); vaciar(); navigate('/mis-pedidos') }
      catch { /* El carrito se conserva y el error se muestra debajo. */ }
    } })
  if (!items.length) return <><EstadoVacio text="Agregá productos antes de confirmar un pedido." /><Link to="/" className="btn-primary mt-4">Ver catálogo</Link></>
  return <section className="mx-auto max-w-2xl space-y-6"><header><p className="eyebrow">ÚLTIMO PASO</p><h1>Confirmá tu pedido</h1></header>
    <div className="card space-y-3">{items.map((item) => <div className="flex justify-between gap-3" key={item.producto_id}><span>{item.cantidad} × {item.nombre}</span><span>{money(item.precio_unitario * item.cantidad)}</span></div>)}<p className="border-t border-slate-200 pt-3 font-bold">Total estimado: {money(items.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0))}</p></div>
    <form className="card space-y-5" onSubmit={(e) => { e.preventDefault(); void form.handleSubmit() }}><EstadoError error={create.error} />
      <form.Field name="direccion_entrega" validators={{ onChange: ({ value }) => value.trim().length >= 5 && value.trim().length <= 200 ? undefined : 'Ingresá una dirección de 5 a 200 caracteres.' }}>{(field) =>
        <Campo etiqueta="Dirección de entrega" error={field.state.meta.errors[0]}>{(props) => <input {...props} className="input" autoComplete="street-address" placeholder="Calle, número, piso y departamento" required minLength={5} maxLength={200} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}</Campo>}</form.Field>
      <form.Field name="forma_pago">{(field) => <Campo etiqueta="Forma de pago">{(props) => <select {...props} className="input" value={field.state.value} onChange={(e) => field.handleChange(e.target.value as FormaPago)}><option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option></select>}</Campo>}</form.Field>
      <p className="text-sm text-slate-600">El pago se coordina con el negocio. Esta aplicación registra la forma elegida y no procesa cobros.</p>
      <form.Field name="notas">{(field) => <Campo etiqueta="Notas (opcional)">{(props) => <textarea {...props} className="input" rows={3} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}</Campo>}</form.Field>
      <button className="btn-primary w-full" disabled={create.isPending}>{create.isPending ? 'Confirmando…' : 'Confirmar pedido'}</button>
    </form>
  </section>
}
