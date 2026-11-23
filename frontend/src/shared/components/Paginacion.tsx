export function Paginacion({ page, total, limit, change }: { page: number; total: number; limit: number; change: (value: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / limit))
  return <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3 py-4">
    <span className="text-sm text-slate-600">{total} resultados · Página {page + 1} de {pages}</span>
    <div className="flex gap-2"><button className="btn-secondary" disabled={page === 0} onClick={() => change(page - 1)}>Anterior</button>
      <button className="btn-secondary" disabled={page + 1 >= pages} onClick={() => change(page + 1)}>Siguiente</button></div>
  </nav>
}
