export const money = (value: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
export const date = (value: string) => new Date(value).toLocaleString('es-AR')
