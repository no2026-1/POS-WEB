import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { posReturnApi } from './pos-return.api'
import type { PosReturn } from './pos-return.types'

function statusBadge(status: string) {
  const map: Record<string, string> = {
    DRAFT: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-600',
  }
  return `inline-block px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-500'}`
}

export default function PosReturnPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['pos-returns', page, statusFilter],
    queryFn: () => posReturnApi.getAll({ page, limit: 20, status: statusFilter || undefined }),
  })
  const returns: PosReturn[] = data?.data.data ?? []
  const total = (data?.data as any)?.total ?? 0
  const totalPages = Math.ceil(total / 20)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">{t('posReturn.title')}</h1>
        <p className="text-sm text-gray-400">{t('posReturn.createHint')}</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">{t('common.status')}: All</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        {statusFilter && (
          <button onClick={() => setStatusFilter('')} className="text-xs text-blue-500 hover:underline">{t('stock.clearFilter')}</button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('posReturn.returnNo')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('posReturn.returnDate')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('posReturn.posOrder')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('common.status')}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('posReturn.returnAmt')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
            ) : returns.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
            ) : returns.map((r) => (
              <tr key={r.id} onClick={() => navigate(`/pos-return/${r.id}`)}
                className="cursor-pointer hover:bg-blue-50 transition">
                <td className="px-4 py-3 font-medium text-gray-800">{r.returnNo}</td>
                <td className="px-4 py-3 text-gray-600">{r.returnDate?.slice(0, 10)}</td>
                <td className="px-4 py-3 text-gray-600">{r.posOrder?.posNo ?? `#${r.posOrderId}`}</td>
                <td className="px-4 py-3"><span className={statusBadge(r.status)}>{r.status}</span></td>
                <td className="px-4 py-3 text-right font-semibold">{Number(r.returnAmt).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>{t('common.total')}: {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">{t('common.previous')}</button>
            <span className="px-3 py-1">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">{t('common.next')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
