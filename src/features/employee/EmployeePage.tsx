import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { employeeApi } from './employee.api'
import { branchApi } from '@/features/branch/branch.api'
import { departmentApi } from '@/features/department/department.api'
import type { Employee, CreateEmployeePayload } from './employee.types'

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

function EmployeePanel({
  employee, onClose, onToast,
}: {
  employee: Employee | null
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const isEdit = !!employee

  const { data: branchData } = useQuery({ queryKey: ['branches'], queryFn: () => branchApi.getAll({ limit: 100 }) })
  const { data: deptData } = useQuery({ queryKey: ['departments'], queryFn: () => departmentApi.getAll() })

  const branches = branchData?.data.data.data ?? []
  const departments = deptData?.data.data ?? []

  const [form, setForm] = useState<CreateEmployeePayload>({
    empNo: employee?.empNo ?? '',
    empCode: employee?.empCode ?? '',
    branchId: employee?.branchId ?? 0,
    departmentId: employee?.departmentId ?? undefined,
    englishName: employee?.englishName ?? '',
    localName: employee?.localName ?? '',
    position: employee?.position ?? '',
    hireDate: employee?.hireDate ? employee.hireDate.slice(0, 10) : '',
    phone: employee?.phone ?? '',
    email: employee?.email ?? '',
    address: employee?.address ?? '',
    remarks: employee?.remarks ?? '',
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  const emailValid = !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = clean(form) as CreateEmployeePayload
      return isEdit ? employeeApi.update(employee!.id, payload) : employeeApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      onToast(isEdit ? t('common.updateSuccess') : t('common.createSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => employeeApi.delete(employee!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      onToast(t('common.deleteSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  return (
    <div className="w-[420px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <h2 className="font-bold text-gray-800 text-sm">
          {isEdit ? t('employee.edit') : t('employee.add')}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-xl leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('employee.empNo')} *</label>
            <input className="input" value={form.empNo}
              onChange={(e) => setForm(f => ({ ...f, empNo: e.target.value }))}
              disabled={isEdit} placeholder="EMP001" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('employee.empCode')} *</label>
            <input className="input" value={form.empCode}
              onChange={(e) => setForm(f => ({ ...f, empCode: e.target.value }))}
              placeholder="E001" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('employee.englishName')} *</label>
          <input className="input" value={form.englishName}
            onChange={(e) => setForm(f => ({ ...f, englishName: e.target.value }))}
            placeholder="John Doe" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('employee.localName')}</label>
          <input className="input" value={form.localName}
            onChange={(e) => setForm(f => ({ ...f, localName: e.target.value }))} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('location.branch')} *</label>
          <select className="input" value={form.branchId || ''}
            onChange={(e) => setForm(f => ({ ...f, branchId: Number(e.target.value) }))}
            disabled={isEdit}>
            <option value="">— {t('common.select')} —</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.branchCode} - {b.englishName}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('nav.department')}</label>
          <select className="input" value={form.departmentId ?? ''}
            onChange={(e) => setForm(f => ({ ...f, departmentId: e.target.value ? Number(e.target.value) : undefined }))}>
            <option value="">— {t('common.select')} —</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.deptCode} - {d.englishName}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('employee.position')}</label>
            <input className="input" value={form.position}
              onChange={(e) => setForm(f => ({ ...f, position: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('employee.hireDate')}</label>
            <input type="date" className="input" value={form.hireDate}
              onChange={(e) => setForm(f => ({ ...f, hireDate: e.target.value }))} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('employee.phone')}</label>
            <input className="input" value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('auth.email')}</label>
            <input type="email" className={`input ${form.email && !emailValid ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
            {form.email && !emailValid && (
              <p className="text-xs text-red-500 mt-1">Invalid email format</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('branch.address')}</label>
          <textarea className="input resize-none" rows={2} value={form.address}
            onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
        </div>
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-2">
        {!confirmDelete ? (
          <>
            <button onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.empNo || !form.englishName || !form.branchId || !emailValid}
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

export default function EmployeePage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [panel, setPanel] = useState<{ open: boolean; employee: Employee | null }>({ open: false, employee: null })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeApi.getAll({ limit: 100 }),
  })

  const allEmployees = data?.data.data.data ?? []

  const employees = useMemo(() => {
    if (!search.trim()) return allEmployees
    const q = search.toLowerCase()
    return allEmployees.filter((e) =>
      [e.empNo, e.empCode, e.englishName, e.localName, e.position, e.phone].some((v) => v && String(v).toLowerCase().includes(q)),
    )
  }, [allEmployees, search])

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{t('employee.title')}</h1>
            <p className="text-slate-300 text-xs mt-0.5">{employees.length} / {allEmployees.length} {t('common.items')}</p>
          </div>
          <button onClick={() => setPanel({ open: true, employee: null })}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + {t('employee.add')}
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
                <th className="px-5 py-3 font-medium">{t('employee.empNo')}</th>
                <th className="px-5 py-3 font-medium">{t('employee.englishName')}</th>
                <th className="px-5 py-3 font-medium">{t('employee.position')}</th>
                <th className="px-5 py-3 font-medium">{t('nav.department')}</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : employees.map((e) => (
                <tr key={e.id} onClick={() => setPanel({ open: true, employee: e })}
                  className={`cursor-pointer transition-colors hover:bg-blue-50 ${panel.employee?.id === e.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                  <td className="px-5 py-3 font-mono font-semibold text-slate-700">{e.empNo}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{e.englishName}</p>
                    {e.localName && <p className="text-xs text-gray-400">{e.localName}</p>}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{e.position ?? '-'}</td>
                  <td className="px-5 py-3 text-gray-500">{e.department?.englishName ?? '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                      {e.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {panel.open && (
        <EmployeePanel employee={panel.employee}
          onClose={() => setPanel({ open: false, employee: null })} onToast={showToast} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
