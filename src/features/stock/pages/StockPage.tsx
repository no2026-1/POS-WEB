import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { stockApi } from '../services/stock.service'
import { locationApi } from '@/features/location/services/location.service'

export default function StockPage() {
  const { t } = useTranslation()
  const [locationFilter, setLocationFilter] = useState('')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const limit = 50

  const params: any = { page, limit }
  if (locationFilter) params.locationId = Number(locationFilter)
  if (dateFrom) params.dateFrom = dateFrom
  if (dateTo) params.dateTo = dateTo

  const { data, isLoading } = useQuery({
    queryKey: ['stocks', locationFilter, dateFrom, dateTo, page],
    queryFn: () => stockApi.getAll(params),
  })

  const { data: locationsData } = useQuery({ queryKey: ['locations-all'], queryFn: () => locationApi.getAll({ limit: 100 }) })
  const locations = locationsData?.data.data.data ?? []

  const stockData = data?.data
  const stocks = stockData?.data ?? []
  const total = stockData?.total ?? 0
  const totalPages = stockData?.totalPages ?? 1

  const filtered = search.trim()
    ? stocks.filter((s) =>
        s.product.productName.toLowerCase().includes(search.toLowerCase()) ||
        s.product.productCode.toLowerCase().includes(search.toLowerCase()) ||
        s.location.locationName.toLowerCase().includes(search.toLowerCase())
      )
    : stocks

  return (
    <div className="flex flex-col h-full -m-6">
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4">
        <h1 className="text-white font-bold text-lg">{t('stock.title')}</h1>
        <p className="text-slate-300 text-xs mt-0.5">{t('common.total')}: {total} {t('common.items')}</p>
      </div>

      <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex flex-wrap gap-3">
        <input
          className="border border-blue-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
          placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
        <select
          className="border border-blue-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setPage(1) }}>
          <option value="">All Locations</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.locationCode} - {l.locationName}</option>)}
        </select>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{t('stock.from')}</span>
          <input type="date" className="border border-blue-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} />
          <span>{t('stock.to')}</span>
          <input type="date" className="border border-blue-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} />
        </div>
        {(locationFilter || dateFrom || dateTo) && (
          <button onClick={() => { setLocationFilter(''); setDateFrom(''); setDateTo(''); setPage(1) }}
            className="text-xs text-gray-400 hover:text-gray-600 underline">
            {t('stock.clearFilter')}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left sticky top-0">
            <tr>
              <th className="px-5 py-3 font-medium">{t('stock.date')}</th>
              <th className="px-5 py-3 font-medium">{t('product.title')}</th>
              <th className="px-5 py-3 font-medium">{t('stock.location')}</th>
              <th className="px-5 py-3 font-medium">{t('stock.source')}</th>
              <th className="px-5 py-3 font-medium text-right">{t('stock.qtyIn')}</th>
              <th className="px-5 py-3 font-medium text-right">{t('stock.qtyOut')}</th>
              <th className="px-5 py-3 font-medium text-right">{t('stock.balance')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
            ) : filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-500">{s.stockDate.slice(0, 10)}</td>
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-800">{s.product.productName}</p>
                  <p className="text-xs text-gray-400">{s.product.productCode}</p>
                </td>
                <td className="px-5 py-3 text-gray-600">{s.location.locationName}</td>
                <td className="px-5 py-3">
                  <p className="text-xs text-gray-500">{s.tableName}</p>
                  {s.refNo && <p className="text-xs text-gray-400">{s.refNo}</p>}
                </td>
                <td className="px-5 py-3 text-right">
                  {s.qtyIn > 0 ? (
                    <span className="text-green-600 font-medium">+{Number(s.qtyIn).toLocaleString()}</span>
                  ) : '-'}
                </td>
                <td className="px-5 py-3 text-right">
                  {s.qtyOut > 0 ? (
                    <span className="text-red-500 font-medium">-{Number(s.qtyOut).toLocaleString()}</span>
                  ) : '-'}
                </td>
                <td className="px-5 py-3 text-right font-bold text-gray-800">{Number(s.balanceQty).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>{t('common.page')} {page} / {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              {t('common.previous')}
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              {t('common.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
