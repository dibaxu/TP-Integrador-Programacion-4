import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Tabla } from '@/shared/components/Tabla'
import { EstadoError, Skeleton } from '@/shared/components/Estados'
import { Modal } from '@/shared/ui/Modal'
import { CategoriaForm } from '../components/CategoriaForm'
import { useCategorias, useEliminarCategoria } from '../hooks/useCategorias'
import type { Categoria } from '../types'

export function AdminCategoriasPage() {
  const query = useCategorias(), remove = useEliminarCategoria()
  const [selected, select] = useState<Categoria | null | undefined>(undefined)
  const columns: ColumnDef<Categoria>[] = [
    { accessorKey: 'nombre', header: 'Nombre' }, { accessorKey: 'descripcion', header: 'Descripción' },
    { id: 'acciones', header: 'Acciones', cell: ({ row }) => <div className="flex gap-2"><button className="btn-secondary" onClick={() => select(row.original)}>Editar</button>
      <button className="btn-danger" disabled={remove.isPending} onClick={() => { if (confirm(`¿Dar de baja «${row.original.nombre}»? Sus productos seguirán activos.`)) remove.mutate(row.original.id) }}>Dar de baja</button></div> },
  ]
  return <section className="space-y-5"><header className="page-header"><div><p className="eyebrow">ADMINISTRACIÓN</p><h1>Categorías</h1></div><button className="btn-primary" onClick={() => select(null)}>Nueva categoría</button></header>
    <EstadoError error={query.error ?? remove.error} />{query.isPending ? <Skeleton /> : <Tabla rows={query.data ?? []} columns={columns} />}
    {selected !== undefined && <Modal title={selected ? 'Editar categoría' : 'Nueva categoría'} close={() => select(undefined)}><CategoriaForm category={selected ?? undefined} done={() => select(undefined)} /></Modal>}
  </section>
}
