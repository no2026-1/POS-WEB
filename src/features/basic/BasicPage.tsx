import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { basicApi } from './basic.api'
import type {
  Basic,
  BasicLine,
  CreateBasicPayload,
  CreateBasicLinePayload,
} from './basic.types'

// ── Toast ───────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
      type === 'success' ? 'bg-green-600' : 'bg-red-500'
    }`}>
      {message}
    </div>
  )
}

// ── Line Form (inline row) ──────────────────────────────────
function LineForm({
  basicId,
  line,
  onDone,
  onToast,
}: {
  basicId: number
  line: BasicLine | null
  onDone: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const qc = useQueryClient()
  const isEdit = !!line
  const [form, setForm] = useState<CreateBasicLinePayload>({
    code: line?.code ?? '',
    name: line?.name ?? '',
    nameTh: line?.nameTh ?? '',
    value: line?.value ?? '',
    sortOrder: line?.sortOrder ?? 0,
    isDefault: line?.isDefault ?? false,
  })

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? basicApi.updateLine(line!.id, form)
        : basicApi.createLine(basicId, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['basics'] })
      onToast(isEdit ? 'อัปเดตสำเร็จ' : 'เพิ่มสำเร็จ', 'success')
      onDone()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? 'เกิดข้อผิดพลาด', 'error'),
  })

  return (
    <tr className="bg-blue-50">
      <td className="px-3 py-2">
        <input
          className="input text-xs py-1"
          value={form.code}
          onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
          disabled={isEdit}
          placeholder="CODE"
        />
      </td>
      <td className="px-3 py-2">
        <input
          className="input text-xs py-1"
          value={form.name}
          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Name"
        />
      </td>
      <td className="px-3 py-2">
        <input
          className="input text-xs py-1"
          value={form.nameTh}
          onChange={(e) => setForm(f => ({ ...f, nameTh: e.target.value }))}
          placeholder="ชื่อไทย"
        />
      </td>
      <td className="px-3 py-2">
        <input
          className="input text-xs py-1"
          value={form.value}
          onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))}
          placeholder="Value"
        />
      </td>
      <td className="px-3 py-2 text-right">
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="text-xs bg-blue-600 text-white px-2 py-1 rounded mr-1 hover:bg-blue-700"
        >
          {mutation.isPending ? '...' : '✓'}
        </button>
        <button onClick={onDone} className="text-xs text-gray-500 hover:text-gray-700">✕</button>
      </td>
    </tr>
  )
}

// ── Side Panel ──────────────────────────────────────────────
function BasicPanel({
  basic,
  onClose,
  onToast,
}: {
  basic: Basic | null
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const isEdit = !!basic

  const [form, setForm] = useState<CreateBasicPayload>({
    code: basic?.code ?? '',
    name: basic?.name ?? '',
    nameTh: basic?.nameTh ?? '',
    description: basic?.description ?? '',
  })
  const [editingLine, setEditingLine] = useState<BasicLine | null | 'new'>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const saveMutation = useMutation({
    mutationFn: () =>
      isEdit ? basicApi.update(basic!.id, form) : basicApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['basics'] })
      onToast(isEdit ? 'อัปเดตสำเร็จ' : 'เพิ่มสำเร็จ', 'success')
      if (!isEdit) onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => basicApi.delete(basic!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['basics'] })
      onToast('ลบสำเร็จ', 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const deleteLineMutation = useMutation({
    mutationFn: (lineId: number) => basicApi.deleteLine(lineId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['basics'] })
      onToast('ลบรายการสำเร็จ', 'success')
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const lines = basic?.lines ?? []

  return (
    <div className="w-[480px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 flex items-center justify-between shrink-0">
        <h2 className="text-white font-semibold text-sm">
          {isEdit ? `${t('common.edit')}: ${basic!.code}` : t('basic.add')}
        </h2>
        <button onClick={onClose} className="text-slate-300 hover:text-white text-lg leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Basic form */}
        <div className="p-5 flex flex-col gap-3 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('basic.code')} *</label>
              <input
                className="input"
                value={form.code}
                onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                disabled={isEdit}
                placeholder="USER_ROLE"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('basic.name')} *</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="User Roles"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('basic.nameTh')}</label>
              <input
                className="input"
                value={form.nameTh}
                onChange={(e) => setForm(f => ({ ...f, nameTh: e.target.value }))}
                placeholder="บทบาทผู้ใช้"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('basic.description')}</label>
              <input
                className="input"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.code || !form.name}
              className="btn-primary disabled:opacity-50"
            >
              {saveMutation.isPending ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </div>

        {/* BasicLine nested table (only when editing) */}
        {isEdit && (
          <div className="flex flex-col flex-1">
            <div className="px-5 py-3 flex items-center justify-between bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {t('basic.lines')} ({lines.length})
              </span>
              <button
                onClick={() => setEditingLine('new')}
                className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
              >
                + {t('common.add')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Code</th>
                    <th className="px-3 py-2 text-left font-medium">Name</th>
                    <th className="px-3 py-2 text-left font-medium">ชื่อไทย</th>
                    <th className="px-3 py-2 text-left font-medium">Value</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {editingLine === 'new' && (
                    <LineForm
                      basicId={basic!.id}
                      line={null}
                      onDone={() => setEditingLine(null)}
                      onToast={onToast}
                    />
                  )}
                  {lines.map((line) =>
                    editingLine && (editingLine as BasicLine).id === line.id ? (
                      <LineForm
                        key={line.id}
                        basicId={basic!.id}
                        line={line}
                        onDone={() => setEditingLine(null)}
                        onToast={onToast}
                      />
                    ) : (
                      <tr key={line.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono font-semibold text-slate-700">{line.code}</td>
                        <td className="px-3 py-2 text-gray-800">{line.name}</td>
                        <td className="px-3 py-2 text-gray-500">{line.nameTh ?? '-'}</td>
                        <td className="px-3 py-2 text-gray-500">{line.value ?? '-'}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => setEditingLine(line)}
                            className="text-blue-500 hover:text-blue-700 mr-2"
                          >✎</button>
                          <button
                            onClick={() => deleteLineMutation.mutate(line.id)}
                            className="text-red-400 hover:text-red-600"
                          >✕</button>
                        </td>
                      </tr>
                    )
                  )}
                  {lines.length === 0 && editingLine !== 'new' && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-400">{t('common.noData')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete basic */}
      {isEdit && (
        <div className="px-5 py-3 border-t border-gray-100 shrink-0">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-red-400 hover:text-red-600"
            >
              {t('common.delete')} {basic!.code}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 flex-1">{t('basic.deleteConfirmMessage')}</span>
              <button
                onClick={() => deleteMutation.mutate()}
                className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                {t('common.confirm')}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-500">
                {t('common.cancel')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────
export default function BasicPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [panel, setPanel] = useState<{ open: boolean; basic: Basic | null }>({
    open: false, basic: null,
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['basics'],
    queryFn: () => basicApi.getAll({ limit: 100 }),
  })

  const allBasics = data?.data.data ?? []

  const basics = useMemo(() => {
    if (!search.trim()) return allBasics
    const q = search.toLowerCase()
    return allBasics.filter((b) =>
      [b.code, b.name, b.nameTh, b.description]
        .some((v) => v && String(v).toLowerCase().includes(q)),
    )
  }, [allBasics, search])

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Sync panel data when query refreshes
  const currentBasic = panel.basic
    ? allBasics.find((b) => b.id === panel.basic!.id) ?? panel.basic
    : null

  return (
    <div className="flex h-full -m-6">
      {/* Left: Table */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{t('basic.title')}</h1>
            <p className="text-slate-300 text-xs mt-0.5">{basics.length} / {allBasics.length} {t('common.items')}</p>
          </div>
          <button
            onClick={() => setPanel({ open: true, basic: null })}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + {t('basic.add')}
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
          <input
            className="w-full max-w-sm border border-blue-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left sticky top-0">
              <tr>
                <th className="px-5 py-3 font-medium">{t('basic.code')}</th>
                <th className="px-5 py-3 font-medium">{t('basic.name')}</th>
                <th className="px-5 py-3 font-medium">{t('basic.nameTh')}</th>
                <th className="px-5 py-3 font-medium">Lines</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : basics.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : basics.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => setPanel({ open: true, basic: b })}
                  className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                    panel.basic?.id === b.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <td className="px-5 py-3 font-mono font-semibold text-slate-700">{b.code}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{b.name}</td>
                  <td className="px-5 py-3 text-gray-500">{b.nameTh ?? '-'}</td>
                  <td className="px-5 py-3">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {b.lines?.length ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      b.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'
                    }`}>
                      {b.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Side panel */}
      {panel.open && (
        <BasicPanel
          basic={currentBasic}
          onClose={() => setPanel({ open: false, basic: null })}
          onToast={showToast}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
