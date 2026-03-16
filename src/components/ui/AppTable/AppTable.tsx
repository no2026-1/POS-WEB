import { useTranslation } from 'react-i18next'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface AppTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  rowKey: (row: T) => string | number
  onRowClick?: (row: T) => void
  selectedId?: string | number | null
  emptyMessage?: string
}

export function AppTable<T>({
  columns,
  data,
  isLoading,
  rowKey,
  onRowClick,
  selectedId,
  emptyMessage,
}: AppTableProps<T>) {
  const { t } = useTranslation()

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left sticky top-0">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`px-5 py-3 font-medium ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-gray-400">
                {t('common.loading')}
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-gray-400">
                {emptyMessage ?? t('common.noData')}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const id = rowKey(row)
              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-blue-50' : ''} ${
                    selectedId === id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-5 py-3 ${col.className ?? ''}`}>
                      {col.render ? col.render(row) : String((row as any)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
