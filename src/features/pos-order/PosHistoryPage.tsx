import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { posOrderApi } from './pos-order.api'
import { posReturnApi } from '@/features/pos-return/pos-return.api'
import { useAuthStore } from '@/stores/auth.store'
import type { PosOrder, PosOrderLine } from './pos-order.types'

function genNo(prefix: string) {
  const now = new Date()
  return `${prefix}${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-600',
  }
  return `inline-block px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-500'}`
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
      {message}
    </div>
  )
}

export default function PosHistoryPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const [selected, setSelected] = useState<PosOrder | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [showReturn, setShowReturn] = useState(false)
  const [returnQtys, setReturnQtys] = useState<Record<number, number>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['pos-orders', page, statusFilter, dateFrom, dateTo],
    queryFn: () => posOrderApi.getAll({ page, limit: 20, status: statusFilter || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }),
  })
  const orders: PosOrder[] = data?.data.data ?? []
  const total = (data?.data as any)?.total ?? 0
  const totalPages = Math.ceil(total / 20)

  // Fetch order detail with lines
  const { data: detailData } = useQuery({
    queryKey: ['pos-order-detail', selected?.id],
    queryFn: () => posOrderApi.getById(selected!.id),
    enabled: !!selected,
  })
  const orderDetail = detailData?.data.data ?? selected

  const createReturnMutation = useMutation({
    mutationFn: async () => {
      if (!orderDetail) throw new Error('No order')
      const now = new Date()
      const returnNo = genNo('RET')
      const totalReturnAmt = (orderDetail.lines ?? []).reduce((sum, line) => {
        const qty = returnQtys[line.id] ?? 0
        return sum + qty * Number(line.price)
      }, 0)

      const ret = await posReturnApi.create({
        returnNo,
        returnDate: now.toISOString(),
        posOrderId: orderDetail.id,
        returnAmt: totalReturnAmt,
        refundAmt: totalReturnAmt,
        createId: user?.id,
      })
      const returnId = ret.data.data.id

      let lineNo = 1
      for (const line of orderDetail.lines ?? []) {
        const qty = returnQtys[line.id] ?? 0
        if (qty <= 0) continue
        await posReturnApi.addLine({
          posReturnId: returnId,
          lineNo: lineNo++,
          posOrderLineId: line.id,
          productId: line.productId,
          unitId: line.unitId,
          qty,
          price: Number(line.price),
          amount: qty * Number(line.price),
          createId: user?.id,
        })
      }
      return returnId
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pos-returns'] })
      setShowReturn(false)
      setReturnQtys({})
      showToast(t('posReturn.createSuccess'), 'success')
    },
    onError: (e: any) => showToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  function openReturn(order: PosOrder) {
    const initial: Record<number, number> = {}
    order.lines?.forEach((l) => { initial[l.id] = 0 })
    setReturnQtys(initial)
    setShowReturn(true)
  }

  const hasReturnQty = Object.values(returnQtys).some((q) => q > 0)

  return (
    <div className="flex gap-6 h-full">
      {/* List */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">{t('posHistory.title')}</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">{t('common.status')}: All</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          {(statusFilter || dateFrom || dateTo) && (
            <button onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); setPage(1) }}
              className="text-xs text-blue-500 hover:underline">{t('stock.clearFilter')}</button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">POS No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('posHistory.date')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('common.status')}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('posHistory.total')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} onClick={() => setSelected(o)}
                  className={`cursor-pointer hover:bg-blue-50 transition ${selected?.id === o.id ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-800">{o.posNo}</td>
                  <td className="px-4 py-3 text-gray-600">{o.posDate?.slice(0, 10)}</td>
                  <td className="px-4 py-3"><span className={statusBadge(o.status)}>{o.status}</span></td>
                  <td className="px-4 py-3 text-right font-semibold">{Number(o.totalAmt).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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

      {/* Detail Panel */}
      {selected && (
        <div className="w-96 bg-white border border-gray-200 rounded-xl flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800">{orderDetail?.posNo}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{orderDetail?.posDate?.slice(0, 10)} · <span className={statusBadge(orderDetail?.status ?? '')}>{orderDetail?.status}</span></p>
            </div>
            <div className="flex gap-2">
              {orderDetail?.status === 'CONFIRMED' && (
                <button onClick={() => openReturn(orderDetail)}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                  {t('posReturn.create')}
                </button>
              )}
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{t('posHistory.lines')}</p>
            {(orderDetail?.lines ?? []).length === 0 ? (
              <p className="text-sm text-gray-400">{t('common.noData')}</p>
            ) : (
              <div className="space-y-2">
                {(orderDetail?.lines ?? []).map((line: PosOrderLine) => (
                  <div key={line.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{line.product?.productName ?? `Product #${line.productId}`}</p>
                      <p className="text-xs text-gray-400">{line.product?.productCode} · {Number(line.price).toLocaleString()} × {Number(line.qty)}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{Number(line.lineTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <div className="flex justify-between text-sm font-bold text-gray-800">
              <span>{t('posHistory.total')}</span>
              <span>{Number(orderDetail?.totalAmt ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturn && orderDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[480px] max-h-[80vh] flex flex-col">
            <h3 className="font-bold text-gray-800 text-lg mb-1">{t('posReturn.create')}</h3>
            <p className="text-sm text-gray-400 mb-4">{orderDetail.posNo}</p>

            <div className="flex-1 overflow-auto divide-y divide-gray-100">
              {(orderDetail.lines ?? []).map((line: PosOrderLine) => (
                <div key={line.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{line.product?.productName}</p>
                    <p className="text-xs text-gray-400">{Number(line.price).toLocaleString()} × sold: {Number(line.qty)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{t('posReturn.returnQty')}:</span>
                    <input type="number" min={0} max={Number(line.qty)}
                      value={returnQtys[line.id] ?? 0}
                      onChange={(e) => setReturnQtys((prev) => ({ ...prev, [line.id]: Math.min(Number(e.target.value), Number(line.qty)) }))}
                      className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <button onClick={() => createReturnMutation.mutate()}
                disabled={!hasReturnQty || createReturnMutation.isPending}
                className="btn-primary flex-1 disabled:opacity-50">
                {createReturnMutation.isPending ? t('common.saving') : t('posReturn.confirmCreate')}
              </button>
              <button onClick={() => { setShowReturn(false); setReturnQtys({}) }}
                className="btn-secondary px-4">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
