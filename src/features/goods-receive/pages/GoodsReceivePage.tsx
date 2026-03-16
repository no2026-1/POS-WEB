import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { goodsReceiveApi } from '../services/goods-receive.service'
import { locationApi } from '@/features/location/services/location.service'
import { purchaseOrderApi } from '@/features/purchase-order/services/purchase-order.service'
import type { GoodsReceive, CreateGoodsReceivePayload } from '../types/goods-receive.types'
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
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-500',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function GrPanel({ gr, onClose, onToast }: {
  gr: GoodsReceive | null
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const isEdit = !!gr

  const [form, setForm] = useState<CreateGoodsReceivePayload>({
    grNo: gr?.grNo ?? genDocNo('GR'),
    grDate: gr?.grDate?.slice(0, 10) ?? today(),
    purchaseOrderId: gr?.purchaseOrderId ?? 0,
    locationId: gr?.locationId ?? 0,
    grAmt: gr?.grAmt ?? 0,
    remarks: gr?.remarks ?? '',
  })
  const [confirmAction, setConfirmAction] = useState<'confirm' | 'cancel' | null>(null)

  const { data: locationsData } = useQuery({ queryKey: ['locations-all'], queryFn: () => locationApi.getAll({ limit: 100 }) })
  const { data: posData } = useQuery({ queryKey: ['purchase-orders-all'], queryFn: () => purchaseOrderApi.getAll({ limit: 100 }) })

  const locations = locationsData?.data.data.data ?? []
  const allPos = posData?.data.data ?? []
  // Only show POs that are not yet fully received (DRAFT, SUBMITTED, APPROVED)
  const availablePos = allPos.filter((p: any) => !['RECEIVED', 'CANCELLED'].includes(p.status))

  const selectedPo = allPos.find((p: any) => p.id === form.purchaseOrderId)

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = { ...form }
      if (!payload.grAmt) delete payload.grAmt
      if (!payload.remarks) delete payload.remarks
      return isEdit ? goodsReceiveApi.update(gr!.id, payload) : goodsReceiveApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goods-receives'] })
      onToast(isEdit ? t('common.updateSuccess') : t('common.createSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const confirmMutation = useMutation({
    mutationFn: () => confirmAction === 'confirm' ? goodsReceiveApi.confirm(gr!.id) : goodsReceiveApi.cancel(gr!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goods-receives'] })
      onToast(t('common.updateSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const isDraft = gr?.status === 'DRAFT' || !isEdit
  const isValid = form.grNo && form.grDate && form.purchaseOrderId > 0 && form.locationId > 0

  return (
    <div className="w-[460px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-sm">{isEdit ? t('goodsReceive.edit') : t('goodsReceive.add')}</h2>
          {isEdit && <StatusBadge status={gr!.status} />}
        </div>
        <button onClick={onClose} className="text-slate-300 hover:text-white text-lg leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('goodsReceive.grNo')}</label>
            <div className="input bg-gray-50 text-gray-500 font-mono text-sm">{form.grNo}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('goodsReceive.grDate')} *</label>
            <input type="date" className="input" value={form.grDate}
              onChange={(e) => setForm(f => ({ ...f, grDate: e.target.value }))}
              disabled={!isDraft} />
          </div>
        </div>

        {/* Purchase Order selector */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('goodsReceive.poNo')} *</label>
          {isEdit ? (
            <div className="input bg-gray-50 text-gray-700">
              {gr?.purchaseOrder?.poNo} ({gr?.purchaseOrder?.status})
            </div>
          ) : (
            <select className="input" value={form.purchaseOrderId || ''}
              onChange={(e) => {
                const poId = Number(e.target.value)
                const po = availablePos.find((p: any) => p.id === poId)
                setForm(f => ({ ...f, purchaseOrderId: poId, locationId: po?.locationId ?? f.locationId }))
              }}>
              <option value="">{t('common.select')}...</option>
              {availablePos.map((po: any) => (
                <option key={po.id} value={po.id}>
                  {po.poNo} — {po.vendor?.englishName ?? ''} [{po.status}]
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Show selected PO details */}
        {selectedPo && (
          <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700 space-y-0.5">
            <p><span className="font-medium">Vendor:</span> {selectedPo.vendor?.englishName}</p>
            <p><span className="font-medium">Location:</span> {selectedPo.location?.locationName}</p>
            <p><span className="font-medium">Amount:</span> {Number(selectedPo.poAmt).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            {(selectedPo.lines?.length ?? 0) > 0 && (
              <p><span className="font-medium">Lines:</span> {selectedPo.lines.length} items</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('goodsReceive.location')} *</label>
          <select className="input" value={form.locationId || ''}
            onChange={(e) => setForm(f => ({ ...f, locationId: Number(e.target.value) }))}
            disabled={!isDraft}>
            <option value="">{t('common.select')}...</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.locationCode} - {l.locationName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('goodsReceive.amount')}</label>
          <input type="number" className="input" value={form.grAmt ?? 0}
            onChange={(e) => setForm(f => ({ ...f, grAmt: Number(e.target.value) }))}
            disabled={!isDraft} min="0" step="0.01" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('common.remarks')}</label>
          <textarea className="input resize-none" rows={2} value={form.remarks}
            onChange={(e) => setForm(f => ({ ...f, remarks: e.target.value }))}
            disabled={!isDraft} />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
          <p className="font-medium mb-0.5">ℹ️ หมายเหตุ</p>
          <p>GR เป็นเอกสารรับของ — Stock จะเพิ่มเมื่อ <strong>Receive PO</strong> (หน้า Purchase Order)</p>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-2">
        {!confirmAction ? (
          <>
            {isDraft && (
              <button onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !isValid}
                className="btn-primary w-full disabled:opacity-50">
                {saveMutation.isPending ? t('common.saving') : t('common.save')}
              </button>
            )}
            {isEdit && isDraft && (
              <button onClick={() => setConfirmAction('confirm')}
                className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 rounded-lg w-full transition">
                {t('goodsReceive.confirm')}
              </button>
            )}
            {isEdit && !['CONFIRMED', 'CANCELLED'].includes(gr!.status) && (
              <button onClick={() => setConfirmAction('cancel')}
                className="bg-red-100 hover:bg-red-200 text-red-600 text-sm font-medium py-2 rounded-lg w-full transition">
                {t('goodsReceive.cancel')}
              </button>
            )}
            <button onClick={onClose} className="btn-secondary w-full">{t('common.cancel')}</button>
          </>
        ) : (
          <>
            <p className="text-xs text-center text-gray-500">{t('common.deleteConfirmMessage')}</p>
            <button onClick={() => confirmMutation.mutate()}
              disabled={confirmMutation.isPending}
              className={`text-white text-sm font-medium px-4 py-2 rounded-lg w-full disabled:opacity-50 ${
                confirmAction === 'confirm' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
              }`}>
              {confirmMutation.isPending ? t('common.saving') : t('common.confirm')}
            </button>
            <button onClick={() => setConfirmAction(null)} className="btn-secondary w-full">{t('common.cancel')}</button>
          </>
        )}
      </div>
    </div>
  )
}

const STATUSES = ['DRAFT', 'CONFIRMED', 'CANCELLED']

export default function GoodsReceivePage() {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState('')
  const [panel, setPanel] = useState<{ open: boolean; gr: GoodsReceive | null }>({ open: false, gr: null })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['goods-receives', statusFilter],
    queryFn: () => goodsReceiveApi.getAll({ limit: 100, status: statusFilter || undefined }),
  })

  const grs = data?.data.data ?? []

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{t('goodsReceive.title')}</h1>
            <p className="text-slate-300 text-xs mt-0.5">{grs.length} {t('common.items')}</p>
          </div>
          <button onClick={() => setPanel({ open: true, gr: null })}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + {t('goodsReceive.add')}
          </button>
        </div>

        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex gap-3">
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
                <th className="px-5 py-3 font-medium">{t('goodsReceive.grNo')}</th>
                <th className="px-5 py-3 font-medium">{t('goodsReceive.grDate')}</th>
                <th className="px-5 py-3 font-medium">{t('goodsReceive.poNo')}</th>
                <th className="px-5 py-3 font-medium">{t('goodsReceive.location')}</th>
                <th className="px-5 py-3 font-medium text-right">{t('goodsReceive.amount')}</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : grs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : grs.map((gr) => (
                <tr key={gr.id} onClick={() => setPanel({ open: true, gr })}
                  className={`cursor-pointer transition-colors hover:bg-blue-50 ${panel.gr?.id === gr.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                  <td className="px-5 py-3 font-mono font-semibold text-slate-700">{gr.grNo}</td>
                  <td className="px-5 py-3 text-gray-500">{gr.grDate.slice(0, 10)}</td>
                  <td className="px-5 py-3 text-blue-600 font-medium">{gr.purchaseOrder.poNo}</td>
                  <td className="px-5 py-3 text-gray-600">{gr.location.locationName}</td>
                  <td className="px-5 py-3 text-right font-medium text-gray-700">
                    {Number(gr.grAmt) > 0 ? Number(gr.grAmt).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={gr.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {panel.open && (
        <GrPanel gr={panel.gr}
          onClose={() => setPanel({ open: false, gr: null })} onToast={showToast} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
