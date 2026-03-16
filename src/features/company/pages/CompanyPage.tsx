import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { companyApi } from '../services/company.service'
import { genDocNo } from '@/utils/docNo'
import type { Company, CreateCompanyPayload } from '../types/company.types'

const CURRENCIES = ['LAK', 'THB', 'USD', 'CNY']

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
      type === 'success' ? 'bg-green-600' : 'bg-red-500'
    }`}>{message}</div>
  )
}

function CompanyPanel({ company, onClose, onToast }: {
  company: Company | null
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const isEdit = !!company

  const [form, setForm] = useState<CreateCompanyPayload>({
    companyCode: company?.companyCode ?? genDocNo('CO'),
    englishName: company?.englishName ?? '',
    localName:   company?.localName ?? '',
    address:     company?.address ?? '',
    tel:         company?.tel ?? '',
    email:       company?.email ?? '',
    taxId:       company?.taxId ?? '',
    currency:    company?.currency ?? 'LAK',
    remarks:     company?.remarks ?? '',
  })

  const f = (field: keyof CreateCompanyPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const saveMutation = useMutation({
    mutationFn: () => isEdit
      ? companyApi.update(company!.id, form)
      : companyApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] })
      onToast(isEdit ? t('common.updateSuccess') : t('common.createSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const toggleMutation = useMutation({
    mutationFn: () => companyApi.update(company!.id, { isActive: !company!.isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['companies'] }); onClose() },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const isValid = form.companyCode.trim() && form.englishName.trim()

  return (
    <div className="w-[460px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-sm">{isEdit ? t('common.edit') : t('common.add')} Company</h2>
          {isEdit && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${company!.isActive ? 'bg-green-500/30 text-green-200' : 'bg-red-500/30 text-red-200'}`}>
              {company!.isActive ? 'Active' : 'Inactive'}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-slate-300 hover:text-white text-lg leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Company Code *</label>
            {isEdit
              ? <div className="input bg-gray-50 text-gray-500 font-mono text-sm">{form.companyCode}</div>
              : <div className="input bg-gray-50 text-gray-500 font-mono text-sm">{form.companyCode}</div>
            }
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Currency</label>
            <select className="input" value={form.currency} onChange={f('currency')}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">English Name *</label>
          <input className="input" value={form.englishName} onChange={f('englishName')} placeholder="Company Name" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Local Name</label>
          <input className="input" value={form.localName} onChange={f('localName')} placeholder="ຊື່ບໍລິສັດ" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tax ID</label>
          <input className="input" value={form.taxId} onChange={f('taxId')} placeholder="Tax registration number" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tel</label>
            <input className="input" value={form.tel} onChange={f('tel')} placeholder="+856 20 xxxx xxxx" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
            <input type="email" className="input" value={form.email} onChange={f('email')} placeholder="company@email.com" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
          <textarea className="input resize-none" rows={2} value={form.address} onChange={f('address')} placeholder="Company address" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('common.remarks')}</label>
          <textarea className="input resize-none" rows={2} value={form.remarks} onChange={f('remarks')} />
        </div>
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-2">
        <button onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !isValid}
          className="btn-primary w-full disabled:opacity-50">
          {saveMutation.isPending ? t('common.saving') : t('common.save')}
        </button>
        {isEdit && (
          <button onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            className={`text-sm font-medium py-2 rounded-lg w-full transition disabled:opacity-50 ${
              company!.isActive
                ? 'bg-red-100 hover:bg-red-200 text-red-600'
                : 'bg-green-100 hover:bg-green-200 text-green-700'
            }`}>
            {company!.isActive ? 'Deactivate' : 'Activate'}
          </button>
        )}
        <button onClick={onClose} className="btn-secondary w-full">{t('common.cancel')}</button>
      </div>
    </div>
  )
}

export default function CompanyPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [panel, setPanel] = useState<{ open: boolean; company: Company | null }>({ open: false, company: null })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['companies', search],
    queryFn: () => companyApi.getAll({ limit: 100, search: search || undefined }),
  })

  const companies: Company[] = data?.data.data ?? []

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">Company Management</h1>
            <p className="text-slate-300 text-xs mt-0.5">{companies.length} companies</p>
          </div>
          <button onClick={() => setPanel({ open: true, company: null })}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + Add Company
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
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Company Name</th>
                <th className="px-5 py-3 font-medium">Local Name</th>
                <th className="px-5 py-3 font-medium">Tax ID</th>
                <th className="px-5 py-3 font-medium">Currency</th>
                <th className="px-5 py-3 font-medium">Tel</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : companies.map((c) => (
                <tr key={c.id} onClick={() => setPanel({ open: true, company: c })}
                  className={`cursor-pointer transition-colors hover:bg-blue-50 ${panel.company?.id === c.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                  <td className="px-5 py-3 font-mono font-semibold text-slate-700">{c.companyCode}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{c.englishName}</td>
                  <td className="px-5 py-3 text-gray-500">{c.localName ?? '-'}</td>
                  <td className="px-5 py-3 text-gray-500">{c.taxId ?? '-'}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{c.currency}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{c.tel ?? '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {panel.open && (
        <CompanyPanel company={panel.company}
          onClose={() => setPanel({ open: false, company: null })} onToast={showToast} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
