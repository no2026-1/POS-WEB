import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { purchaseOrderApi } from './purchase-order.api'
import { productApi } from '@/features/product/product.api'
import { uomApi } from '@/features/uom/uom.api'
import type { CreatePurchaseOrderLinePayload } from './purchase-order.types'

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
      type === 'success' ? 'bg-green-600' : 'bg-red-500'
    }`}>{message}</div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    RECEIVED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-500',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

const EMPTY_LINE: CreatePurchaseOrderLinePayload = { lineNo: 1, productId: 0, uomId: 0, qty: 1, price: 0, amount: 0 }

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const poId = Number(id)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().slice(0, 10))
  const [receiveRemarks, setReceiveRemarks] = useState('')
  const [showAddLine, setShowAddLine] = useState(false)
  const [lineForm, setLineForm] = useState<CreatePurchaseOrderLinePayload>({ ...EMPTY_LINE })
  const [editLineId, setEditLineId] = useState<number | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['purchase-order', poId],
    queryFn: () => purchaseOrderApi.getById(poId),
  })

  const { data: productsData } = useQuery({ queryKey: ['products-all'], queryFn: () => productApi.getAll({ limit: 100 }) })
  const { data: uomsData } = useQuery({ queryKey: ['uoms-all'], queryFn: () => uomApi.getAll({ limit: 100 }) })

  const po = data?.data.data
  const products = productsData?.data.data.data ?? []
  const uoms = uomsData?.data.data.data ?? []

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const receiveMutation = useMutation({
    mutationFn: () => purchaseOrderApi.receive(poId, receiveDate, receiveRemarks || undefined),
    onSuccess: () => { refetch(); qc.invalidateQueries({ queryKey: ['purchase-orders'] }); setShowReceiveModal(false); showToast(t('purchaseOrder.receiveSuccess'), 'success') },
    onError: (e: any) => showToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const cancelMutation = useMutation({
    mutationFn: () => purchaseOrderApi.cancel(poId),
    onSuccess: () => { refetch(); qc.invalidateQueries({ queryKey: ['purchase-orders'] }); showToast(t('purchaseOrder.cancelSuccess'), 'success') },
    onError: (e: any) => showToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const addLineMutation = useMutation({
    mutationFn: (payload: CreatePurchaseOrderLinePayload) =>
      editLineId ? purchaseOrderApi.updateLine(poId, editLineId, payload) : purchaseOrderApi.addLine(poId, payload),
    onSuccess: () => { refetch(); setShowAddLine(false); setLineForm({ ...EMPTY_LINE }); setEditLineId(null); showToast(t('common.updateSuccess'), 'success') },
    onError: (e: any) => showToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const deleteLineMutation = useMutation({
    mutationFn: (lineId: number) => purchaseOrderApi.deleteLine(poId, lineId),
    onSuccess: () => { refetch(); showToast(t('common.deleteSuccess'), 'success') },
    onError: (e: any) => showToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  function openEditLine(line: any) {
    setLineForm({ lineNo: line.lineNo, productId: line.productId, uomId: line.uomId, qty: line.qty, price: line.price, amount: line.amount, remarks: line.remarks ?? '' })
    setEditLineId(line.id)
    setShowAddLine(true)
  }

  function handleLineQtyPrice(qty: number, price: number) {
    setLineForm(f => ({ ...f, qty, price, amount: +(qty * price).toFixed(2) }))
  }

  if (isLoading) return <div className="flex items-center justify-center h-full text-gray-400">{t('common.loading')}</div>
  if (!po) return <div className="flex items-center justify-center h-full text-gray-400">Not found</div>

  const isDraft = po.status === 'DRAFT'
  const canReceive = po.status === 'APPROVED' || po.status === 'SUBMITTED' || (isDraft && !po.requireApproval)
  const canCancel = !['RECEIVED', 'CANCELLED'].includes(po.status)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/purchase-order')}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          ← {t('common.back')}
        </button>
        <span className="text-gray-300">/</span>
        <h1 className="text-lg font-bold text-gray-800">{t('purchaseOrder.title')}: {po.poNo}</h1>
        <StatusBadge status={po.status} />
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{t('purchaseOrder.vendor')}</p>
          <p className="font-semibold text-gray-800">{po.vendor.englishName}</p>
          <p className="text-xs text-gray-400">{po.vendor.vendorNo}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{t('purchaseOrder.location')}</p>
          <p className="font-medium text-gray-700">{po.location.locationName}</p>
          <p className="text-xs text-gray-400">{po.location.locationCode}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{t('purchaseOrder.poDate')}</p>
          <p className="font-medium text-gray-700">{po.poDate.slice(0, 10)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{t('purchaseOrder.amount')}</p>
          <p className="font-bold text-gray-800 text-base">{po.poAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{t('purchaseOrder.requireApproval')}</p>
          <p className="font-medium text-gray-700">{po.requireApproval ? 'Yes' : 'No'}</p>
        </div>
        {po.remarks && (
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{t('common.remarks')}</p>
            <p className="text-gray-600">{po.remarks}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        {canReceive && (
          <button onClick={() => setShowReceiveModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            {t('purchaseOrder.receive')}
          </button>
        )}
        {canCancel && (
          <button onClick={() => { if (confirm(t('common.deleteConfirmMessage'))) cancelMutation.mutate() }}
            disabled={cancelMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50">
            {t('purchaseOrder.cancel')}
          </button>
        )}
      </div>

      {/* Lines */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700 text-sm">{t('purchaseOrder.lines')} ({po.lines?.length ?? 0})</h2>
          {isDraft && (
            <button onClick={() => { setLineForm({ lineNo: (po.lines?.length ?? 0) + 1, productId: 0, uomId: 0, qty: 1, price: 0, amount: 0 }); setEditLineId(null); setShowAddLine(true) }}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">
              + {t('purchaseOrder.addLine')}
            </button>
          )}
        </div>

        {showAddLine && isDraft && (
          <div className="px-5 py-4 bg-blue-50 border-b border-blue-100">
            <div className="grid grid-cols-6 gap-3 items-end">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('product.title')} *</label>
                <select className="input text-sm" value={lineForm.productId || ''}
                  onChange={(e) => setLineForm(f => ({ ...f, productId: Number(e.target.value) }))}>
                  <option value="">{t('common.select')}...</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.productCode} - {p.productName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('uom.title')} *</label>
                <select className="input text-sm" value={lineForm.uomId || ''}
                  onChange={(e) => setLineForm(f => ({ ...f, uomId: Number(e.target.value) }))}>
                  <option value="">{t('common.select')}...</option>
                  {uoms.map((u) => <option key={u.id} value={u.id}>{u.uomCode}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('purchaseOrder.qty')} *</label>
                <input type="number" className="input text-sm" value={lineForm.qty}
                  onChange={(e) => handleLineQtyPrice(Number(e.target.value), lineForm.price)}
                  min="0.01" step="0.01" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('purchaseOrder.price')}</label>
                <input type="number" className="input text-sm" value={lineForm.price}
                  onChange={(e) => handleLineQtyPrice(lineForm.qty, Number(e.target.value))}
                  min="0" step="0.01" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => addLineMutation.mutate(lineForm)}
                  disabled={addLineMutation.isPending || !lineForm.productId || !lineForm.uomId}
                  className="btn-primary text-xs px-3 py-2 disabled:opacity-50">
                  {t('common.save')}
                </button>
                <button onClick={() => { setShowAddLine(false); setEditLineId(null) }} className="btn-secondary text-xs px-3 py-2">
                  {t('common.cancel')}
                </button>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {t('purchaseOrder.amount')}: <span className="font-semibold text-gray-700">{lineForm.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        )}

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium w-12">#</th>
              <th className="px-4 py-2 font-medium">{t('product.title')}</th>
              <th className="px-4 py-2 font-medium">{t('uom.title')}</th>
              <th className="px-4 py-2 font-medium text-right">{t('purchaseOrder.qty')}</th>
              <th className="px-4 py-2 font-medium text-right">{t('purchaseOrder.price')}</th>
              <th className="px-4 py-2 font-medium text-right">{t('purchaseOrder.amount')}</th>
              <th className="px-4 py-2 font-medium">{t('common.remarks')}</th>
              {isDraft && <th className="px-4 py-2 w-16"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!po.lines?.length ? (
              <tr><td colSpan={isDraft ? 8 : 7} className="text-center py-8 text-gray-400">{t('common.noData')}</td></tr>
            ) : po.lines.map((line) => (
              <tr key={line.id} className={`hover:bg-gray-50 ${editLineId === line.id ? 'bg-blue-50' : ''}`}>
                <td className="px-4 py-2 text-gray-400">{line.lineNo}</td>
                <td className="px-4 py-2">
                  <p className="font-medium text-gray-800">{line.product.productName}</p>
                  <p className="text-xs text-gray-400">{line.product.productCode}</p>
                </td>
                <td className="px-4 py-2 text-gray-600">{line.uom.uomCode}</td>
                <td className="px-4 py-2 text-right text-gray-700">{line.qty.toLocaleString()}</td>
                <td className="px-4 py-2 text-right text-gray-700">{line.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-2 text-right font-semibold text-gray-800">{line.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-2 text-gray-400 text-xs">{line.remarks ?? '-'}</td>
                {isDraft && (
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button onClick={() => openEditLine(line)} className="text-blue-400 hover:text-blue-600 text-xs">{t('common.edit')}</button>
                      <button onClick={() => { if (confirm(t('common.deleteConfirmMessage'))) deleteLineMutation.mutate(line.id) }}
                        className="text-red-400 hover:text-red-600 text-xs">{t('common.delete')}</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {(po.lines?.length ?? 0) > 0 && (
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={isDraft ? 5 : 4} className="px-4 py-2 text-right text-sm font-medium text-gray-500">Total</td>
                <td className="px-4 py-2 text-right font-bold text-gray-800">
                  {(po.lines ?? []).reduce((s, l) => s + l.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={isDraft ? 2 : 1}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
            <h3 className="font-bold text-gray-800 mb-4">{t('purchaseOrder.receive')}</h3>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('purchaseOrder.receivedDate')} *</label>
              <input type="date" className="input w-full" value={receiveDate} onChange={(e) => setReceiveDate(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('common.remarks')}</label>
              <textarea className="input w-full resize-none" rows={2} value={receiveRemarks} onChange={(e) => setReceiveRemarks(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => receiveMutation.mutate()}
                disabled={receiveMutation.isPending || !receiveDate}
                className="btn-primary flex-1 disabled:opacity-50">
                {receiveMutation.isPending ? t('common.saving') : t('common.confirm')}
              </button>
              <button onClick={() => setShowReceiveModal(false)} className="btn-secondary flex-1">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
