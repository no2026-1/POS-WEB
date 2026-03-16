import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { locationApi } from '../services/location.service'
import { branchApi } from '@/features/branch/services/branch.service'
import type { Location, CreateLocationPayload } from '../types/location.types'
import { genDocNo } from '@/utils/docNo'

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
      type === 'success' ? 'bg-green-600' : 'bg-red-500'
    }`}>{message}</div>
  )
}

function clean(obj: Record<string, any>) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined))
}

function LocationPanel({
  location, onClose, onToast,
}: {
  location: Location | null
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const isEdit = !!location

  const { data: branchData } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchApi.getAll({ limit: 100 }),
  })
  const branches = branchData?.data.data.data ?? []

  const [form, setForm] = useState<CreateLocationPayload>({
    branchId: location?.branchId ?? 0,
    locationCode: location?.locationCode ?? genDocNo('LOC'),
    locationName: location?.locationName ?? '',
    remarks: location?.remarks ?? '',
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = clean(form) as CreateLocationPayload
      return isEdit ? locationApi.update(location!.id, payload) : locationApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] })
      onToast(isEdit ? t('common.updateSuccess') : t('common.createSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => locationApi.delete(location!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] })
      onToast(t('common.deleteSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <h2 className="font-bold text-gray-800 text-sm">
          {isEdit ? t('location.edit') : t('location.add')}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-xl leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('location.branch')} *</label>
          <select className="input" value={form.branchId || ''}
            onChange={(e) => setForm(f => ({ ...f, branchId: Number(e.target.value) }))}
            disabled={isEdit}>
            <option value="">— {t('common.select')} —</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.branchCode} - {b.englishName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('location.code')} *</label>
          {isEdit ? (
            <input className="input" value={form.locationCode} disabled />
          ) : (
            <div className="input bg-gray-50 text-gray-500 font-mono text-sm">{form.locationCode}</div>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('location.name')} *</label>
          <input className="input" value={form.locationName}
            onChange={(e) => setForm(f => ({ ...f, locationName: e.target.value }))}
            placeholder="Main Warehouse" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('common.remarks')}</label>
          <textarea className="input resize-none" rows={2} value={form.remarks}
            onChange={(e) => setForm(f => ({ ...f, remarks: e.target.value }))} />
        </div>
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-2">
        {!confirmDelete ? (
          <>
            <button onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.branchId || !form.locationCode || !form.locationName}
              className="btn-primary w-full disabled:opacity-50">
              {saveMutation.isPending ? t('common.saving') : t('common.save')}
            </button>
            <button onClick={onClose} className="btn-secondary w-full">{t('common.cancel')}</button>
            {isEdit && (
              <button onClick={() => setConfirmDelete(true)} className="text-xs text-red-400 hover:text-red-600 text-center mt-1">
                {t('common.delete')}
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-xs text-center text-gray-500">{t('common.deleteConfirmMessage')}</p>
            <button onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg w-full disabled:opacity-50">
              {deleteMutation.isPending ? t('common.deleting') : t('common.confirm')}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="btn-secondary w-full">{t('common.cancel')}</button>
          </>
        )}
      </div>
    </div>
  )
}

export default function LocationPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [panel, setPanel] = useState<{ open: boolean; location: Location | null }>({ open: false, location: null })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationApi.getAll({ limit: 100 }),
  })

  const allLocations = data?.data.data.data ?? []

  const locations = useMemo(() => {
    if (!search.trim()) return allLocations
    const q = search.toLowerCase()
    return allLocations.filter((l) =>
      [l.locationCode, l.locationName, l.branch?.englishName].some((v) => v && String(v).toLowerCase().includes(q)),
    )
  }, [allLocations, search])

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{t('location.title')}</h1>
            <p className="text-slate-300 text-xs mt-0.5">{locations.length} / {allLocations.length} {t('common.items')}</p>
          </div>
          <button onClick={() => setPanel({ open: true, location: null })}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + {t('location.add')}
          </button>
        </div>

        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
          <input className="w-full max-w-sm border border-blue-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left sticky top-0">
              <tr>
                <th className="px-5 py-3 font-medium">{t('location.code')}</th>
                <th className="px-5 py-3 font-medium">{t('location.name')}</th>
                <th className="px-5 py-3 font-medium">{t('location.branch')}</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : locations.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : locations.map((l) => (
                <tr key={l.id} onClick={() => setPanel({ open: true, location: l })}
                  className={`cursor-pointer transition-colors hover:bg-blue-50 ${panel.location?.id === l.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                  <td className="px-5 py-3 font-mono font-semibold text-slate-700">{l.locationCode}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{l.locationName}</td>
                  <td className="px-5 py-3 text-gray-500">{l.branch?.englishName ?? '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${l.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                      {l.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {panel.open && (
        <LocationPanel location={panel.location}
          onClose={() => setPanel({ open: false, location: null })} onToast={showToast} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
