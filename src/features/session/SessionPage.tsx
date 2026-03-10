import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { sessionApi } from './session.api'
import { posConfigApi } from '@/features/pos-config/pos-config.api'
import { useAuthStore } from '@/stores/auth.store'
import type { Session, CreateSessionPayload } from './session.types'

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
      type === 'success' ? 'bg-green-600' : 'bg-red-500'
    }`}>{message}</div>
  )
}

function OpenSessionPanel({ onClose, onToast }: {
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const today = new Date()
  const sessionNo = `SES${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}${String(today.getHours()).padStart(2, '0')}${String(today.getMinutes()).padStart(2, '0')}`

  const [form, setForm] = useState<CreateSessionPayload>({
    sessionNo,
    posConfigId: 0,
    userId: user?.id ?? 0,
    openingBalance: 0,
    remarks: '',
  })

  const { data: configsData } = useQuery({ queryKey: ['pos-configs'], queryFn: () => posConfigApi.getAll({ limit: 100 }) })
  const configs = configsData?.data.data.data ?? []

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: any = { ...form }
      if (!payload.remarks) delete payload.remarks
      return sessionApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      onToast(t('session.openSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const isValid = form.sessionNo.trim() && form.posConfigId > 0 && form.userId > 0

  return (
    <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm">{t('session.open')}</h2>
        <button onClick={onClose} className="text-slate-300 hover:text-white text-lg leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('session.sessionNo')} *</label>
          <input className="input" value={form.sessionNo}
            onChange={(e) => setForm(f => ({ ...f, sessionNo: e.target.value }))} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('session.posConfig')} *</label>
          <select className="input" value={form.posConfigId || ''}
            onChange={(e) => setForm(f => ({ ...f, posConfigId: Number(e.target.value) }))}>
            <option value="">{t('common.select')}...</option>
            {configs.map((c) => <option key={c.id} value={c.id}>{c.configCode} — {c.configName}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('session.openingBalance')}</label>
          <input type="number" className="input" value={form.openingBalance}
            onChange={(e) => setForm(f => ({ ...f, openingBalance: Number(e.target.value) }))}
            min="0" step="0.01" />
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
          {saveMutation.isPending ? t('common.saving') : t('session.openBtn')}
        </button>
        <button onClick={onClose} className="btn-secondary w-full">{t('common.cancel')}</button>
      </div>
    </div>
  )
}

function CloseSessionModal({ session, onClose, onToast }: {
  session: Session
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [closingBalance, setClosingBalance] = useState(0)
  const [remarks, setRemarks] = useState('')

  const closeMutation = useMutation({
    mutationFn: () => sessionApi.close(session.id, { closingBalance, remarks: remarks || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      onToast(t('session.closeSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
        <h3 className="font-bold text-gray-800 mb-1">{t('session.close')}</h3>
        <p className="text-xs text-gray-400 mb-4">{session.sessionNo} — {session.posConfig?.configName}</p>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('session.closingBalance')}</label>
          <input type="number" className="input w-full" value={closingBalance}
            onChange={(e) => setClosingBalance(Number(e.target.value))} min="0" step="0.01" />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('common.remarks')}</label>
          <textarea className="input w-full resize-none" rows={2} value={remarks}
            onChange={(e) => setRemarks(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => closeMutation.mutate()}
            disabled={closeMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg flex-1 disabled:opacity-50">
            {closeMutation.isPending ? t('common.saving') : t('session.closeBtn')}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">{t('common.cancel')}</button>
        </div>
      </div>
    </div>
  )
}

export default function SessionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<'' | 'OPEN' | 'CLOSED'>('')
  const [showOpenPanel, setShowOpenPanel] = useState(false)
  const [closeTarget, setCloseTarget] = useState<Session | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['sessions', statusFilter],
    queryFn: () => sessionApi.getAll({ limit: 100, status: statusFilter || undefined }),
  })

  const sessions = data?.data.data.data ?? []

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{t('session.title')}</h1>
            <p className="text-slate-300 text-xs mt-0.5">{sessions.length} {t('common.items')}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/pos')}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              {t('session.goToPOS')}
            </button>
            <button onClick={() => setShowOpenPanel(true)}
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              + {t('session.open')}
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex gap-3">
          <select className="border border-blue-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="">All Status</option>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left sticky top-0">
              <tr>
                <th className="px-5 py-3 font-medium">{t('session.sessionNo')}</th>
                <th className="px-5 py-3 font-medium">{t('session.posConfig')}</th>
                <th className="px-5 py-3 font-medium">{t('session.cashier')}</th>
                <th className="px-5 py-3 font-medium text-right">{t('session.openingBalance')}</th>
                <th className="px-5 py-3 font-medium text-right">{t('session.closingBalance')}</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : sessions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : sessions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono font-semibold text-slate-700">{s.sessionNo}</td>
                  <td className="px-5 py-3 text-gray-600">{s.posConfig?.configName ?? '-'}</td>
                  <td className="px-5 py-3 text-gray-600">{s.user?.fullName ?? s.user?.username ?? '-'}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{s.openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3 text-right text-gray-700">
                    {s.closingBalance != null ? s.closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      {s.status === 'OPEN' && (
                        <>
                          <button onClick={() => navigate('/pos')}
                            className="text-xs text-blue-500 hover:text-blue-700 font-medium">
                            {t('session.goToPOS')}
                          </button>
                          <button onClick={() => setCloseTarget(s)}
                            className="text-xs text-red-400 hover:text-red-600 font-medium">
                            {t('session.close')}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showOpenPanel && (
        <OpenSessionPanel onClose={() => setShowOpenPanel(false)} onToast={showToast} />
      )}
      {closeTarget && (
        <CloseSessionModal session={closeTarget}
          onClose={() => setCloseTarget(null)} onToast={showToast} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
