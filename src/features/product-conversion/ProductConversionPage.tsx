import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { productConversionApi } from './product-conversion.api'
import { productApi } from '@/features/product/product.api'
import type { ProductConversion, CreateProductConversionPayload, UpdateProductConversionPayload } from './product-conversion.types'

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

function ProductConversionPanel({
  item,
  onClose,
  onToast,
}: {
  item: ProductConversion | null
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const isEdit = !!item

  const [form, setForm] = useState<{
    parentId: string
    childId: string
    conversionRatio: string
    remarks: string
    isActive: boolean
  }>({
    parentId: item?.parentId != null ? String(item.parentId) : '',
    childId: item?.childId != null ? String(item.childId) : '',
    conversionRatio: item?.conversionRatio != null ? String(item.conversionRatio) : '',
    remarks: item?.remarks ?? '',
    isActive: item?.isActive ?? true,
  })

  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data: productData } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => productApi.getAll({ limit: 100 }),
  })
  const products = productData?.data.data.data ?? []

  const parentId = Number(form.parentId)
  const childId = Number(form.childId)
  const ratio = Number(form.conversionRatio)
  const sameProduct = parentId > 0 && childId > 0 && parentId === childId
  const canSave = parentId > 0 && childId > 0 && ratio > 0 && !sameProduct

  const saveMutation = useMutation({
    mutationFn: () => {
      if (isEdit) {
        const payload: UpdateProductConversionPayload = clean({
          conversionRatio: ratio,
          remarks: form.remarks || undefined,
          isActive: form.isActive,
        })
        return productConversionApi.update(item!.id, payload)
      } else {
        const payload: CreateProductConversionPayload = {
          parentId,
          childId,
          conversionRatio: ratio,
          ...(form.remarks ? { remarks: form.remarks } : {}),
        }
        return productConversionApi.create(payload)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-conversions'] })
      onToast(isEdit ? t('common.updateSuccess') : t('common.createSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => productConversionApi.delete(item!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-conversions'] })
      onToast(t('common.deleteSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <h2 className="font-bold text-gray-800 text-sm">
          {isEdit ? t('productConversion.title') + ' — Edit' : t('productConversion.add')}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-xl leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('productConversion.parent')} *</label>
          <select
            className="input"
            value={form.parentId}
            onChange={(e) => setForm(f => ({ ...f, parentId: e.target.value }))}
            disabled={isEdit}
          >
            <option value="">{t('common.select')}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.productCode} — {p.productName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('productConversion.child')} *</label>
          <select
            className="input"
            value={form.childId}
            onChange={(e) => setForm(f => ({ ...f, childId: e.target.value }))}
            disabled={isEdit}
          >
            <option value="">{t('common.select')}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.productCode} — {p.productName}</option>
            ))}
          </select>
        </div>

        {sameProduct && (
          <p className="text-xs text-red-500">Parent and child product must be different</p>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('productConversion.ratio')} *</label>
          <input
            className="input"
            type="number"
            min="0"
            step="any"
            value={form.conversionRatio}
            onChange={(e) => setForm(f => ({ ...f, conversionRatio: e.target.value }))}
            placeholder="1.00"
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
              id="pc-isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="pc-isActive" className="text-xs font-medium text-gray-600">{t('common.active')}</label>
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

export default function ProductConversionPage() {
  const { t } = useTranslation()
  const [panel, setPanel] = useState<{ open: boolean; item: ProductConversion | null }>({ open: false, item: null })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['product-conversions'],
    queryFn: () => productConversionApi.getAll({ limit: 100 }),
  })

  const allConversions: ProductConversion[] = data?.data.data ?? []

  const conversions = useMemo(() => allConversions, [allConversions])

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{t('productConversion.title')}</h1>
            <p className="text-slate-300 text-xs mt-0.5">{conversions.length} {t('common.items')}</p>
          </div>
          <button
            onClick={() => setPanel({ open: true, item: null })}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + {t('productConversion.add')}
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left sticky top-0">
              <tr>
                <th className="px-5 py-3 font-medium">{t('productConversion.parent')}</th>
                <th className="px-5 py-3 font-medium">{t('productConversion.child')}</th>
                <th className="px-5 py-3 font-medium">{t('productConversion.ratio')}</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : conversions.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : conversions.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setPanel({ open: true, item: c })}
                  className={`cursor-pointer transition-colors hover:bg-blue-50 ${panel.item?.id === c.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                >
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {c.parent?.productName ?? c.parentId}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {c.child?.productName ?? c.childId}
                  </td>
                  <td className="px-5 py-3 text-gray-700">{c.conversionRatio}</td>
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
        <ProductConversionPanel
          item={panel.item}
          onClose={() => setPanel({ open: false, item: null })}
          onToast={showToast}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
