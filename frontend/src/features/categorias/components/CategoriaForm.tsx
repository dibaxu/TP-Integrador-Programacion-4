import { useForm } from '@tanstack/react-form'
import Campo from '@/shared/ui/Campo'
import { EstadoError } from '@/shared/components/Estados'
import { useGuardarCategoria } from '../hooks/useCategorias'
import type { Categoria } from '../types'

export function CategoriaForm({ category, done }: { category?: Categoria; done: () => void }) {
  const save = useGuardarCategoria(category?.id)
  const form = useForm({ defaultValues: { nombre: category?.nombre ?? '', descripcion: category?.descripcion ?? '' },
    onSubmit: async ({ value }) => { try { await save.mutateAsync(value); done() } catch { /* Error visible en el formulario. */ } } })
  return <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void form.handleSubmit() }}>
    <EstadoError error={save.error} />
    <form.Field name="nombre" validators={{ onChange: ({ value }) => value.trim().length < 2 ? 'Usá entre 2 y 100 caracteres.' : undefined }}>{(field) =>
      <Campo etiqueta="Nombre" error={field.state.meta.errors[0]}>{(props) => <input {...props} className="input" required minLength={2} maxLength={100} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}</Campo>}</form.Field>
    <form.Field name="descripcion">{(field) => <Campo etiqueta="Descripción">{(props) => <textarea {...props} className="input" rows={3} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}</Campo>}</form.Field>
    <button className="btn-primary" disabled={save.isPending}>{save.isPending ? 'Guardando…' : 'Guardar categoría'}</button>
  </form>
}
