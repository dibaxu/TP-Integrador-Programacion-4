import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { useCartStore } from '@/store/cartStore'
import { EstadoError, EstadoVacio, Skeleton } from '@/shared/components/Estados'
import { Paginacion } from '@/shared/components/Paginacion'
import { money } from '@/shared/ui/format'
import { useProductos } from '../hooks/useProductos'

export function CatalogoPage() {
  const [page, setPage] = useState(0), [search, setSearch] = useState(''), [category, setCategory] = useState('')
  const products = useProductos({ skip: page * 6, limit: 6, search: search || undefined, categoria_id: category ? Number(category) : undefined })
  const categories = useCategorias(), add = useCartStore((s) => s.agregar)
  const items = useCartStore((s) => s.items)
  return <section className="space-y-7"><header className="rounded-2xl bg-emerald-950 p-7 text-white sm:p-10"><p className="text-sm font-semibold tracking-widest text-emerald-200">FOOD STORE</p>
    <h1 className="mt-3 max-w-xl text-3xl font-bold sm:text-4xl">Tu próxima comida empieza acá.</h1><p className="mt-3 text-emerald-100">Elegí tus favoritos y armá tu pedido para recibirlo en casa.</p></header>
    <div className="flex flex-wrap items-end gap-4"><label className="min-w-48 flex-1 text-sm font-semibold">Buscar por nombre<input className="input mt-1" type="search" value={search} placeholder="¿Qué querés comer?" onChange={(e) => { setSearch(e.target.value); setPage(0) }} /></label>
      <label className="text-sm font-semibold">Categoría<select className="input mt-1" value={category} onChange={(e) => { setCategory(e.target.value); setPage(0) }}><option value="">Todas las categorías</option>{categories.data?.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></label>
    </div><EstadoError error={products.error ?? categories.error} />
    {products.isPending ? <Skeleton /> : products.data?.items.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.data.items.map((product) => {
      const quantity = items.find((item) => item.producto_id === product.id)?.cantidad ?? 0
      return <article key={product.id} className="card flex flex-col overflow-hidden p-0">
        <img className="h-44 w-full object-cover" src={product.imagen_url || '/comida.svg'} alt={product.nombre} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/comida.svg' }} />
        <div className="flex flex-1 flex-col gap-3 p-5"><p className="text-sm font-semibold text-emerald-800">{product.categoria.nombre}</p><h2 className="text-xl font-bold">{product.nombre}</h2><p className="flex-1 text-sm text-slate-600">{product.descripcion}</p>
          <div className="flex items-center justify-between"><strong className="text-xl">{money(product.precio_base)}</strong><span className="text-sm text-slate-600">{product.disponible && product.stock > 0 ? `${product.stock} disponibles` : 'No disponible'}</span></div>
          <button className="btn-primary" disabled={!product.disponible || quantity >= product.stock} onClick={() => add(product)}>Agregar al carrito{quantity ? ` (${quantity})` : ''}</button>
        </div></article>
    })}</div> : !products.error ? <EstadoVacio text="No encontramos productos con esos filtros." /> : null}
    <Paginacion page={page} total={products.data?.total ?? 0} limit={6} change={setPage} /><Link className="text-emerald-800 underline" to="/carrito">Ver mi carrito</Link>
  </section>
}
