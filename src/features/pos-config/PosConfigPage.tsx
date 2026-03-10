import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { posConfigApi } from './pos-config.api'
import { branchApi } from '@/features/branch/branch.api'
import { locationApi } from '@/features/location/location.api'
import type { PosConfig, CreatePosConfigPayload } from './pos-config.types'

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
      type === 'success' ? 'bg-green-600' : 'bg-red-500'
    }`}>{message}</div>
  )
}

function PosConfigPanel({ config, onClose, onToast }: {
  config: PosConfig | null
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const isEdit = !!config

  const [form, setForm] = useState<CreatePosConfigPayload>({
    configCode: config?.configCode ?? '',
    configName: config?.configName ?? '',
    branchId: config?.branchId ?? 0,
    locationId: config?.locationId,
    autoProcess: config?.autoProcess ?? false,
    requireApproval: config?.requireApproval ?? true,
    allowReturnRefund: config?.allowReturnRefund ?? true,
    returnDays: config?.returnDays ?? 7,
    remarks: config?.remarks ?? '',
  })

  const { data: branchesData } = useQuery({ queryKey: ['branches-all'], queryFn: () => branchApi.getAll({ limit: 100 }) })
  const { data: locationsData } = useQuery({ queryKey: ['locations-all'], queryFn: () => locationApi.getAll({ limit: 100 }) })
  const branches = branchesData?.data.data.data ?? []
  const locations = locationsData?.data.data.data ?? []

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: any = { ...form }
      if (!payload.remarks) delete payload.remarks
      if (!payload.locationId) delete payload.locationId
      return isEdit ? posConfigApi.update(config!.id, payload) : posConfigApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pos-configs'] })
      onToast(isEdit ? t('common.updateSuccess') : t('common.createSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const isValid = form.configCode.trim() && form.configName.trim() && form.branchId > 0

  return (
    <div className="w-[420px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm">{isEdit ? t('posConfig.edit') : t('posConfig.add')}</h2>
        <button onClick={onClose} className="text-slate-300 hover:text-white text-lg leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('posConfig.code')} *</label>
            <input className="input" value={form.configCode}
              onChange={(e) => setForm(f => ({ ...f, configCode: e.target.value.toUpperCase() }))}
              disabled={isEdit} placeholder="POS01" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('posConfig.returnDays')}</label>
            <input type="number" className="input" value={form.returnDays ?? 7}
              onChange={(e) => setForm(f => ({ ...f, returnDays: Number(e.target.value) }))} min="0" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('posConfig.name')} *</label>
          <input className="input" value={form.configName}
            onChange={(e) => setForm(f => ({ ...f, configName: e.target.value }))}
            placeholder="Main Counter" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('posConfig.branch')} *</label>
          <select className="input" value={form.branchId || ''}
            onChange={(e) => setForm(f => ({ ...f, branchId: Number(e.target.value) }))}>
            <option value="">{t('common.select')}...</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.branchCode} - {b.branchName}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('posConfig.location')}</label>
          <select className="input" value={form.locationId || ''}
            onChange={(e) => setForm(f => ({ ...f, locationId: Number(e.target.value) || undefined }))}>
            <option value="">— {t('common.select')} —</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.locationCode} - {l.locationName}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2 bg-gray-50 rounded-lg p-3">
          {[
            { key: 'autoProcess', label: t('posConfig.autoProcess') },
            { key: 'requireApproval', label: t('posConfig.requireApproval') },
            { key: 'allowReturnRefund', label: t('posConfig.allowReturnRefund') },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={(form as any)[key] ?? false}
                onChange={(e) => setForm(f => ({ ...f, [key]: e.target.checked }))}
                className="w-4 h-4 accent-blue-600" />
              <span className="text-xs font-medium text-gray-600">{label}</span>
            </label>
          ))}
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

export default function PosConfigPage() {
  const { t } = useTranslation()
  const [panel, setPanel] = useState<{ open: boolean; config: PosConfig | null }>({ open: false, config: null })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['pos-configs'],
    queryFn: () => posConfigApi.getAll({ limit: 100 }),
  })

  const configs = data?.data.data.data ?? []

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{t('posConfig.title')}</h1>
            <p className="text-slate-300 text-xs mt-0.5">{configs.length} {t('common.items')}</p>
          </div>
          <button onClick={() => setPanel({ open: true, config: null })}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + {t('posConfig.add')}
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left sticky top-0">
              <tr>
                <th className="px-5 py-3 font-medium">{t('posConfig.code')}</th>
                <th className="px-5 py-3 font-medium">{t('posConfig.name')}</th>
                <th className="px-5 py-3 font-medium">{t('posConfig.branch')}</th>
                <th className="px-5 py-3 font-medium">{t('posConfig.location')}</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : configs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : configs.map((c) => (
                <tr key={c.id} onClick={() => setPanel({ open: true, config: c })}
                  className={`cursor-pointer hover:bg-blue-50 transition-colors ${panel.config?.id === c.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                  <td className="px-5 py-3 font-mono font-semibold text-slate-700">{c.configCode}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{c.configName}</td>
                  <td className="px-5 py-3 text-gray-500">{c.branch?.branchName ?? '-'}</td>
                  <td className="px-5 py-3 text-gray-500">{c.location?.locationName ?? '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                      {c.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {panel.open && (
        <PosConfigPanel config={panel.config}
          onClose={() => setPanel({ open: false, config: null })} onToast={showToast} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
