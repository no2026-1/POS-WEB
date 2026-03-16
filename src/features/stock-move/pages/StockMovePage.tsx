import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { stockMoveApi } from '../services/stock-move.service'
import { locationApi } from '@/features/location/services/location.service'
import type { CreateStockMovePayload } from '../types/stock-move.types'
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
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-500',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function NewMovePanel({ onClose, onToast }: {
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const navigate = useNavigate()

  const [form, setForm] = useState<CreateStockMovePayload>({
    moveNo: genDocNo('MOV'),
    moveDate: today(),
    locationFromId: 0,
    locationToId: 0,
    requireApproval: false,
    remarks: '',
  })

  const { data: locationsData } = useQuery({
    queryKey: ['locations-all'],
    queryFn: () => locationApi.getAll({ limit: 100 }),
  })
  const locations = locationsData?.data.data.data ?? []

  const createMutation = useMutation({
    mutationFn: () => stockMoveApi.create(form),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['stock-moves'] })
      onToast(t('common.createSuccess'), 'success')
      onClose()
      navigate(`/stock-move/${res.data.data.id}`)
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const canSubmit = form.moveNo && form.locationFromId > 0 && form.locationToId > 0 && form.locationFromId !== form.locationToId

  return (
    <div className="w-[420px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-bold text-gray-800 text-sm">{t('stockMove.new')}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('stockMove.moveNo')}</label>
            <div className="input bg-gray-50 text-gray-500 font-mono text-sm">{form.moveNo}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('stockMove.moveDate')} *</label>
            <input type="date" className="input" value={form.moveDate}
              onChange={(e) => setForm(f => ({ ...f, moveDate: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('stockMove.locationFrom')} *</label>
          <select className="input" value={form.locationFromId || ''}
            onChange={(e) => setForm(f => ({ ...f, locationFromId: Number(e.target.value) }))}>
            <option value="">— {t('common.select')} —</option>
            {locations.map((l: any) => (
              <option key={l.id} value={l.id} disabled={l.id === form.locationToId}>
                {l.locationCode} - {l.locationName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('stockMove.locationTo')} *</label>
          <select className="input" value={form.locationToId || ''}
            onChange={(e) => setForm(f => ({ ...f, locationToId: Number(e.target.value) }))}>
            <option value="">— {t('common.select')} —</option>
            {locations.map((l: any) => (
              <option key={l.id} value={l.id} disabled={l.id === form.locationFromId}>
                {l.locationCode} - {l.locationName}
              </option>
            ))}
          </select>
          {form.locationFromId && form.locationToId && form.locationFromId === form.locationToId && (
            <p className="text-xs text-red-500 mt-1">From and To location must be different</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="requireApproval" checked={form.requireApproval ?? false}
            onChange={(e) => setForm(f => ({ ...f, requireApproval: e.target.checked }))} />
          <label htmlFor="requireApproval" className="text-sm text-gray-600">{t('stockMove.requireApproval')}</label>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('common.remarks')}</label>
          <textarea className="input resize-none" rows={2} value={form.remarks ?? ''}
            onChange={(e) => setForm(f => ({ ...f, remarks: e.target.value }))} />
        </div>
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
        <button onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending || !canSubmit}
          className="btn-primary flex-1 py-2 text-sm disabled:opacity-50">
          {createMutation.isPending ? t('common.saving') : t('common.create')}
        </button>
        <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">{t('common.cancel')}</button>
      </div>
    </div>
  )
}

export default function StockMovePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showPanel, setShowPanel] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['stock-moves', page, statusFilter],
    queryFn: () => stockMoveApi.getAll({ page, limit: 20, status: statusFilter || undefined }),
  })

  const moves = data?.data.data.data ?? []
  const total = data?.data.data.total ?? 0
  const totalPages = data?.data.data.totalPages ?? 1

  const cancelMutation = useMutation({
    mutationFn: (id: number) => stockMoveApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-moves'] })
      showToast(t('common.updateSuccess'), 'success')
    },
    onError: (e: any) => showToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{t('stockMove.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('stockMove.subtitle')}</p>
        </div>
        <button onClick={() => setShowPanel(true)} className="btn-primary px-4 py-2 text-sm">
          + {t('stockMove.new')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input className="input max-w-xs" placeholder={t('common.search') + '...'} value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-[160px]" value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">{t('common.allStatus')}</option>
          <option value="DRAFT">DRAFT</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="APPROVED">APPROVED</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-gray-500 text-left">
                <th className="px-4 py-3 font-medium">{t('stockMove.moveNo')}</th>
                <th className="px-4 py-3 font-medium">{t('stockMove.moveDate')}</th>
                <th className="px-4 py-3 font-medium">{t('stockMove.locationFrom')}</th>
                <th className="px-4 py-3 font-medium">{t('stockMove.locationTo')}</th>
                <th className="px-4 py-3 font-medium">{t('common.status')}</th>
                <th className="px-4 py-3 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">{t('common.loading')}</td></tr>
              ) : moves.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">{t('common.noData')}</td></tr>
              ) : moves.filter((m: any) => !search || m.moveNo.includes(search.toUpperCase())).map((move: any) => (
                <tr key={move.id} className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/stock-move/${move.id}`)}>
                  <td className="px-4 py-3 font-medium text-indigo-700">{move.moveNo}</td>
                  <td className="px-4 py-3 text-gray-600">{move.moveDate?.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-800">{move.locationFrom?.locationName}</p>
                    <p className="text-xs text-gray-400">{move.locationFrom?.locationCode}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-800">{move.locationTo?.locationName}</p>
                    <p className="text-xs text-gray-400">{move.locationTo?.locationCode}</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={move.status} /></td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {move.status === 'DRAFT' && (
                      <button onClick={() => cancelMutation.mutate(move.id)}
                        className="text-red-400 hover:text-red-600 text-xs">
                        {t('common.cancel')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between text-sm text-gray-500">
          <span>{t('common.total')}: {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">←</button>
            <span className="px-2 py-1">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">→</button>
          </div>
        </div>
      </div>

      {/* Side panel */}
      {showPanel && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/20" onClick={() => setShowPanel(false)} />
          <NewMovePanel onClose={() => setShowPanel(false)} onToast={showToast} />
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
