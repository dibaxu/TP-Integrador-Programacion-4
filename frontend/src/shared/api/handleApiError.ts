import axios from 'axios'

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map((item: unknown) => {
      if (typeof item === 'object' && item && 'msg' in item) return String(item.msg)
      return 'Revisá los campos del formulario.'
    }).join(' ')
    if (!error.response) return 'No se pudo conectar con el servidor. Intentá nuevamente.'
  }
  return 'No se pudo completar la operación.'
}
