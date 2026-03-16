import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { stockMoveApi } from '../services/stock-move.service'
import { productApi } from '@/features/product/services/product.service'
import { uomApi } from '@/features/uom/services/uom.service'
import type { CreateStockMoveLinePayload } from '../types/stock-move.types'

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
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-500',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

const EMPTY_LINE: CreateStockMoveLinePayload = { lineNo: 1, productId: 0, uomId: 0, qty: 1 }

export default function StockMoveDetailPage() {
  const { id } = useParams<{ id: string }>()
  const moveId = Number(id)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showAddLine, setShowAddLine] = useState(false)
  const [lineForm, setLineForm] = useState<CreateStockMoveLinePayload>({ ...EMPTY_LINE })
  const [editLineId, setEditLineId] = useState<number | null>(null)
  const [confirmAction, setConfirmAction] = useState<'approve' | 'confirm' | 'cancel' | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['stock-move', moveId],
    queryFn: () => stockMoveApi.getById(moveId),
  })

  const { data: productsData } = useQuery({ queryKey: ['products-all'], queryFn: () => productApi.getAll({ limit: 100 }) })
  const { data: uomsData } = useQuery({ queryKey: ['uoms-all'], queryFn: () => uomApi.getAll({ limit: 100 }) })

  const move = data?.data.data
  const products = productsData?.data.data.data ?? []
  const uoms = uomsData?.data.data.data ?? []

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const actionMutation = useMutation({
    mutationFn: () => {
      if (confirmAction === 'approve') return stockMoveApi.approve(moveId)
      if (confirmAction === 'confirm') return stockMoveApi.confirm(moveId)
      return stockMoveApi.cancel(moveId)
    },
    onSuccess: () => {
      refetch()
      qc.invalidateQueries({ queryKey: ['stock-moves'] })
      setConfirmAction(null)
      showToast(t('common.updateSuccess'), 'success')
    },
    onError: (e: any) => showToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const addLineMutation = useMutation({
    mutationFn: (payload: CreateStockMoveLinePayload) =>
      editLineId ? stockMoveApi.updateLine(moveId, editLineId, payload) : stockMoveApi.addLine(moveId, payload),
    onSuccess: () => {
      refetch()
      setShowAddLine(false)
      setLineForm({ ...EMPTY_LINE })
      setEditLineId(null)
      showToast(t('common.updateSuccess'), 'success')
    },
    onError: (e: any) => showToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const deleteLineMutation = useMutation({
    mutationFn: (lineId: number) => stockMoveApi.deleteLine(moveId, lineId),
    onSuccess: () => { refetch(); showToast(t('common.deleteSuccess'), 'success') },
    onError: (e: any) => showToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  function openEditLine(line: any) {
    setLineForm({ lineNo: line.lineNo, productId: line.productId, uomId: line.uomId, qty: line.qty, remarks: line.remarks ?? '' })
    setEditLineId(line.id)
    setShowAddLine(true)
  }

  if (isLoading) return <div className="flex items-center justify-center h-full text-gray-400">{t('common.loading')}</div>
  if (!move) return <div className="flex items-center justify-center h-full text-gray-400">Not found</div>

  const isDraft = move.status === 'DRAFT'
  const canApprove = move.requireApproval && move.status === 'DRAFT'
  const canConfirm = move.status === 'APPROVED' || (!move.requireApproval && isDraft)
  const canCancel = !['CONFIRMED', 'CANCELLED'].includes(move.status)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/stock-move')}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          ← {t('common.back')}
        </button>
        <span className="text-gray-300">/</span>
        <h1 className="text-lg font-bold text-gray-800">{t('stockMove.title')}: {move.moveNo}</h1>
        <StatusBadge status={move.status} />
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{t('stockMove.locationFrom')}</p>
          <p className="font-semibold text-gray-800">{move.locationFrom?.locationName}</p>
          <p className="text-xs text-gray-400">{move.locationFrom?.locationCode}</p>
        </div>
        <div className="flex items-center">
          <div className="text-2xl text-gray-300 mr-3">→</div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{t('stockMove.locationTo')}</p>
            <p className="font-semibold text-gray-800">{move.locationTo?.locationName}</p>
            <p className="text-xs text-gray-400">{move.locationTo?.locationCode}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{t('stockMove.moveDate')}</p>
          <p className="font-medium text-gray-700">{move.moveDate?.slice(0, 10)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{t('stockMove.requireApproval')}</p>
          <p className="font-medium text-gray-700">{move.requireApproval ? 'Yes' : 'No'}</p>
        </div>
        {move.remarks && (
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{t('common.remarks')}</p>
            <p className="text-gray-600">{move.remarks}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!confirmAction ? (
        <div className="flex gap-2 mb-4">
          {canApprove && (
            <button onClick={() => setConfirmAction('approve')}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              {t('stockMove.approve')}
            </button>
          )}
          {canConfirm && (
            <button onClick={() => setConfirmAction('confirm')}
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              {t('stockMove.confirm')}
            </button>
          )}
          {canCancel && (
            <button onClick={() => setConfirmAction('cancel')}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              {t('stockMove.cancel')}
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-2 mb-4 items-center bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
          <p className="text-sm text-gray-600 flex-1">{t('common.deleteConfirmMessage')}</p>
          <button onClick={() => actionMutation.mutate()}
            disabled={actionMutation.isPending}
            className={`text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-50 ${
              confirmAction === 'cancel' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}>
            {actionMutation.isPending ? t('common.saving') : t('common.confirm')}
          </button>
          <button onClick={() => setConfirmAction(null)} className="btn-secondary text-sm px-3 py-1.5">
            {t('common.cancel')}
          </button>
        </div>
      )}

      {/* Lines */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700 text-sm">{t('stockMove.lines')} ({move.lines?.length ?? 0})</h2>
          {isDraft && (
            <button
              onClick={() => {
                setLineForm({ lineNo: (move.lines?.length ?? 0) + 1, productId: 0, uomId: 0, qty: 1 })
                setEditLineId(null)
                setShowAddLine(true)
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">
              + {t('stockMove.addLine')}
            </button>
          )}
        </div>

        {showAddLine && isDraft && (
          <div className="px-5 py-4 bg-blue-50 border-b border-blue-100">
            <div className="grid grid-cols-5 gap-3 items-end">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('product.title')} *</label>
                <select className="input text-sm" value={lineForm.productId || ''}
                  onChange={(e) => setLineForm(f => ({ ...f, productId: Number(e.target.value) }))}>
                  <option value="">{t('common.select')}...</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.productCode} - {p.productName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('uom.title')} *</label>
                <select className="input text-sm" value={lineForm.uomId || ''}
                  onChange={(e) => setLineForm(f => ({ ...f, uomId: Number(e.target.value) }))}>
                  <option value="">{t('common.select')}...</option>
                  {uoms.map((u: any) => <option key={u.id} value={u.id}>{u.uomCode}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('stockMove.qty')} *</label>
                <input type="number" className="input text-sm" value={lineForm.qty}
                  onChange={(e) => setLineForm(f => ({ ...f, qty: Number(e.target.value) }))}
                  min="0.01" step="0.01" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => addLineMutation.mutate(lineForm)}
                  disabled={addLineMutation.isPending || !lineForm.productId || !lineForm.uomId}
                  className="btn-primary text-xs px-3 py-2 disabled:opacity-50">
                  {t('common.save')}
                </button>
                <button onClick={() => { setShowAddLine(false); setEditLineId(null) }}
                  className="btn-secondary text-xs px-3 py-2">
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium w-12">#</th>
              <th className="px-4 py-2 font-medium">{t('product.title')}</th>
              <th className="px-4 py-2 font-medium">{t('uom.title')}</th>
              <th className="px-4 py-2 font-medium text-right">{t('stockMove.qty')}</th>
              <th className="px-4 py-2 font-medium">{t('common.remarks')}</th>
              {isDraft && <th className="px-4 py-2 w-20"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!move.lines?.length ? (
              <tr><td colSpan={isDraft ? 6 : 5} className="text-center py-8 text-gray-400">{t('common.noData')}</td></tr>
            ) : move.lines.map((line: any) => (
              <tr key={line.id} className={`hover:bg-gray-50 ${editLineId === line.id ? 'bg-blue-50' : ''}`}>
                <td className="px-4 py-2 text-gray-400">{line.lineNo}</td>
                <td className="px-4 py-2">
                  <p className="font-medium text-gray-800">{line.product?.productName}</p>
                  <p className="text-xs text-gray-400">{line.product?.productCode}</p>
                </td>
                <td className="px-4 py-2 text-gray-600">{line.uom?.uomCode}</td>
                <td className="px-4 py-2 text-right font-semibold text-blue-700">
                  {Number(line.qty).toLocaleString()}
                </td>
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
        </table>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
