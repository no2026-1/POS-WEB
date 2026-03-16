import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { exchangeRateApi } from '../services/exchange-rate.service'
import type { ExchangeRate, CreateExchangeRatePayload, UpdateExchangeRatePayload } from '../types/exchange-rate.types'

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

function ExchangeRatePanel({
  item,
  onClose,
  onToast,
}: {
  item: ExchangeRate | null
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const isEdit = !!item

  const [form, setForm] = useState<{
    fromCurrency: string
    toCurrency: string
    rate: string
    effectiveDate: string
    expiryDate: string
    remarks: string
    isActive: boolean
  }>({
    fromCurrency: item?.fromCurrency ?? '',
    toCurrency: item?.toCurrency ?? '',
    rate: item?.rate != null ? String(item.rate) : '',
    effectiveDate: item?.effectiveDate ?? '',
    expiryDate: item?.expiryDate ?? '',
    remarks: item?.remarks ?? '',
    isActive: item?.isActive ?? true,
  })

  const [confirmDelete, setConfirmDelete] = useState(false)

  const canSave =
    form.fromCurrency.trim() !== '' &&
    form.toCurrency.trim() !== '' &&
    Number(form.rate) > 0 &&
    form.effectiveDate !== ''

  const saveMutation = useMutation({
    mutationFn: () => {
      if (isEdit) {
        const payload: UpdateExchangeRatePayload = clean({
          rate: Number(form.rate),
          effectiveDate: form.effectiveDate,
          expiryDate: form.expiryDate || undefined,
          remarks: form.remarks || undefined,
          isActive: form.isActive,
        })
        return exchangeRateApi.update(item!.id, payload)
      } else {
        const payload: CreateExchangeRatePayload = {
          fromCurrency: form.fromCurrency.trim().toUpperCase(),
          toCurrency: form.toCurrency.trim().toUpperCase(),
          rate: Number(form.rate),
          effectiveDate: form.effectiveDate,
          ...(form.expiryDate ? { expiryDate: form.expiryDate } : {}),
          ...(form.remarks ? { remarks: form.remarks } : {}),
        }
        return exchangeRateApi.create(payload)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exchange-rates'] })
      onToast(isEdit ? t('common.updateSuccess') : t('common.createSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => exchangeRateApi.delete(item!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exchange-rates'] })
      onToast(t('common.deleteSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <h2 className="font-bold text-gray-800 text-sm">
          {isEdit ? t('exchangeRate.title') + ' — Edit' : t('exchangeRate.add')}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-xl leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('exchangeRate.fromCurrency')} *</label>
            <input
              className="input w-full"
              value={form.fromCurrency}
              onChange={(e) => setForm(f => ({ ...f, fromCurrency: e.target.value.toUpperCase() }))}
              disabled={isEdit}
              maxLength={10}
              placeholder="USD"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('exchangeRate.toCurrency')} *</label>
            <input
              className="input w-full"
              value={form.toCurrency}
              onChange={(e) => setForm(f => ({ ...f, toCurrency: e.target.value.toUpperCase() }))}
              disabled={isEdit}
              maxLength={10}
              placeholder="THB"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('exchangeRate.rate')} *</label>
          <input
            className="input"
            type="number"
            min="0"
            step="any"
            value={form.rate}
            onChange={(e) => setForm(f => ({ ...f, rate: e.target.value }))}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('exchangeRate.effectiveDate')} *</label>
          <input
            className="input"
            type="date"
            value={form.effectiveDate}
            onChange={(e) => setForm(f => ({ ...f, effectiveDate: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('exchangeRate.expiryDate')}</label>
          <input
            className="input"
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm(f => ({ ...f, expiryDate: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('common.remarks')}</label>
          <textarea
            className="input resize-none"
            rows={2}
            value={form.remarks}
            onChange={(e) => setForm(f => ({ ...f, remarks: e.target.value }))}
          />
        </div>

        {isEdit && (
          <div className="flex items-center gap-2">
            <input
              id="er-isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="er-isActive" className="text-xs font-medium text-gray-600">{t('common.active')}</label>
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-2">
        {!confirmDelete ? (
          <>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !canSave}
              className="btn-primary w-full disabled:opacity-50"
            >
              {saveMutation.isPending ? t('common.saving') : t('common.save')}
            </button>
            <button onClick={onClose} className="btn-secondary w-full">{t('common.cancel')}</button>
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
            <p className="text-xs text-center text-gray-500">{t('common.deleteConfirmMessage')}</p>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg w-full disabled:opacity-50"
            >
              {deleteMutation.isPending ? t('common.deleting') : t('common.confirm')}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="btn-secondary w-full">{t('common.cancel')}</button>
          </>
        )}
      </div>
    </div>
  )
}

export default function ExchangeRatePage() {
  const { t } = useTranslation()
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [panel, setPanel] = useState<{ open: boolean; item: ExchangeRate | null }>({ open: false, item: null })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: () => exchangeRateApi.getAll({ limit: 100 }),
  })

  const allRates: ExchangeRate[] = data?.data.data.data ?? []

  const rates = useMemo(() => {
    return allRates.filter((r) => {
      if (filterFrom && !r.fromCurrency.toLowerCase().includes(filterFrom.toLowerCase())) return false
      if (filterTo && !r.toCurrency.toLowerCase().includes(filterTo.toLowerCase())) return false
      return true
    })
  }, [allRates, filterFrom, filterTo])

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{t('exchangeRate.title')}</h1>
            <p className="text-slate-300 text-xs mt-0.5">{rates.length} / {allRates.length} {t('common.items')}</p>
          </div>
          <button
            onClick={() => setPanel({ open: true, item: null })}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + {t('exchangeRate.add')}
          </button>
        </div>

        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex gap-3">
          <input
            className="border border-blue-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-40"
            placeholder={t('exchangeRate.fromCurrency')}
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
          />
          <input
            className="border border-blue-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-40"
            placeholder={t('exchangeRate.toCurrency')}
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left sticky top-0">
              <tr>
                <th className="px-5 py-3 font-medium">{t('exchangeRate.fromCurrency')}</th>
                <th className="px-5 py-3 font-medium">{t('exchangeRate.toCurrency')}</th>
                <th className="px-5 py-3 font-medium">{t('exchangeRate.rate')}</th>
                <th className="px-5 py-3 font-medium">{t('exchangeRate.effectiveDate')}</th>
                <th className="px-5 py-3 font-medium">{t('exchangeRate.expiryDate')}</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : rates.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : rates.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setPanel({ open: true, item: r })}
                  className={`cursor-pointer transition-colors hover:bg-blue-50 ${panel.item?.id === r.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                >
                  <td className="px-5 py-3 font-mono font-semibold text-slate-700">{r.fromCurrency}</td>
                  <td className="px-5 py-3 font-mono font-semibold text-slate-700">{r.toCurrency}</td>
                  <td className="px-5 py-3 text-gray-800">{r.rate}</td>
                  <td className="px-5 py-3 text-gray-600">{r.effectiveDate}</td>
                  <td className="px-5 py-3 text-gray-500">{r.expiryDate ?? '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                      {r.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {panel.open && (
        <ExchangeRatePanel
          item={panel.item}
          onClose={() => setPanel({ open: false, item: null })}
          onToast={showToast}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
