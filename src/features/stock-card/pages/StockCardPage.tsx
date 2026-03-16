import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { stockCardApi } from '../services/stock-card.service'
import { locationApi } from '@/features/location/services/location.service'
import { productApi } from '@/features/product/services/product.service'

export default function StockCardPage() {
  const { t } = useTranslation()
  const [locationId, setLocationId] = useState('')
  const [productId, setProductId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['stock-cards', page, locationId, productId, dateFrom, dateTo],
    queryFn: () => stockCardApi.getAll({
      page, limit: 20,
      locationId: locationId ? Number(locationId) : undefined,
      productId: productId ? Number(productId) : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
  })
  const stockData = data?.data
  const cards = stockData?.data ?? []
  const total = (stockData as any)?.total ?? 0
  const totalPages = Math.ceil(total / 20)

  const { data: locData } = useQuery({ queryKey: ['locations-all'], queryFn: () => locationApi.getAll({ limit: 100 }) })
  const locations = locData?.data.data.data ?? []

  const { data: prodData } = useQuery({ queryKey: ['products-all'], queryFn: () => productApi.getAll({ limit: 100 }) })
  const products = prodData?.data.data.data ?? []

  function clearFilter() { setLocationId(''); setProductId(''); setDateFrom(''); setDateTo(''); setPage(1) }
  const hasFilter = locationId || productId || dateFrom || dateTo

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">{t('stockCard.title')}</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
        <select value={locationId} onChange={(e) => { setLocationId(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">{t('stock.location')}: All</option>
          {locations.map((l: any) => <option key={l.id} value={l.id}>{l.locationName}</option>)}
        </select>
        <select value={productId} onChange={(e) => { setProductId(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">{t('product.title')}: All</option>
          {products.map((p: any) => <option key={p.id} value={p.id}>{p.productName}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        {hasFilter && <button onClick={clearFilter} className="text-xs text-blue-500 hover:underline">{t('stock.clearFilter')}</button>}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('stock.date')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('product.title')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('stock.location')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('stock.source')}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('stock.qtyIn')}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('stock.qtyOut')}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('stock.balance')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
            ) : cards.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
            ) : (cards as any[]).map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600">{c.stockDate?.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{c.product?.productName}</p>
                  <p className="text-xs text-gray-400">{c.product?.productCode}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.location?.locationName}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{c.tableName}#{c.recordId}</td>
                <td className="px-4 py-3 text-right text-green-600 font-medium">{c.qtyIn ? Number(c.qtyIn).toLocaleString() : '-'}</td>
                <td className="px-4 py-3 text-right text-red-500 font-medium">{c.qtyOut ? Number(c.qtyOut).toLocaleString() : '-'}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-800">{Number(c.balanceQty).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>{t('common.total')}: {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">{t('common.previous')}</button>
            <span className="px-3 py-1">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">{t('common.next')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
