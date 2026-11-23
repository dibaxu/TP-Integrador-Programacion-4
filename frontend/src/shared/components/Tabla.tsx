import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { EstadoVacio } from './Estados'

export function Tabla<T>({ rows, columns }: { rows: T[]; columns: ColumnDef<T>[] }) {
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }, autoResetPageIndex: true })
  if (!rows.length) return <EstadoVacio />
  return <div className="card overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full text-left text-sm">
    <thead className="bg-slate-100">{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id} scope="col" className="p-4">
      {header.column.getCanSort() ? <button className="font-semibold" onClick={header.column.getToggleSortingHandler()}>
        {flexRender(header.column.columnDef.header, header.getContext())} {header.column.getIsSorted() === 'asc' ? '↑' : header.column.getIsSorted() === 'desc' ? '↓' : ''}
      </button> : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead>
    <tbody>{table.getRowModel().rows.map((row) => <tr key={row.id} className="border-t border-slate-100">{row.getVisibleCells().map((cell) => <td key={cell.id} className="p-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody>
  </table></div><div className="flex items-center justify-between gap-3 border-t border-slate-100 p-4">
    <span>Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span><div className="flex gap-2">
      <button className="btn-secondary" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Anterior</button>
      <button className="btn-secondary" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Siguiente</button></div></div></div>
}
