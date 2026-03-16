import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { vendorApi } from '../services/vendor.service'
import type { Vendor, CreateVendorPayload } from '../types/vendor.types'
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

function VendorPanel({ vendor, onClose, onToast }: {
  vendor: Vendor | null
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const isEdit = !!vendor

  const [form, setForm] = useState<CreateVendorPayload>({
    vendorNo: vendor?.vendorNo ?? genDocNo('VEND'),
    vendorCode: vendor?.vendorCode ?? '',
    englishName: vendor?.englishName ?? '',
    localName: vendor?.localName ?? '',
    phone: vendor?.phone ?? '',
    email: vendor?.email ?? '',
    address: vendor?.address ?? '',
    taxId: vendor?.taxId ?? '',
    paymentTerms: vendor?.paymentTerms ?? '',
    remarks: vendor?.remarks ?? '',
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  const emailValid = !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = clean(form) as CreateVendorPayload
      return isEdit ? vendorApi.update(vendor!.id, payload) : vendorApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] })
      onToast(isEdit ? t('common.updateSuccess') : t('common.createSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => vendorApi.delete(vendor!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] })
      onToast(t('common.deleteSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  return (
    <div className="w-[440px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <h2 className="font-bold text-gray-800 text-sm">
          {isEdit ? t('vendor.edit') : t('vendor.add')}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-xl leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('vendor.no')} *</label>
            {isEdit ? (
              <input className="input" value={form.vendorNo} disabled />
            ) : (
              <div className="input bg-gray-50 text-gray-500 font-mono text-sm">{form.vendorNo}</div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('vendor.code')} *</label>
            <input className="input" value={form.vendorCode}
              onChange={(e) => setForm(f => ({ ...f, vendorCode: e.target.value.toUpperCase() }))}
              disabled={isEdit} placeholder="VEND001" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('vendor.englishName')} *</label>
          <input className="input" value={form.englishName}
            onChange={(e) => setForm(f => ({ ...f, englishName: e.target.value }))}
            placeholder="Vendor Name" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('vendor.localName')}</label>
          <input className="input" value={form.localName}
            onChange={(e) => setForm(f => ({ ...f, localName: e.target.value }))}
            placeholder="ຊື່ຜູ້ສະໜອງ" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('vendor.phone')}</label>
            <input className="input" value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="020 xxxx xxxx" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('vendor.email')}</label>
            <input type="email" className={`input ${form.email && !emailValid ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="email@example.com" />
            {form.email && !emailValid && (
              <p className="text-xs text-red-500 mt-1">Invalid email format</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('vendor.taxId')}</label>
            <input className="input" value={form.taxId}
              onChange={(e) => setForm(f => ({ ...f, taxId: e.target.value }))}
              placeholder="Tax ID" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('vendor.paymentTerms')}</label>
            <input className="input" value={form.paymentTerms}
              onChange={(e) => setForm(f => ({ ...f, paymentTerms: e.target.value }))}
              placeholder="Net 30" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('vendor.address')}</label>
          <textarea className="input resize-none" rows={2} value={form.address}
            onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
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
              disabled={saveMutation.isPending || !form.vendorNo || !form.vendorCode || !form.englishName || !emailValid}
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

export default function VendorPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [panel, setPanel] = useState<{ open: boolean; vendor: Vendor | null }>({ open: false, vendor: null })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorApi.getAll({ limit: 100 }),
  })

  const allVendors = data?.data.data.data ?? []

  const vendors = useMemo(() => {
    if (!search.trim()) return allVendors
    const q = search.toLowerCase()
    return allVendors.filter((v) =>
      [v.vendorNo, v.vendorCode, v.englishName, v.localName, v.phone, v.taxId].some(
        (val) => val && String(val).toLowerCase().includes(q),
      ),
    )
  }, [allVendors, search])

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{t('vendor.title')}</h1>
            <p className="text-slate-300 text-xs mt-0.5">{vendors.length} / {allVendors.length} {t('common.items')}</p>
          </div>
          <button onClick={() => setPanel({ open: true, vendor: null })}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + {t('vendor.add')}
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
                <th className="px-5 py-3 font-medium">{t('vendor.no')}</th>
                <th className="px-5 py-3 font-medium">{t('vendor.englishName')}</th>
                <th className="px-5 py-3 font-medium">{t('vendor.phone')}</th>
                <th className="px-5 py-3 font-medium">{t('vendor.taxId')}</th>
                <th className="px-5 py-3 font-medium">{t('vendor.paymentTerms')}</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : vendors.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : vendors.map((v) => (
                <tr key={v.id} onClick={() => setPanel({ open: true, vendor: v })}
                  className={`cursor-pointer transition-colors hover:bg-blue-50 ${panel.vendor?.id === v.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                  <td className="px-5 py-3">
                    <p className="font-mono font-semibold text-slate-700">{v.vendorNo}</p>
                    <p className="text-xs text-gray-400">{v.vendorCode}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{v.englishName}</p>
                    {v.localName && <p className="text-xs text-gray-400">{v.localName}</p>}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{v.phone ?? '-'}</td>
                  <td className="px-5 py-3 text-gray-500">{v.taxId ?? '-'}</td>
                  <td className="px-5 py-3 text-gray-500">{v.paymentTerms ?? '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                      {v.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {panel.open && (
        <VendorPanel vendor={panel.vendor}
          onClose={() => setPanel({ open: false, vendor: null })} onToast={showToast} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
