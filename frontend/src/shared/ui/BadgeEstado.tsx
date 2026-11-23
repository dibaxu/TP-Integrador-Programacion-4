import type { EstadoPedido } from '@/features/pedidos/types'

const colors: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-950', EN_PREPARACION: 'bg-blue-100 text-blue-950',
  ENTREGADO: 'bg-emerald-100 text-emerald-950', CANCELADO: 'bg-rose-100 text-rose-950',
}
export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${colors[estado]}`}>{estado.replaceAll('_', ' ')}</span>
}
