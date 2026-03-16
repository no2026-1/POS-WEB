import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { customerApi } from '../services/customer.service'
import type { Customer, CreateCustomerPayload } from '../types/customer.types'
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

function CustomerPanel({ customer, onClose, onToast }: {
  customer: Customer | null
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const isEdit = !!customer

  const [form, setForm] = useState<CreateCustomerPayload>({
    customerNo: customer?.customerNo ?? genDocNo('CUST'),
    customerCode: customer?.customerCode ?? '',
    englishName: customer?.englishName ?? '',
    localName: customer?.localName ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
    address: customer?.address ?? '',
    creditLimit: customer?.creditLimit ?? 0,
    remarks: customer?.remarks ?? '',
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  const emailValid = !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = clean(form) as CreateCustomerPayload
      return isEdit ? customerApi.update(customer!.id, payload) : customerApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      onToast(isEdit ? t('common.updateSuccess') : t('common.createSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => customerApi.delete(customer!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      onToast(t('common.deleteSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  return (
    <div className="w-[440px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <h2 className="font-bold text-gray-800 text-sm">
          {isEdit ? t('customer.edit') : t('customer.add')}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-xl leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('customer.no')} *</label>
            {isEdit ? (
              <input className="input" value={form.customerNo} disabled />
            ) : (
              <div className="input bg-gray-50 text-gray-500 font-mono text-sm">{form.customerNo}</div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('customer.code')} *</label>
            <input className="input" value={form.customerCode}
              onChange={(e) => setForm(f => ({ ...f, customerCode: e.target.value.toUpperCase() }))}
              disabled={isEdit} placeholder="CUST001" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('customer.englishName')} *</label>
          <input className="input" value={form.englishName}
            onChange={(e) => setForm(f => ({ ...f, englishName: e.target.value }))}
            placeholder="Customer Name" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('customer.localName')}</label>
          <input className="input" value={form.localName}
            onChange={(e) => setForm(f => ({ ...f, localName: e.target.value }))}
            placeholder="ຊື່ລູກຄ້າ" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('customer.phone')}</label>
            <input className="input" value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="020 xxxx xxxx" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('customer.email')}</label>
            <input type="email" className={`input ${form.email && !emailValid ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="email@example.com" />
            {form.email && !emailValid && (
              <p className="text-xs text-red-500 mt-1">Invalid email format</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('customer.address')}</label>
          <textarea className="input resize-none" rows={2} value={form.address}
            onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('customer.creditLimit')}</label>
          <input type="number" className="input" value={form.creditLimit ?? 0}
            onChange={(e) => setForm(f => ({ ...f, creditLimit: Number(e.target.value) }))}
            min="0" step="1000" />
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
              disabled={saveMutation.isPending || !form.customerNo || !form.customerCode || !form.englishName || !emailValid}
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

export default function CustomerPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [panel, setPanel] = useState<{ open: boolean; customer: Customer | null }>({ open: false, customer: null })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.getAll({ limit: 100 }),
  })

  const allCustomers = data?.data.data.data ?? []

  const customers = useMemo(() => {
    if (!search.trim()) return allCustomers
    const q = search.toLowerCase()
    return allCustomers.filter((c) =>
      [c.customerNo, c.customerCode, c.englishName, c.localName, c.phone].some(
        (v) => v && String(v).toLowerCase().includes(q),
      ),
    )
  }, [allCustomers, search])

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{t('customer.title')}</h1>
            <p className="text-slate-300 text-xs mt-0.5">{customers.length} / {allCustomers.length} {t('common.items')}</p>
          </div>
          <button onClick={() => setPanel({ open: true, customer: null })}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + {t('customer.add')}
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
                <th className="px-5 py-3 font-medium">{t('customer.no')}</th>
                <th className="px-5 py-3 font-medium">{t('customer.englishName')}</th>
                <th className="px-5 py-3 font-medium">{t('customer.phone')}</th>
                <th className="px-5 py-3 font-medium text-right">{t('customer.creditLimit')}</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : customers.map((c) => (
                <tr key={c.id} onClick={() => setPanel({ open: true, customer: c })}
                  className={`cursor-pointer transition-colors hover:bg-blue-50 ${panel.customer?.id === c.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                  <td className="px-5 py-3">
                    <p className="font-mono font-semibold text-slate-700">{c.customerNo}</p>
                    <p className="text-xs text-gray-400">{c.customerCode}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{c.englishName}</p>
                    {c.localName && <p className="text-xs text-gray-400">{c.localName}</p>}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{c.phone ?? '-'}</td>
                  <td className="px-5 py-3 text-right font-medium text-gray-700">
                    {Number(c.creditLimit) > 0 ? Number(c.creditLimit).toLocaleString() : '-'}
                  </td>
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
        <CustomerPanel customer={panel.customer}
          onClose={() => setPanel({ open: false, customer: null })} onToast={showToast} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
