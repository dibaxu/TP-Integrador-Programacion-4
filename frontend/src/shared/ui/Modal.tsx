import { useRef, useEffect } from 'react'
import type { ReactNode } from 'react'

export function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close() }, [])
  return <dialog ref={ref} onCancel={close} aria-label={title} className="modal">
    <div className="mb-5 flex items-center justify-between gap-6"><h2 className="text-xl font-bold">{title}</h2>
      <button type="button" className="btn-secondary" onClick={close} aria-label="Cerrar ventana">Cerrar</button></div>
    {children}
  </dialog>
}
