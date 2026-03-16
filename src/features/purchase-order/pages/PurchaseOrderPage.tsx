import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { purchaseOrderApi } from '../services/purchase-order.service'
import { vendorApi } from '@/features/vendor/services/vendor.service'
import { locationApi } from '@/features/location/services/location.service'
import type { PurchaseOrder, CreatePurchaseOrderPayload } from '../types/purchase-order.types'
import { genDocNo, today } from '@/utils/docNo'

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
    RECEIVED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-500',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function NewPoPanel({ onClose, onToast }: {
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const [form, setForm] = useState<CreatePurchaseOrderPayload>({
    poNo: genDocNo('PO'),
    poDate: today(),
    vendorId: 0,
    locationId: 0,
    poAmt: 0,
    requireApproval: true,
    remarks: '',
  })

  const { data: vendorsData } = useQuery({ queryKey: ['vendors-all'], queryFn: () => vendorApi.getAll({ limit: 200 }) })
  const { data: locationsData } = useQuery({ queryKey: ['locations-all'], queryFn: () => locationApi.getAll({ limit: 100 }) })

  const vendors = vendorsData?.data.data.data ?? []
  const locations = locationsData?.data.data.data ?? []

  const saveMutation = useMutation({
    mutationFn: () => purchaseOrderApi.create(form),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] })
      onToast(t('common.createSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const isValid = form.poNo && form.poDate && form.vendorId > 0 && form.locationId > 0

  return (
    <div className="w-[420px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm">{t('purchaseOrder.add')}</h2>
        <button onClick={onClose} className="text-slate-300 hover:text-white text-lg leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('purchaseOrder.poNo')}</label>
            <div className="input bg-gray-50 text-gray-500 font-mono text-sm">{form.poNo}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('purchaseOrder.poDate')} *</label>
            <input type="date" className="input" value={form.poDate}
              onChange={(e) => setForm(f => ({ ...f, poDate: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('purchaseOrder.vendor')} *</label>
          <select className="input" value={form.vendorId || ''}
            onChange={(e) => setForm(f => ({ ...f, vendorId: Number(e.target.value) }))}>
            <option value="">{t('common.select')}...</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>{v.vendorNo} - {v.englishName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('purchaseOrder.location')} *</label>
          <select className="input" value={form.locationId || ''}
            onChange={(e) => setForm(f => ({ ...f, locationId: Number(e.target.value) }))}>
            <option value="">{t('common.select')}...</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.locationCode} - {l.locationName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('purchaseOrder.amount')}</label>
          <input type="number" className="input" value={form.poAmt ?? 0}
            onChange={(e) => setForm(f => ({ ...f, poAmt: Number(e.target.value) }))}
            min="0" step="0.01" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="requireApproval" checked={form.requireApproval ?? true}
            onChange={(e) => setForm(f => ({ ...f, requireApproval: e.target.checked }))}
            className="w-4 h-4 accent-blue-600" />
          <label htmlFor="requireApproval" className="text-xs font-medium text-gray-600">
            {t('purchaseOrder.requireApproval')}
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

const STATUSES = ['DRAFT', 'SUBMITTED', 'APPROVED', 'RECEIVED', 'CANCELLED']

export default function PurchaseOrderPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showPanel, setShowPanel] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', statusFilter],
    queryFn: () => purchaseOrderApi.getAll({ limit: 100, status: statusFilter || undefined }),
  })

  const allPos = data?.data.data ?? []
  const pos = search.trim()
    ? allPos.filter((p) => p.poNo.toLowerCase().includes(search.toLowerCase()) || p.vendor.englishName.toLowerCase().includes(search.toLowerCase()))
    : allPos

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{t('purchaseOrder.title')}</h1>
            <p className="text-slate-300 text-xs mt-0.5">{pos.length} / {allPos.length} {t('common.items')}</p>
          </div>
          <button onClick={() => setShowPanel(true)}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + {t('purchaseOrder.add')}
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
                <th className="px-5 py-3 font-medium">{t('purchaseOrder.poNo')}</th>
                <th className="px-5 py-3 font-medium">{t('purchaseOrder.poDate')}</th>
                <th className="px-5 py-3 font-medium">{t('purchaseOrder.vendor')}</th>
                <th className="px-5 py-3 font-medium">{t('purchaseOrder.location')}</th>
                <th className="px-5 py-3 font-medium text-right">{t('purchaseOrder.amount')}</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : pos.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : pos.map((po) => (
                <tr key={po.id} onClick={() => navigate(`/purchase-order/${po.id}`)}
                  className="cursor-pointer transition-colors hover:bg-blue-50">
                  <td className="px-5 py-3">
                    <p className="font-mono font-semibold text-slate-700">{po.poNo}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{po.poDate.slice(0, 10)}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{po.vendor.englishName}</p>
                    <p className="text-xs text-gray-400">{po.vendor.vendorNo}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{po.location.locationName}</td>
                  <td className="px-5 py-3 text-right font-medium text-gray-700">
                    {Number(po.poAmt) > 0 ? Number(po.poAmt).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={po.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPanel && (
        <NewPoPanel onClose={() => setShowPanel(false)} onToast={showToast} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
