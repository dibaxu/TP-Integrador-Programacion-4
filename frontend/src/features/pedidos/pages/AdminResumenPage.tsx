import { EstadoError, Skeleton } from '@/shared/components/Estados'
import { money } from '@/shared/ui/format'
import { useResumenPedidos } from '../hooks/usePedidos'

export function AdminResumenPage() {
  const query = useResumenPedidos(), data = query.data
  const cards = data ? [ ['Pendientes', data.pendientes], ['En preparación', data.en_preparacion], ['Entregados', data.entregados],
    ['Cancelados', data.cancelados], ['Pedidos de hoy (UTC)', data.pedidos_hoy], ['Ingresos de pedidos entregados', money(data.ingresos_entregados)] ] : []
  return <section className="space-y-6"><header><p className="eyebrow">ADMINISTRACIÓN</p><h1>Resumen del negocio</h1><p className="mt-2 text-slate-600">El estado de los pedidos, en un solo lugar.</p></header>
    <EstadoError error={query.error} />{query.isPending ? <Skeleton /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label, value]) => <article className="card" key={label}><h2 className="text-sm font-semibold text-slate-600">{label}</h2><p className="mt-4 text-3xl font-bold text-emerald-950">{value}</p></article>)}</div>}
  </section>
}
