import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { tableApi } from '../services/table.service'
import { locationApi } from '@/features/location/services/location.service'
import type { Table, CreateTablePayload } from '../types/table.types'

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
      type === 'success' ? 'bg-green-600' : 'bg-red-500'
    }`}>{message}</div>
  )
}

const STATUS_CONFIG = {
  AVAILABLE: { label: 'Available', color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  OCCUPIED:  { label: 'Occupied',  color: 'bg-red-100 text-red-700 border-red-200',       dot: 'bg-red-500' },
  RESERVED:  { label: 'Reserved',  color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  CLEANING:  { label: 'Cleaning',  color: 'bg-blue-100 text-blue-700 border-blue-200',    dot: 'bg-blue-500' },
}

function TableCard({ table, onClick }: { table: Table; onClick: () => void }) {
  const cfg = STATUS_CONFIG[table.status] ?? STATUS_CONFIG.AVAILABLE
  return (
    <div onClick={onClick}
      className={`border-2 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all ${cfg.color}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="font-bold text-lg">{table.tableCode}</span>
        <div className={`w-2.5 h-2.5 rounded-full mt-1 ${cfg.dot}`} />
      </div>
      <p className="text-sm font-medium truncate">{table.tableName}</p>
      {table.zone && <p className="text-xs opacity-70 mt-0.5">{table.zone}</p>}
      <div className="flex items-center gap-1 mt-2">
        <span className="text-xs">👥</span>
        <span className="text-xs">{table.capacity}</span>
      </div>
      <div className={`mt-2 text-xs font-semibold px-2 py-0.5 rounded-full inline-block`}>
        {cfg.label}
      </div>
    </div>
  )
}

function TablePanel({ table, onClose, onToast }: {
  table: Table | null
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const isEdit = !!table

  const { data: locationsData } = useQuery({
    queryKey: ['locations-all'],
    queryFn: () => locationApi.getAll({ limit: 100 }),
  })
  const locations = locationsData?.data.data.data ?? []

  const [form, setForm] = useState<CreateTablePayload>({
    tableCode: table?.tableCode ?? '',
    tableName: table?.tableName ?? '',
    zone: table?.zone ?? '',
    capacity: table?.capacity ?? 4,
    locationId: table?.locationId ?? 0,
    status: table?.status ?? 'AVAILABLE',
    remarks: table?.remarks ?? '',
  })

  const saveMutation = useMutation({
    mutationFn: () => isEdit
      ? tableApi.update(table!.id, { ...form, zone: form.zone || undefined, remarks: form.remarks || undefined })
      : tableApi.create({ ...form, zone: form.zone || undefined, remarks: form.remarks || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] })
      onToast(isEdit ? t('common.updateSuccess') : t('common.createSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) => tableApi.updateStatus(table!.id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] })
      onToast(t('common.updateSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => tableApi.delete(table!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] })
      onToast(t('common.deleteSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  return (
    <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-bold text-gray-800 text-sm">
          {isEdit ? t('table.edit') : t('table.add')}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        {/* Quick status change (edit only) */}
        {isEdit && (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-medium text-gray-500 mb-2">{t('table.quickStatus')}</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                <button key={s} onClick={() => statusMutation.mutate(s)}
                  disabled={table!.status === s}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition disabled:opacity-40 ${cfg.color}`}>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('table.code')} *</label>
            <input className="input" value={form.tableCode} disabled={isEdit}
              onChange={(e) => setForm(f => ({ ...f, tableCode: e.target.value.toUpperCase() }))}
              placeholder="T01" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('table.capacity')} *</label>
            <input type="number" className="input" value={form.capacity} min={1}
              onChange={(e) => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('table.name')} *</label>
          <input className="input" value={form.tableName}
            onChange={(e) => setForm(f => ({ ...f, tableName: e.target.value }))}
            placeholder="Table 01" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('table.zone')}</label>
            <input className="input" value={form.zone ?? ''}
              onChange={(e) => setForm(f => ({ ...f, zone: e.target.value }))}
              placeholder="Indoor, VIP..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('table.location')} *</label>
            <select className="input" value={form.locationId || ''}
              onChange={(e) => setForm(f => ({ ...f, locationId: Number(e.target.value) }))}>
              <option value="">— {t('common.select')} —</option>
              {locations.map((l: any) => <option key={l.id} value={l.id}>{l.locationCode}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('common.remarks')}</label>
          <textarea className="input resize-none" rows={2} value={form.remarks ?? ''}
            onChange={(e) => setForm(f => ({ ...f, remarks: e.target.value }))} />
        </div>
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
        <button onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !form.tableCode || !form.tableName || !form.locationId}
          className="btn-primary flex-1 py-2 text-sm disabled:opacity-50">
          {saveMutation.isPending ? t('common.saving') : t('common.save')}
        </button>
        {isEdit && (
          <button onClick={() => { if (confirm(t('common.deleteConfirmMessage'))) deleteMutation.mutate() }}
            disabled={deleteMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm rounded-xl transition disabled:opacity-50">
            {t('common.delete')}
          </button>
        )}
        <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">{t('common.cancel')}</button>
      </div>
    </div>
  )
}

export default function TablePage() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<Table | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterZone, setFilterZone] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['tables', filterStatus, filterZone],
    queryFn: () => tableApi.getAll({ limit: 100, status: filterStatus || undefined, zone: filterZone || undefined }),
    refetchInterval: 30000,
  })

  const tables = data?.data.data.data ?? []
  const zones = [...new Set(tables.map((t: Table) => t.zone).filter(Boolean))]

  const filtered = tables.filter((t: Table) => {
    if (filterStatus && t.status !== filterStatus) return false
    if (filterZone && t.zone !== filterZone) return false
    return true
  })

  const statusCounts = {
    AVAILABLE: tables.filter((t: Table) => t.status === 'AVAILABLE').length,
    OCCUPIED:  tables.filter((t: Table) => t.status === 'OCCUPIED').length,
    RESERVED:  tables.filter((t: Table) => t.status === 'RESERVED').length,
    CLEANING:  tables.filter((t: Table) => t.status === 'CLEANING').length,
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{t('table.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('table.subtitle')}</p>
        </div>
        <button onClick={() => { setSelected(null); setShowPanel(true) }} className="btn-primary px-4 py-2 text-sm">
          + {t('table.add')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
          <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
            className={`rounded-xl border p-3 text-left transition ${filterStatus === s ? cfg.color + ' border-2' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
            <p className="text-xs text-gray-500">{cfg.label}</p>
            <p className="text-2xl font-bold text-gray-800">{statusCounts[s as keyof typeof statusCounts]}</p>
          </button>
        ))}
      </div>

      {/* Filters + View toggle */}
      <div className="flex gap-3 mb-4 items-center">
        <select className="input max-w-[160px]" value={filterZone}
          onChange={(e) => setFilterZone(e.target.value)}>
          <option value="">{t('table.allZones')}</option>
          {zones.map((z) => <option key={z} value={z as string}>{z}</option>)}
        </select>
        <div className="ml-auto flex gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-md text-sm transition ${viewMode === 'grid' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
            ⊞ Grid
          </button>
          <button onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md text-sm transition ${viewMode === 'list' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
            ☰ List
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-gray-400">{t('common.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400">{t('common.noData')}</div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((table: Table) => (
              <TableCard key={table.id} table={table}
                onClick={() => { setSelected(table); setShowPanel(true) }} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500 text-left">
                  <th className="px-4 py-3 font-medium">{t('table.code')}</th>
                  <th className="px-4 py-3 font-medium">{t('table.name')}</th>
                  <th className="px-4 py-3 font-medium">{t('table.zone')}</th>
                  <th className="px-4 py-3 font-medium">{t('table.capacity')}</th>
                  <th className="px-4 py-3 font-medium">{t('common.status')}</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((table: Table) => {
                  const cfg = STATUS_CONFIG[table.status]
                  return (
                    <tr key={table.id} className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => { setSelected(table); setShowPanel(true) }}>
                      <td className="px-4 py-3 font-medium text-indigo-700">{table.tableCode}</td>
                      <td className="px-4 py-3 text-gray-800">{table.tableName}</td>
                      <td className="px-4 py-3 text-gray-500">{table.zone ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">👥 {table.capacity}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-blue-400 hover:text-blue-600 text-xs">{t('common.edit')}</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side panel */}
      {showPanel && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/20" onClick={() => setShowPanel(false)} />
          <TablePanel table={selected} onClose={() => setShowPanel(false)} onToast={showToast} />
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
