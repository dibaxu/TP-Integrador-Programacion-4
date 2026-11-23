import { useId } from 'react'
import type { ReactNode } from 'react'

interface CampoProps {
  etiqueta: string
  error?: string
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode
}

export default function Campo({ etiqueta, error, children }: CampoProps) {
  const id = useId()
  const errorId = error ? `${id}-error` : undefined
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{etiqueta}</label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': errorId })}
      {error && <p id={errorId} className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  )
}
