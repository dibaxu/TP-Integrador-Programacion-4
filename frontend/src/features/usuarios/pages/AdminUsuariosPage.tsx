import type { ColumnDef } from '@tanstack/react-table'
import type { Usuario } from '@/features/auth/types'
import { useAuthStore } from '@/store/authStore'
import { EstadoError, Skeleton } from '@/shared/components/Estados'
import { Tabla } from '@/shared/components/Tabla'
import { useUsuarios, useEstadoUsuario } from '../hooks/useUsuarios'

export function AdminUsuariosPage() {
  const query = useUsuarios(), change = useEstadoUsuario(), user = useAuthStore((s) => s.usuario)
  const columns: ColumnDef<Usuario>[] = [
    { accessorKey: 'username', header: 'Usuario' }, { accessorKey: 'full_name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' }, { accessorKey: 'role', header: 'Rol' },
    { accessorKey: 'disabled', header: 'Estado', cell: ({ row }) => row.original.disabled ? 'Desactivado' : 'Activo' },
    { id: 'acciones', header: 'Acciones', cell: ({ row }) => row.original.id === user?.id ? <span className="text-slate-500">Tu cuenta</span>
      : <button className="btn-secondary" disabled={change.isPending} onClick={() => change.mutate(row.original)}>{row.original.disabled ? 'Activar' : 'Desactivar'}</button> },
  ]
  return <section className="space-y-5"><header><p className="eyebrow">ADMINISTRACIÓN</p><h1>Usuarios</h1></header><EstadoError error={query.error ?? change.error} />
    {query.isPending ? <Skeleton /> : <Tabla rows={query.data ?? []} columns={columns} />}</section>
}
