import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Campo from '@/shared/ui/Campo'
import { EstadoError } from '@/shared/components/Estados'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '../api/auth'

export function AuthPage({ register = false }: { register?: boolean }) {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const action = useMutation({ mutationFn: async (value: { username: string; full_name: string; email: string; password: string }) => {
    if (register) await authApi.register(value)
    await login(value.username.trim(), value.password)
  }, onSuccess: () => navigate(typeof location.state?.from === 'string' ? location.state.from : '/', { replace: true }) })
  const form = useForm({ defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: ({ value }) => action.mutate(value) })
  return <section className="mx-auto max-w-md py-5"><div className="card space-y-5">
    <p className="eyebrow">FOOD STORE</p><h1 className="text-3xl font-bold">{register ? 'Creá tu cuenta' : 'Bienvenido de nuevo'}</h1>
    <p className="text-slate-600">{register ? 'Registrate para confirmar y consultar tus pedidos.' : 'Ingresá con tu nombre de usuario.'}</p>
    <EstadoError error={action.error} />
    <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void form.handleSubmit() }}>
      <form.Field name="username" validators={{ onChange: ({ value }) => value.trim() ? undefined : 'Ingresá tu usuario.' }}>{(field) =>
        <Campo etiqueta="Usuario" error={field.state.meta.errors[0]}>{(props) => <input {...props} className="input" required maxLength={100} autoComplete="username" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />}</Campo>}</form.Field>
      {register && <><form.Field name="full_name" validators={{ onChange: ({ value }) => value.trim() ? undefined : 'Ingresá tu nombre completo.' }}>{(field) =>
        <Campo etiqueta="Nombre completo" error={field.state.meta.errors[0]}>{(props) => <input {...props} className="input" required maxLength={150} autoComplete="name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}</Campo>}</form.Field>
      <form.Field name="email" validators={{ onChange: ({ value }) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : 'Ingresá un email válido.' }}>{(field) =>
        <Campo etiqueta="Email" error={field.state.meta.errors[0]}>{(props) => <input {...props} className="input" required type="email" autoComplete="email" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />}</Campo>}</form.Field></>}
      <form.Field name="password" validators={{ onChange: ({ value }) => register && (value.length < 8 || new TextEncoder().encode(value).length > 72) ? 'Usá al menos 8 caracteres y hasta 72 bytes.' : undefined }}>{(field) =>
        <Campo etiqueta="Contraseña" error={field.state.meta.errors[0]}>{(props) => <input {...props} className="input" type="password" required minLength={register ? 8 : 1} autoComplete={register ? 'new-password' : 'current-password'} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />}</Campo>}</form.Field>
      <button className="btn-primary w-full" disabled={action.isPending}>{action.isPending ? 'Procesando…' : register ? 'Crear cuenta' : 'Ingresar'}</button>
    </form><p className="text-sm">{register ? '¿Ya tenés cuenta?' : '¿Primera vez?'} <Link className="text-emerald-800 underline" to={register ? '/login' : '/register'}>{register ? 'Ingresá' : 'Registrate'}</Link></p>
  </div></section>
}
