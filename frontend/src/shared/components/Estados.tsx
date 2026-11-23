import { handleApiError } from '@/shared/api/handleApiError'

export function EstadoError({ error }: { error: unknown }) {
  return error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">{handleApiError(error)}</p> : null
}
export function EstadoVacio({ text = 'No hay resultados para mostrar.' }: { text?: string }) {
  return <p className="card py-10 text-center text-slate-600">{text}</p>
}
export function Skeleton() {
  return <div role="status" aria-label="Cargando" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3].map((n) => <div key={n} className="card animate-pulse"><div className="h-36 rounded bg-slate-200" /><div className="mt-5 h-5 w-2/3 bg-slate-200" /><div className="mt-4 h-4 bg-slate-200" /></div>)}
  </div>
}
