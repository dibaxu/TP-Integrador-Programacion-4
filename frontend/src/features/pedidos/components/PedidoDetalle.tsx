import { EstadoError, Skeleton } from '@/shared/components/Estados'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { date, money } from '@/shared/ui/format'
import { usePedido } from '../hooks/usePedidos'

export function PedidoDetalle({ id }: { id: number }) {
  const query = usePedido(id), order = query.data
  if (query.isPending) return <Skeleton />
  if (!order) return <EstadoError error={query.error} />
  return <div className="space-y-4"><EstadoError error={query.error} /><BadgeEstado estado={order.estado} />
    <dl className="space-y-2 text-sm"><div><dt className="font-bold">Fecha</dt><dd>{date(order.created_at)}</dd></div><div><dt className="font-bold">Última actualización</dt><dd>{date(order.updated_at)}</dd></div><div><dt className="font-bold">Dirección</dt><dd>{order.direccion_entrega}</dd></div><div><dt className="font-bold">Forma de pago</dt><dd>{order.forma_pago}</dd></div>{order.notas && <div><dt className="font-bold">Notas</dt><dd>{order.notas}</dd></div>}</dl>
    <div className="space-y-3 border-y border-slate-200 py-4">{order.items.map((item) => <div key={item.producto_id} className="flex justify-between gap-4"><div><p>{item.cantidad} × {item.nombre_producto}</p><p className="text-sm text-slate-500">{money(item.precio_unitario)} por unidad</p></div><span>{money(item.subtotal)}</span></div>)}</div>
    <p className="flex justify-between text-xl font-bold"><span>Total</span><span>{money(order.total)}</span></p>
  </div>
}
