import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { approvalApi } from '../services/approval.service'
import type { ApprovalHeader } from '../types/approval.types'

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'REJECTED']
const TABLE_OPTIONS = ['', 'purchase_orders', 'stock_adjustments', 'stock_moves', 'goods_receives']

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-600',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}

function ApprovalDetail({
  item,
  onClose,
  onToast,
}: {
  item: ApprovalHeader
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [remarks, setRemarks] = useState('')

  const approveMutation = useMutation({
    mutationFn: () => approvalApi.approve(item.id, remarks || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approvals'] })
      onToast('Approved successfully', 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const rejectMutation = useMutation({
    mutationFn: () => approvalApi.reject(item.id, remarks),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approvals'] })
      onToast('Rejected', 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const isPending = item.status === 'PENDING'

  return (
    <div className="w-[460px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-sm">Approval #{item.id}</h2>
          <StatusBadge status={item.status} />
        </div>
        <button onClick={onClose} className="text-slate-300 hover:text-white text-lg leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {/* Header Info */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Table</p>
            <p className="text-sm font-medium text-gray-700 font-mono">{item.tableName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Record ID</p>
            <p className="text-sm font-medium text-gray-700">{item.recordId}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Requested By (ID)</p>
            <p className="text-sm font-medium text-gray-700">{item.requestedBy}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Requested Date</p>
            <p className="text-sm font-medium text-gray-700">
              {new Date(item.requestedDate).toLocaleString()}
            </p>
          </div>
          {item.approvedBy && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Approved By (ID)</p>
              <p className="text-sm font-medium text-gray-700">{item.approvedBy}</p>
            </div>
          )}
          {item.approvedDate && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Approved Date</p>
              <p className="text-sm font-medium text-gray-700">
                {new Date(item.approvedDate).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {item.remarks && (
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Remarks</p>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{item.remarks}</p>
          </div>
        )}

        {/* Logs */}
        {item.logs.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Activity Log</p>
            <div className="flex flex-col gap-2">
              {item.logs.map((log) => (
                <div key={log.id} className="flex gap-3 items-start">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    log.action === 'APPROVE' ? 'bg-green-500' :
                    log.action === 'REJECT' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      {log.action} <span className="font-normal text-gray-400">by User #{log.actionBy}</span>
                    </p>
                    {log.remarks && <p className="text-xs text-gray-500">{log.remarks}</p>}
                    <p className="text-[10px] text-gray-400">{new Date(log.actionDate).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action area — only for PENDING */}
        {isPending && (
          <div className="border-t border-gray-100 pt-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">Remarks</label>
            <textarea
              className="input resize-none"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional remarks for approve; required for reject"
            />
          </div>
        )}
      </div>

      {isPending && (
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isPending}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50"
          >
            {approveMutation.isPending ? 'Approving...' : 'Approve'}
          </button>
          <button
            onClick={() => rejectMutation.mutate()}
            disabled={rejectMutation.isPending || !remarks.trim()}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50"
          >
            {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
          </button>
          <button onClick={onClose} className="btn-secondary px-4">{t('common.cancel')}</button>
        </div>
      )}
      {!isPending && (
        <div className="px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary w-full">{t('common.back')}</button>
        </div>
      )}
    </div>
  )
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
      type === 'success' ? 'bg-green-600' : 'bg-red-500'
    }`}>{message}</div>
  )
}

export default function ApprovalPage() {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState('')
  const [tableFilter, setTableFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<ApprovalHeader | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['approvals', statusFilter, tableFilter, page],
    queryFn: () => approvalApi.getAll({
      page,
      limit: 20,
      status: statusFilter || undefined,
      tableName: tableFilter || undefined,
    }),
  })

  const list: ApprovalHeader[] = data?.data.data.data ?? []
  const totalPages = data?.data.data.totalPages ?? 1

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">Approval Requests</h1>
            <p className="text-slate-300 text-xs mt-0.5">Review and action pending approvals</p>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex gap-3">
          <select
            className="border border-blue-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.filter(Boolean).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="border border-blue-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={tableFilter}
            onChange={(e) => { setTableFilter(e.target.value); setPage(1) }}
          >
            <option value="">All Tables</option>
            {TABLE_OPTIONS.filter(Boolean).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left sticky top-0">
              <tr>
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Table</th>
                <th className="px-5 py-3 font-medium">Record ID</th>
                <th className="px-5 py-3 font-medium">Requested By</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : list.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`cursor-pointer transition-colors hover:bg-blue-50 ${selected?.id === item.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                >
                  <td className="px-5 py-3 font-mono font-semibold text-slate-700">{item.id}</td>
                  <td className="px-5 py-3 font-mono text-gray-600 text-xs">{item.tableName}</td>
                  <td className="px-5 py-3 text-gray-700">{item.recordId}</td>
                  <td className="px-5 py-3 text-gray-500">User #{item.requestedBy}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(item.requestedDate).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-5 py-3 text-gray-400 text-xs max-w-[160px] truncate">{item.remarks ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              {t('common.previous')}
            </button>
            <span>{t('common.page')} {page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </div>

      {selected && (
        <ApprovalDetail
          item={selected}
          onClose={() => setSelected(null)}
          onToast={showToast}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
