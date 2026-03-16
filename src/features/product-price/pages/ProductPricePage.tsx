import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { productPriceApi } from '../services/product-price.service'
import { productApi } from '@/features/product/services/product.service'
import type { ProductPrice, CreateProductPricePayload, UpdateProductPricePayload } from '../types/product-price.types'

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
      type === 'success' ? 'bg-green-600' : 'bg-red-500'
    }`}>{message}</div>
  )
}

const PRICE_TYPES = ['RETAIL', 'WHOLESALE', 'VIP', 'MEMBER', 'COST']
const CURRENCIES = ['LAK', 'THB', 'USD']

function PricePanel({
  price, onClose, onToast,
}: {
  price: ProductPrice | null
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const isEdit = !!price
  const today = new Date().toISOString().slice(0, 10)

  const { data: productsData } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => productApi.getAll({ limit: 100 }),
  })
  const products = productsData?.data.data.data ?? []

  const [form, setForm] = useState<CreateProductPricePayload>({
    productId: price?.productId ?? 0,
    priceType: price?.priceType ?? 'RETAIL',
    price: price?.price ?? 0,
    currency: price?.currency ?? 'LAK',
    effectiveDate: price?.effectiveDate?.slice(0, 10) ?? today,
    expiryDate: price?.expiryDate?.slice(0, 10) ?? '',
    remarks: price?.remarks ?? '',
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      if (isEdit) {
        const payload: UpdateProductPricePayload = {
          price: form.price,
          currency: form.currency,
          effectiveDate: form.effectiveDate,
          expiryDate: form.expiryDate || null,
          remarks: form.remarks || undefined,
        }
        return productPriceApi.update(price!.id, payload)
      }
      return productPriceApi.create({
        ...form,
        expiryDate: form.expiryDate || undefined,
        remarks: form.remarks || undefined,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-prices'] })
      onToast(isEdit ? t('common.updateSuccess') : t('common.createSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const canSubmit = form.productId && form.price >= 0 && form.effectiveDate

  return (
    <div className="w-[420px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-bold text-gray-800 text-sm">
          {isEdit ? t('productPrice.edit') : t('productPrice.add')}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        {/* Product */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('product.title')} *</label>
          <select className="input" value={form.productId || ''} disabled={isEdit}
            onChange={(e) => setForm(f => ({ ...f, productId: Number(e.target.value) }))}>
            <option value="">— {t('common.select')} —</option>
            {products.map((p: any) => (
              <option key={p.id} value={p.id}>{p.productCode} - {p.productName}</option>
            ))}
          </select>
        </div>

        {/* Price Type */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('productPrice.priceType')} *</label>
          <select className="input" value={form.priceType} disabled={isEdit}
            onChange={(e) => setForm(f => ({ ...f, priceType: e.target.value }))}>
            {PRICE_TYPES.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
          </select>
        </div>

        {/* Price + Currency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('productPrice.price')} *</label>
            <input type="number" className="input" value={form.price}
              onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))}
              min="0" step="0.01" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('productPrice.currency')}</label>
            <select className="input" value={form.currency}
              onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Effective + Expiry date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('productPrice.effectiveDate')} *</label>
            <input type="date" className="input" value={form.effectiveDate}
              onChange={(e) => setForm(f => ({ ...f, effectiveDate: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('productPrice.expiryDate')}</label>
            <input type="date" className="input" value={form.expiryDate ?? ''}
              onChange={(e) => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('common.remarks')}</label>
          <textarea className="input resize-none" rows={2} value={form.remarks ?? ''}
            onChange={(e) => setForm(f => ({ ...f, remarks: e.target.value }))} />
        </div>
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
        <button onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !canSubmit}
          className="btn-primary flex-1 py-2 text-sm disabled:opacity-50">
          {saveMutation.isPending ? t('common.saving') : t('common.save')}
        </button>
        <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">{t('common.cancel')}</button>
      </div>
    </div>
  )
}

export default function ProductPricePage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [selected, setSelected] = useState<ProductPrice | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [filterProduct, setFilterProduct] = useState('')
  const [filterType, setFilterType] = useState('')
  const [page, setPage] = useState(1)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const { data: productsData } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => productApi.getAll({ limit: 100 }),
  })
  const products = productsData?.data.data.data ?? []

  const { data, isLoading } = useQuery({
    queryKey: ['product-prices', page, filterProduct, filterType],
    queryFn: () => productPriceApi.getAll({
      page,
      limit: 20,
      productId: filterProduct ? Number(filterProduct) : undefined,
      priceType: filterType || undefined,
    }),
  })

  const prices = data?.data.data.data ?? []
  const total = data?.data.data.total ?? 0
  const totalPages = data?.data.data.totalPages ?? 1

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productPriceApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-prices'] })
      setDeleteId(null)
      showToast(t('common.deleteSuccess'), 'success')
    },
    onError: (e: any) => showToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{t('productPrice.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('productPrice.subtitle')}</p>
        </div>
        <button onClick={() => { setSelected(null); setShowPanel(true) }} className="btn-primary px-4 py-2 text-sm">
          + {t('productPrice.add')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select className="input max-w-xs" value={filterProduct}
          onChange={(e) => { setFilterProduct(e.target.value); setPage(1) }}>
          <option value="">{t('common.allProducts')}</option>
          {products.map((p: any) => <option key={p.id} value={p.id}>{p.productCode} - {p.productName}</option>)}
        </select>
        <select className="input max-w-[160px]" value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1) }}>
          <option value="">{t('common.allTypes')}</option>
          {PRICE_TYPES.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-gray-500 text-left">
                <th className="px-4 py-3 font-medium">{t('product.title')}</th>
                <th className="px-4 py-3 font-medium">{t('productPrice.priceType')}</th>
                <th className="px-4 py-3 font-medium text-right">{t('productPrice.price')}</th>
                <th className="px-4 py-3 font-medium">{t('productPrice.currency')}</th>
                <th className="px-4 py-3 font-medium">{t('productPrice.effectiveDate')}</th>
                <th className="px-4 py-3 font-medium">{t('productPrice.expiryDate')}</th>
                <th className="px-4 py-3 font-medium">{t('common.status')}</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">{t('common.loading')}</td></tr>
              ) : prices.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">{t('common.noData')}</td></tr>
              ) : prices.map((pp: ProductPrice) => (
                <tr key={pp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{pp.product?.productName}</p>
                    <p className="text-xs text-gray-400">{pp.product?.productCode}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {pp.priceType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">
                    {Number(pp.price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{pp.currency}</td>
                  <td className="px-4 py-3 text-gray-600">{pp.effectiveDate?.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-gray-400">{pp.expiryDate?.slice(0, 10) ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      pp.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {pp.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {deleteId === pp.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => deleteMutation.mutate(pp.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium">
                          {t('common.confirm')}
                        </button>
                        <button onClick={() => setDeleteId(null)} className="text-gray-400 text-xs">
                          {t('common.cancel')}
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => { setSelected(pp); setShowPanel(true) }}
                          className="text-blue-400 hover:text-blue-600 text-xs">{t('common.edit')}</button>
                        <button onClick={() => setDeleteId(pp.id)}
                          className="text-red-400 hover:text-red-600 text-xs">{t('common.delete')}</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between text-sm text-gray-500">
          <span>{t('common.total')}: {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">←</button>
            <span className="px-2 py-1">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">→</button>
          </div>
        </div>
      </div>

      {/* Side panel */}
      {showPanel && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/20" onClick={() => setShowPanel(false)} />
          <PricePanel price={selected} onClose={() => setShowPanel(false)} onToast={showToast} />
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
