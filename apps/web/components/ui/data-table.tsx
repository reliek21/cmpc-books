import * as React from 'react'

type Column<T> = {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
}

export function DataTable<T>({ columns, data }: { columns: Column<T>[]; data: T[] }) {
  return (
    <div className="overflow-x-auto border rounded">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left p-2">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const record = row as unknown as Record<string, unknown>
            const key = (record.id as string) ?? String(idx)
            return (
              <tr key={key} className="border-t hover:bg-slate-50">
                {columns.map((c) => (
                  <td key={c.key} className="p-2">
                    {c.render ? c.render(row) : String(record[c.key] ?? '')}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
