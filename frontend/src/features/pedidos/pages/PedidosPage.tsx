import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { EstadoError, Skeleton } from '@/shared/components/Estados'
import { Tabla } from '@/shared/components/Tabla'
import { Paginacion } from '@/shared/components/Paginacion'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Modal } from '@/shared/ui/Modal'
import { date, money } from '@/shared/ui/format'
import { useAuthStore } from '@/store/authStore'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { usePedidos, useCambiarEstadoPedido, useCancelarPedido } from '../hooks/usePedidos'
import { estados } from '../types'
import type { EstadoPedido, Pedido } from '../types'

export function PedidosPage({ admin = false }: { admin?: boolean }) {
  const [page, setPage] = useState(0), [filter, setFilter] = useState<EstadoPedido | ''>(''), [detail, setDetail] = useState<number>()
  const user = useAuthStore((s) => s.usuario)
  const query = usePedidos({ skip: page * 100, limit: 100, estado: filter || undefined }), change = useCambiarEstadoPedido(), cancel = useCancelarPedido()
  const busy = change.isPending || cancel.isPending
  const columns: ColumnDef<Pedido>[] = [
    { accessorKey: 'id', header: 'Pedido', cell: ({ row }) => `#${row.original.id}` },
    { accessorKey: 'created_at', header: 'Fecha', cell: ({ row }) => date(row.original.created_at) },
    ...(admin ? [{ accessorKey: 'usuario_id', header: 'Usuario ID' } as ColumnDef<Pedido>] : []),
    { accessorKey: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
    { accessorKey: 'total', header: 'Total', cell: ({ row }) => money(row.original.total) },
    { id: 'acciones', header: 'Acciones', cell: ({ row }) => <div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={() => setDetail(row.original.id)}>Ver detalle</button>
      {admin && ['PENDIENTE', 'EN_PREPARACION'].includes(row.original.estado) && <button className="btn-primary" disabled={busy} onClick={() => change.mutate({ id: row.original.id, estado: row.original.estado === 'PENDIENTE' ? 'EN_PREPARACION' : 'ENTREGADO' })}>{row.original.estado === 'PENDIENTE' ? 'Preparar' : 'Entregar'}</button>}
      {((admin && ['PENDIENTE', 'EN_PREPARACION'].includes(row.original.estado)) || (!admin && row.original.usuario_id === user?.id && row.original.estado === 'PENDIENTE')) &&
        <button className="btn-danger" disabled={busy} onClick={() => { if (confirm(`¿Cancelar el pedido #${row.original.id}?`)) {
          if (admin) change.mutate({ id: row.original.id, estado: 'CANCELADO' }); else cancel.mutate(row.original.id)
        } }}>Cancelar pedido</button>}</div> },
  ]
  return <section className="space-y-5"><header className="page-header"><div><p className="eyebrow">{admin ? 'ADMINISTRACIÓN' : 'TUS COMPRAS'}</p><h1>{admin ? 'Gestión de pedidos' : 'Mis pedidos'}</h1></div>
    {admin && <label className="text-sm font-semibold">Filtrar por estado<select className="input mt-1" value={filter} onChange={(e) => { setFilter(e.target.value as EstadoPedido | ''); setPage(0) }}><option value="">Todos</option>{estados.map((estado) => <option key={estado} value={estado}>{estado.replaceAll('_', ' ')}</option>)}</select></label>}</header>
    <EstadoError error={query.error ?? change.error ?? cancel.error} />{query.isPending ? <Skeleton /> : <Tabla rows={query.data?.items ?? []} columns={columns} />}
    {(query.data?.total ?? 0) > 100 && <Paginacion page={page} total={query.data?.total ?? 0} limit={100} change={setPage} />}
    {detail !== undefined && <Modal title={`Pedido #${detail}`} close={() => setDetail(undefined)}><PedidoDetalle id={detail} /></Modal>}
  </section>
}
