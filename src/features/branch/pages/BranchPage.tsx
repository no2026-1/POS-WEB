import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { branchApi } from '../services/branch.service'
import type { Branch, CreateBranchPayload } from '../types/branch.types'
import { genDocNo } from '@/utils/docNo'

// ── Toast ───────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
      type === 'success' ? 'bg-green-600' : 'bg-red-500'
    }`}>
      {message}
    </div>
  )
}

// ── Side Panel ──────────────────────────────────────────────
function BranchPanel({
  branch,
  onClose,
  onToast,
}: {
  branch: Branch | null
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const isEdit = !!branch

  const emptyForm: CreateBranchPayload = {
    branchCode: genDocNo('BR'),
    englishName: '',
    localName: '',
    address: '',
    tel: '',
    email: '',
    returnDays: 7,
    autoProcess: false,
    requireApproval: true,
    allowReturnRefund: true,
  }

  const [form, setForm] = useState<CreateBranchPayload>(
    branch
      ? {
          branchCode: branch.branchCode,
          englishName: branch.englishName,
          localName: branch.localName ?? '',
          address: branch.address ?? '',
          tel: branch.tel ?? '',
          email: branch.email ?? '',
          returnDays: branch.returnDays,
          autoProcess: branch.autoProcess,
          requireApproval: branch.requireApproval,
          allowReturnRefund: branch.allowReturnRefund,
        }
      : emptyForm,
  )
  const [confirmDelete, setConfirmDelete] = useState(false)

  function set(key: keyof CreateBranchPayload, value: any) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function cleanForm(f: CreateBranchPayload): CreateBranchPayload {
    return Object.fromEntries(
      Object.entries(f).filter(([, v]) => v !== '' && v !== null && v !== undefined),
    ) as CreateBranchPayload
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = cleanForm(form)
      return isEdit ? branchApi.update(branch!.id, payload) : branchApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] })
      onToast(isEdit ? 'อัปเดตสาขาสำเร็จ' : 'เพิ่มสาขาสำเร็จ', 'success')
      onClose()
    },
    onError: (e: any) => {
      onToast(e.response?.data?.message ?? t('common.error'), 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => branchApi.delete(branch!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] })
      onToast('ลบสาขาสำเร็จ', 'success')
      onClose()
    },
    onError: (e: any) => {
      onToast(e.response?.data?.message ?? t('common.error'), 'error')
    },
  })

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      {/* Panel header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <h2 className="font-bold text-gray-800 text-sm">
          {isEdit ? t('branch.edit') : t('branch.add')}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-xl leading-none">
          ✕
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('branch.code')} *</label>
          {isEdit ? (
            <input
              className="input"
              value={form.branchCode}
              disabled
            />
          ) : (
            <div className="input bg-gray-50 text-gray-500 font-mono text-sm">{form.branchCode}</div>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('branch.englishName')} *</label>
          <input
            className="input"
            value={form.englishName}
            onChange={(e) => set('englishName', e.target.value)}
            placeholder="Bangkok Main Branch"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('branch.localName')}</label>
          <input
            className="input"
            value={form.localName}
            onChange={(e) => set('localName', e.target.value)}
            placeholder="สาขากรุงเทพหลัก"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('branch.tel')}</label>
          <input
            className="input"
            value={form.tel}
            onChange={(e) => set('tel', e.target.value)}
            placeholder="02-xxx-xxxx"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('branch.address')}</label>
          <textarea
            className="input resize-none"
            rows={2}
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
          />
        </div>

        {/* Toggles */}
        <div className="border border-gray-100 rounded-lg p-3 flex flex-col gap-3">
          {[
            { key: 'autoProcess', label: 'Auto Process' },
            { key: 'requireApproval', label: 'Require Approval' },
            { key: 'allowReturnRefund', label: 'Allow Return/Refund' },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-gray-600">{item.label}</span>
              <div
                onClick={() => set(item.key as keyof CreateBranchPayload, !form[item.key as keyof CreateBranchPayload])}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  form[item.key as keyof CreateBranchPayload] ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  form[item.key as keyof CreateBranchPayload] ? 'left-4' : 'left-0.5'
                }`} />
              </div>
            </label>
          ))}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Return Days</label>
            <input
              type="number"
              min={0}
              className="input"
              value={form.returnDays}
              onChange={(e) => set('returnDays', Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-2">
        {!confirmDelete ? (
          <>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.branchCode || !form.englishName}
              className="btn-primary w-full disabled:opacity-50"
            >
              {saveMutation.isPending ? t('common.saving') : t('common.save')}
            </button>
            <button onClick={onClose} className="btn-secondary w-full">
              {t('common.cancel')}
            </button>
            {isEdit && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-red-400 hover:text-red-600 text-center mt-1"
              >
                {t('common.delete')}
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-xs text-center text-gray-500">{t('branch.deleteConfirmMessage')}</p>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg w-full disabled:opacity-50"
            >
              {deleteMutation.isPending ? t('common.deleting') : t('common.confirm')}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="btn-secondary w-full">
              {t('common.cancel')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────
export default function BranchPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [panel, setPanel] = useState<{ open: boolean; branch: Branch | null }>({
    open: false,
    branch: null,
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchApi.getAll({ limit: 100 }),
  })

  const allBranches = data?.data.data.data ?? []

  // Real-time search across all fields
  const branches = useMemo(() => {
    if (!search.trim()) return allBranches
    const q = search.toLowerCase()
    return allBranches.filter((b) =>
      [b.branchCode, b.englishName, b.localName, b.tel, b.address]
        .some((v) => v && String(v).toLowerCase().includes(q)),
    )
  }, [allBranches, search])

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  function openPanel(branch: Branch | null) {
    setPanel({ open: true, branch })
  }

  function closePanel() {
    setPanel({ open: false, branch: null })
  }

  return (
    <div className="flex h-full -m-6">
      {/* Left: Table area */}
      <div className={`flex flex-col flex-1 transition-all duration-300 min-w-0`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{t('branch.title')}</h1>
            <p className="text-slate-300 text-xs mt-0.5">{branches.length} / {allBranches.length} {t('common.items')}</p>
          </div>
          <button
            onClick={() => openPanel(null)}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + {t('branch.add')}
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
                <th className="px-5 py-3 font-medium">{t('branch.code')}</th>
                <th className="px-5 py-3 font-medium">{t('branch.englishName')}</th>
                <th className="px-5 py-3 font-medium">{t('branch.tel')}</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400">{t('common.loading')}</td>
                </tr>
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400">{t('common.noData')}</td>
                </tr>
              ) : branches.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => openPanel(b)}
                  className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                    panel.branch?.id === b.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <td className="px-5 py-3 font-mono font-semibold text-slate-700">{b.branchCode}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{b.englishName}</p>
                    {b.localName && <p className="text-xs text-gray-400">{b.localName}</p>}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{b.tel ?? '-'}</td>
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
        <BranchPanel
          branch={panel.branch}
          onClose={closePanel}
          onToast={showToast}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
