import type { Categoria } from '@/features/categorias/types'
export interface ProductoInput {
  nombre: string; descripcion: string; precio_base: number; imagen_url: string; stock: number; disponible: boolean; categoria_id: number
}
export interface Producto extends ProductoInput { id: number; activo: boolean; categoria: Categoria }
export interface ProductosPaginados { total: number; items: Producto[] }
export interface ProductoFiltros { skip: number; limit: number; search?: string; categoria_id?: number; disponible?: boolean }
