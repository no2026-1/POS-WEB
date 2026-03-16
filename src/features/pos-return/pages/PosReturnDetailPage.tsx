import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { posReturnApi } from '../services/pos-return.service'

function statusBadge(status: string) {
  const map: Record<string, string> = {
    DRAFT: 'bg-yellow-100 text-yellow-700',
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

export default function PosReturnDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirmAction, setConfirmAction] = useState<'confirm' | 'cancel' | null>(null)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['pos-return', id],
    queryFn: () => posReturnApi.getById(Number(id)),
    enabled: !!id,
  })
  const ret = data?.data.data

  const confirmMutation = useMutation({
    mutationFn: () => posReturnApi.confirm(Number(id)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pos-return', id] }); qc.invalidateQueries({ queryKey: ['pos-returns'] }); setConfirmAction(null); showToast(t('posReturn.confirmSuccess'), 'success') },
    onError: (e: any) => showToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const cancelMutation = useMutation({
    mutationFn: () => posReturnApi.cancel(Number(id)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pos-return', id] }); qc.invalidateQueries({ queryKey: ['pos-returns'] }); setConfirmAction(null); showToast(t('posReturn.cancelSuccess'), 'success') },
    onError: (e: any) => showToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  if (isLoading) return <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
  if (!ret) return <div className="text-center py-12 text-gray-400">Return not found</div>

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate('/pos-return')} className="text-sm text-blue-500 hover:underline mb-4 flex items-center gap-1">
        ← {t('common.back')}
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{ret.returnNo}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {ret.returnDate?.slice(0, 10)} · PO: <span className="font-medium text-gray-600">{ret.posOrder?.posNo ?? `#${ret.posOrderId}`}</span>
            </p>
            <div className="mt-2 flex gap-2 items-center">
              <span className={statusBadge(ret.status)}>{ret.status}</span>
              {ret.remarks && <span className="text-xs text-gray-400">{ret.remarks}</span>}
            </div>
          </div>

          {ret.status === 'DRAFT' && (
            <div className="flex gap-2">
              <button onClick={() => setConfirmAction('confirm')}
                className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg font-medium">
                {t('posReturn.confirm')}
              </button>
              <button onClick={() => setConfirmAction('cancel')}
                className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg font-medium">
                {t('posReturn.cancel')}
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">{t('posReturn.returnAmt')}</p>
            <p className="font-bold text-gray-800">{Number(ret.returnAmt).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">{t('posReturn.refundAmt')}</p>
            <p className="font-bold text-gray-800">{Number(ret.refundAmt).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Lines */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-700 text-sm">{t('posReturn.lines')} ({(ret.lines ?? []).length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">#</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">{t('product.title')}</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">{t('purchaseOrder.qty')}</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">{t('purchaseOrder.price')}</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">{t('posReturn.amount')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(ret.lines ?? []).length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">{t('common.noData')}</td></tr>
            ) : (ret.lines ?? []).map((line: any) => (
              <tr key={line.id}>
                <td className="px-4 py-3 text-gray-400">{line.lineNo}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{line.product?.productName ?? `Product #${line.productId}`}</p>
                  <p className="text-xs text-gray-400">{line.product?.productCode}</p>
                </td>
                <td className="px-4 py-3 text-right text-gray-700">{Number(line.qty)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{Number(line.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">{Number(line.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80">
            <h3 className="font-bold text-gray-800 mb-2">
              {confirmAction === 'confirm' ? t('posReturn.confirm') : t('posReturn.cancel')}
            </h3>
            <p className="text-sm text-gray-500 mb-5">{t('common.deleteConfirmMessage')}</p>
            <div className="flex gap-2">
              <button
                onClick={() => confirmAction === 'confirm' ? confirmMutation.mutate() : cancelMutation.mutate()}
                disabled={confirmMutation.isPending || cancelMutation.isPending}
                className={`flex-1 text-white text-sm py-2 rounded-lg font-medium disabled:opacity-50 ${confirmAction === 'confirm' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                {(confirmMutation.isPending || cancelMutation.isPending) ? t('common.saving') : t('common.confirm')}
              </button>
              <button onClick={() => setConfirmAction(null)} className="btn-secondary px-4 text-sm">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
