import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Tabla } from '@/shared/components/Tabla'
import { EstadoError, Skeleton } from '@/shared/components/Estados'
import { Modal } from '@/shared/ui/Modal'
import { money } from '@/shared/ui/format'
import { ProductoForm, StockForm } from '../components/ProductoForm'
import { useProductos, useEliminarProducto } from '../hooks/useProductos'
import type { Producto } from '../types'

export function AdminProductosPage() {
  const query = useProductos({ skip: 0, limit: 100 }), remove = useEliminarProducto()
  const [selected, select] = useState<Producto | null | undefined>(undefined), [stock, setStock] = useState<Producto>()
  const columns: ColumnDef<Producto>[] = [
    { accessorKey: 'nombre', header: 'Producto' }, { accessorKey: 'categoria.nombre', header: 'Categoría' },
    { accessorKey: 'precio_base', header: 'Precio', cell: ({ row }) => money(row.original.precio_base) },
    { accessorKey: 'stock', header: 'Stock' }, { accessorKey: 'disponible', header: 'Disponible', cell: ({ row }) => row.original.disponible ? 'Sí' : 'No' },
    { id: 'acciones', header: 'Acciones', cell: ({ row }) => <div className="flex flex-wrap gap-2">
      <button className="btn-secondary" onClick={() => select(row.original)}>Editar</button><button className="btn-secondary" onClick={() => setStock(row.original)}>Stock</button>
      <button className="btn-danger" disabled={remove.isPending} onClick={() => { if (confirm(`¿Dar de baja «${row.original.nombre}»?`)) remove.mutate(row.original.id) }}>Dar de baja</button></div> },
  ]
  return <section className="space-y-5"><header className="page-header"><div><p className="eyebrow">ADMINISTRACIÓN</p><h1>Productos</h1></div><button className="btn-primary" onClick={() => select(null)}>Nuevo producto</button></header>
    <EstadoError error={query.error ?? remove.error} />{query.isPending ? <Skeleton /> : <Tabla rows={query.data?.items ?? []} columns={columns} />}
    {(query.data?.total ?? 0) > 100 && <p className="text-sm">El panel muestra los primeros 100 productos, según el alcance de la consigna.</p>}
    {selected !== undefined && <Modal title={selected ? 'Editar producto' : 'Nuevo producto'} close={() => select(undefined)}><ProductoForm product={selected ?? undefined} done={() => select(undefined)} /></Modal>}
    {stock && <Modal title={`Stock: ${stock.nombre}`} close={() => setStock(undefined)}><StockForm product={stock} done={() => setStock(undefined)} /></Modal>}
  </section>
}
