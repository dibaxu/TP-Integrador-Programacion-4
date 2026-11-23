import { useForm } from '@tanstack/react-form'
import Campo from '@/shared/ui/Campo'
import { EstadoError } from '@/shared/components/Estados'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { useGuardarProducto, useStock } from '../hooks/useProductos'
import type { Producto } from '../types'

export function ProductoForm({ product, done }: { product?: Producto; done: () => void }) {
  const categories = useCategorias(), save = useGuardarProducto(product?.id)
  const form = useForm({ defaultValues: { nombre: product?.nombre ?? '', descripcion: product?.descripcion ?? '',
    precio_base: product ? String(product.precio_base) : '', imagen_url: product?.imagen_url ?? '',
    categoria_id: product ? String(product.categoria_id) : '', stock: String(product?.stock ?? 0), disponible: product?.disponible ?? true },
    onSubmit: async ({ value }) => { try {
      await save.mutateAsync({ ...value, precio_base: Number(value.precio_base), stock: Number(value.stock), categoria_id: Number(value.categoria_id) }); done()
    } catch { /* Error visible en el formulario. */ } } })
  return <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void form.handleSubmit() }}>
    <EstadoError error={save.error ?? categories.error} />
    <form.Field name="nombre" validators={{ onChange: ({ value }) => value.trim() ? undefined : 'Ingresá un nombre.' }}>{(field) =>
      <Campo etiqueta="Nombre" error={field.state.meta.errors[0]}>{(props) => <input {...props} className="input" required value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}</Campo>}</form.Field>
    <form.Field name="descripcion">{(field) => <Campo etiqueta="Descripción">{(props) => <textarea {...props} className="input" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}</Campo>}</form.Field>
    <form.Field name="categoria_id" validators={{ onChange: ({ value }) => Number(value) > 0 ? undefined : 'Elegí una categoría.' }}>{(field) =>
      <Campo etiqueta="Categoría" error={field.state.meta.errors[0]}>{(props) => <select {...props} className="input" required value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}>
        <option value="">Seleccionar categoría</option>{product && !categories.data?.some((c) => c.id === product.categoria_id) && <option value={product.categoria_id}>{product.categoria.nombre} (dada de baja)</option>}
        {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>}</Campo>}</form.Field>
    <div className="grid grid-cols-2 gap-4"><form.Field name="precio_base" validators={{ onChange: ({ value }) => value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 ? undefined : 'Ingresá un precio válido.' }}>{(field) =>
      <Campo etiqueta="Precio" error={field.state.meta.errors[0]}>{(props) => <input {...props} className="input" required type="number" min={0} step="0.01" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}</Campo>}</form.Field>
    <form.Field name="stock" validators={{ onChange: ({ value }) => value !== '' && Number.isSafeInteger(Number(value)) && Number(value) >= 0 ? undefined : 'Ingresá un stock entero, desde cero.' }}>{(field) =>
      <Campo etiqueta="Stock" error={field.state.meta.errors[0]}>{(props) => <input {...props} className="input" required type="number" min={0} step={1} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}</Campo>}</form.Field></div>
    <form.Field name="imagen_url">{(field) => <Campo etiqueta="URL de imagen">{(props) => <input {...props} className="input" type="url" placeholder="https://..." value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}</Campo>}</form.Field>
    <form.Field name="disponible">{(field) => <label className="flex items-center gap-2"><input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />Disponible para la venta</label>}</form.Field>
    <button className="btn-primary" disabled={save.isPending || categories.isPending}>{save.isPending ? 'Guardando…' : 'Guardar producto'}</button>
  </form>
}

export function StockForm({ product, done }: { product: Producto; done: () => void }) {
  const save = useStock(product.id)
  const form = useForm({ defaultValues: { stock: String(product.stock), disponible: product.disponible },
    onSubmit: async ({ value }) => { try { await save.mutateAsync({ stock: Number(value.stock), disponible: value.disponible }); done() } catch { /* Error visible. */ } } })
  return <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void form.handleSubmit() }}><EstadoError error={save.error} />
    <form.Field name="stock" validators={{ onChange: ({ value }) => value !== '' && Number.isSafeInteger(Number(value)) && Number(value) >= 0 ? undefined : 'Ingresá un entero desde cero.' }}>{(field) =>
      <Campo etiqueta="Stock" error={field.state.meta.errors[0]}>{(props) => <input {...props} className="input" type="number" min={0} step={1} required value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}</Campo>}</form.Field>
    <form.Field name="disponible">{(field) => <label className="flex items-center gap-2"><input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />Disponible</label>}</form.Field>
    <button className="btn-primary" disabled={save.isPending}>Guardar stock</button></form>
}
