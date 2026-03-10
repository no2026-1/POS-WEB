import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { dailyCloseApi } from './daily-close.api'
import { locationApi } from '@/features/location/location.api'
import type { DailyClose } from './daily-close.types'

function statusBadge(s: string) {
  const m: Record<string, string> = { OPEN: 'bg-yellow-100 text-yellow-700', CLOSED: 'bg-green-100 text-green-700' }
  return `inline-block px-2 py-0.5 rounded text-xs font-medium ${m[s] ?? 'bg-gray-100 text-gray-500'}`
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>{message}</div>
}

export default function DailyClosePage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const today = new Date().toISOString().slice(0, 10)

  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showClose, setShowClose] = useState<DailyClose | null>(null)
  const [form, setForm] = useState({ closeDate: today, locationId: '' })
  const [closeForm, setCloseForm] = useState({ totalProducts: '', totalValue: '', remarks: '' })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function showToast(message: string, type: 'success' | 'error') { setToast({ message, type }); setTimeout(() => setToast(null), 3000) }

  const { data, isLoading } = useQuery({
    queryKey: ['daily-closes', page, statusFilter],
    queryFn: () => dailyCloseApi.getAll({ page, limit: 20, status: statusFilter || undefined }),
  })
  const items: DailyClose[] = data?.data.data ?? []
  const total = (data?.data as any)?.total ?? 0
  const totalPages = Math.ceil(total / 20)

  const { data: locData } = useQuery({ queryKey: ['locations-all'], queryFn: () => locationApi.getAll({ limit: 100 }) })
  const locations = locData?.data.data.data ?? []

  const createMutation = useMutation({
    mutationFn: () => dailyCloseApi.create({ closeDate: new Date(form.closeDate).toISOString(), locationId: Number(form.locationId) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['daily-closes'] }); setShowCreate(false); setForm({ closeDate: today, locationId: '' }); showToast(t('dailyClose.createSuccess'), 'success') },
    onError: (e: any) => showToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const closeMutation = useMutation({
    mutationFn: () => dailyCloseApi.close(showClose!.id, { totalProducts: Number(closeForm.totalProducts) || 0, totalValue: Number(closeForm.totalValue) || 0, remarks: closeForm.remarks || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['daily-closes'] }); setShowClose(null); setCloseForm({ totalProducts: '', totalValue: '', remarks: '' }); showToast(t('dailyClose.closeSuccess'), 'success') },
    onError: (e: any) => showToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">{t('dailyClose.title')}</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">{t('dailyClose.create')}</button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="">{t('common.status')}: All</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
        </select>
        {statusFilter && <button onClick={() => setStatusFilter('')} className="text-xs text-blue-500 hover:underline">{t('stock.clearFilter')}</button>}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('dailyClose.closeDate')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('location.title')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('common.status')}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('dailyClose.totalValue')}</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('common.confirm')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">{t('common.loading')}</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{item.closeDate?.slice(0, 10)}</td>
                <td className="px-4 py-3 text-gray-600">{item.location?.locationName ?? `#${item.locationId}`}</td>
                <td className="px-4 py-3"><span className={statusBadge(item.status)}>{item.status}</span></td>
                <td className="px-4 py-3 text-right">{item.totalValue != null ? Number(item.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                <td className="px-4 py-3 text-center">
                  {item.status === 'OPEN' && (
                    <button onClick={() => { setShowClose(item); setCloseForm({ totalProducts: '', totalValue: '', remarks: '' }) }}
                      className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-lg font-medium">
                      {t('dailyClose.close')}
                    </button>
                  )}
                </td>
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

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96">
            <h3 className="font-bold text-gray-800 text-lg mb-4">{t('dailyClose.create')}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('dailyClose.closeDate')}</label>
                <input type="date" value={form.closeDate} onChange={(e) => setForm((f) => ({ ...f, closeDate: e.target.value }))}
                  className="input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('location.title')}</label>
                <select value={form.locationId} onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))} className="input w-full">
                  <option value="">{t('common.select')}...</option>
                  {locations.map((l: any) => <option key={l.id} value={l.id}>{l.locationName}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => createMutation.mutate()} disabled={!form.locationId || createMutation.isPending}
                className="btn-primary flex-1 disabled:opacity-50">
                {createMutation.isPending ? t('common.saving') : t('common.save')}
              </button>
              <button onClick={() => setShowCreate(false)} className="btn-secondary px-4">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showClose && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96">
            <h3 className="font-bold text-gray-800 text-lg mb-1">{t('dailyClose.close')}</h3>
            <p className="text-sm text-gray-400 mb-4">{showClose.closeDate?.slice(0, 10)} · {showClose.location?.locationName}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('dailyClose.totalProducts')}</label>
                <input type="number" value={closeForm.totalProducts} onChange={(e) => setCloseForm((f) => ({ ...f, totalProducts: e.target.value }))} className="input w-full" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('dailyClose.totalValue')}</label>
                <input type="number" value={closeForm.totalValue} onChange={(e) => setCloseForm((f) => ({ ...f, totalValue: e.target.value }))} className="input w-full" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('common.remarks')}</label>
                <input value={closeForm.remarks} onChange={(e) => setCloseForm((f) => ({ ...f, remarks: e.target.value }))} className="input w-full" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => closeMutation.mutate()} disabled={closeMutation.isPending}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg flex-1 disabled:opacity-50 text-sm">
                {closeMutation.isPending ? t('common.saving') : t('dailyClose.close')}
              </button>
              <button onClick={() => setShowClose(null)} className="btn-secondary px-4">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
