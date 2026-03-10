import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { stockAdjustApi } from './stock-adjust.api'
import { locationApi } from '@/features/location/location.api'
import type { CreateStockAdjustPayload } from './stock-adjust.types'

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
      type === 'success' ? 'bg-green-600' : 'bg-red-500'
    }`}>{message}</div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    SUBMITTED: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-500',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function NewAdjustPanel({ onClose, onToast }: {
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState<CreateStockAdjustPayload>({
    adjustNo: '',
    adjustDate: today,
    locationId: 0,
    adjustTypeId: 1,
    adjustReason: '',
    requireApproval: false,
    remarks: '',
  })

  const { data: locationsData } = useQuery({ queryKey: ['locations-all'], queryFn: () => locationApi.getAll({ limit: 100 }) })
  const locations = locationsData?.data.data.data ?? []

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: any = { ...form }
      if (!payload.adjustReason) delete payload.adjustReason
      if (!payload.remarks) delete payload.remarks
      return stockAdjustApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-adjusts'] })
      onToast(t('common.createSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const isValid = form.adjustNo.trim() && form.adjustDate && form.locationId > 0

  return (
    <div className="w-[420px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm">{t('stockAdjust.add')}</h2>
        <button onClick={onClose} className="text-slate-300 hover:text-white text-lg leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('stockAdjust.adjustNo')} *</label>
            <input className="input" value={form.adjustNo}
              onChange={(e) => setForm(f => ({ ...f, adjustNo: e.target.value.toUpperCase() }))}
              placeholder="ADJ2024001" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('stockAdjust.adjustDate')} *</label>
            <input type="date" className="input" value={form.adjustDate}
              onChange={(e) => setForm(f => ({ ...f, adjustDate: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('stockAdjust.location')} *</label>
          <select className="input" value={form.locationId || ''}
            onChange={(e) => setForm(f => ({ ...f, locationId: Number(e.target.value) }))}>
            <option value="">{t('common.select')}...</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.locationCode} - {l.locationName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('stockAdjust.adjustTypeId')}</label>
          <input type="number" className="input" value={form.adjustTypeId}
            onChange={(e) => setForm(f => ({ ...f, adjustTypeId: Number(e.target.value) }))}
            min="1" step="1" />
          <p className="text-xs text-gray-400 mt-0.5">{t('stockAdjust.adjustTypeHint')}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('stockAdjust.adjustReason')}</label>
          <input className="input" value={form.adjustReason}
            onChange={(e) => setForm(f => ({ ...f, adjustReason: e.target.value }))}
            placeholder="Reason for adjustment" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="requireApproval" checked={form.requireApproval ?? false}
            onChange={(e) => setForm(f => ({ ...f, requireApproval: e.target.checked }))}
            className="w-4 h-4 accent-blue-600" />
          <label htmlFor="requireApproval" className="text-xs font-medium text-gray-600">
            {t('stockAdjust.requireApproval')}
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('common.remarks')}</label>
          <textarea className="input resize-none" rows={2} value={form.remarks}
            onChange={(e) => setForm(f => ({ ...f, remarks: e.target.value }))} />
        </div>
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-2">
        <button onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !isValid}
          className="btn-primary w-full disabled:opacity-50">
          {saveMutation.isPending ? t('common.saving') : t('common.save')}
        </button>
        <button onClick={onClose} className="btn-secondary w-full">{t('common.cancel')}</button>
      </div>
    </div>
  )
}

const STATUSES = ['DRAFT', 'SUBMITTED', 'APPROVED', 'CONFIRMED', 'CANCELLED']

export default function StockAdjustPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showPanel, setShowPanel] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['stock-adjusts', statusFilter],
    queryFn: () => stockAdjustApi.getAll({ limit: 100, status: statusFilter || undefined }),
  })

  const allAdjusts = data?.data.data ?? []
  const adjusts = search.trim()
    ? allAdjusts.filter((a) => a.adjustNo.toLowerCase().includes(search.toLowerCase()))
    : allAdjusts

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{t('stockAdjust.title')}</h1>
            <p className="text-slate-300 text-xs mt-0.5">{adjusts.length} / {allAdjusts.length} {t('common.items')}</p>
          </div>
          <button onClick={() => setShowPanel(true)}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + {t('stockAdjust.add')}
          </button>
        </div>

        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex gap-3">
          <input className="flex-1 max-w-sm border border-blue-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="border border-blue-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left sticky top-0">
              <tr>
                <th className="px-5 py-3 font-medium">{t('stockAdjust.adjustNo')}</th>
                <th className="px-5 py-3 font-medium">{t('stockAdjust.adjustDate')}</th>
                <th className="px-5 py-3 font-medium">{t('stockAdjust.location')}</th>
                <th className="px-5 py-3 font-medium">{t('stockAdjust.adjustType')}</th>
                <th className="px-5 py-3 font-medium">{t('stockAdjust.adjustReason')}</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : adjusts.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : adjusts.map((a) => (
                <tr key={a.id} onClick={() => navigate(`/stock-adjust/${a.id}`)}
                  className="cursor-pointer transition-colors hover:bg-blue-50">
                  <td className="px-5 py-3 font-mono font-semibold text-slate-700">{a.adjustNo}</td>
                  <td className="px-5 py-3 text-gray-500">{a.adjustDate.slice(0, 10)}</td>
                  <td className="px-5 py-3 text-gray-600">{a.location.locationName}</td>
                  <td className="px-5 py-3 text-gray-500">{a.adjustType?.name ?? '-'}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{a.adjustReason ?? '-'}</td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPanel && (
        <NewAdjustPanel onClose={() => setShowPanel(false)} onToast={showToast} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
