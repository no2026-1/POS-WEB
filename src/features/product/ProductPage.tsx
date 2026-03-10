import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { productApi } from './product.api'
import { productCategoryApi } from '@/features/product-category/product-category.api'
import { productBrandApi } from '@/features/product-brand/product-brand.api'
import { productGroupApi } from '@/features/product-group/product-group.api'
import { uomApi } from '@/features/uom/uom.api'
import type { Product, CreateProductPayload } from './product.types'

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

function ProductPanel({
  product, onClose, onToast,
}: {
  product: Product | null
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const isEdit = !!product

  const { data: catData } = useQuery({ queryKey: ['product-categories'], queryFn: () => productCategoryApi.getAll({ limit: 100 }) })
  const { data: brandData } = useQuery({ queryKey: ['product-brands'], queryFn: () => productBrandApi.getAll({ limit: 100 }) })
  const { data: groupData } = useQuery({ queryKey: ['product-groups'], queryFn: () => productGroupApi.getAll({ limit: 100 }) })
  const { data: uomData } = useQuery({ queryKey: ['uoms'], queryFn: () => uomApi.getAll({ limit: 100 }) })

  const categories = catData?.data.data.data ?? []
  const brands = brandData?.data.data.data ?? []
  const groups = groupData?.data.data.data ?? []
  const uoms = uomData?.data.data.data ?? []

  const [form, setForm] = useState<CreateProductPayload>({
    productCode: product?.productCode ?? '',
    productName: product?.productName ?? '',
    uomId: product?.uomId ?? 0,
    categoryId: product?.categoryId ?? undefined,
    groupId: product?.groupId ?? undefined,
    brandId: product?.brandId ?? undefined,
    costPrice: product?.costPrice ?? undefined,
    sellingPrice: product?.sellingPrice ?? undefined,
    trackStock: product?.trackStock ?? false,
    minStockLevel: product?.minStockLevel ?? undefined,
    remarks: product?.remarks ?? '',
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  const pricesValid =
    (form.costPrice === undefined || form.costPrice >= 0) &&
    (form.sellingPrice === undefined || form.sellingPrice >= 0)

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = clean(form) as CreateProductPayload
      return isEdit ? productApi.update(product!.id, payload) : productApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      onToast(isEdit ? t('common.updateSuccess') : t('common.createSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => productApi.delete(product!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      onToast(t('common.deleteSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  return (
    <div className="w-[440px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <h2 className="font-bold text-gray-800 text-sm">
          {isEdit ? t('product.edit') : t('product.add')}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-xl leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('product.code')} *</label>
            <input className="input" value={form.productCode}
              onChange={(e) => setForm(f => ({ ...f, productCode: e.target.value.toUpperCase() }))}
              disabled={isEdit} placeholder="PRD001" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('product.uom')} *</label>
            <select className="input" value={form.uomId || ''}
              onChange={(e) => setForm(f => ({ ...f, uomId: Number(e.target.value) }))}>
              <option value="">— {t('common.select')} —</option>
              {uoms.map((u) => <option key={u.id} value={u.id}>{u.uomCode} - {u.uomName}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('product.name')} *</label>
          <input className="input" value={form.productName}
            onChange={(e) => setForm(f => ({ ...f, productName: e.target.value }))}
            placeholder="Product Name" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('product.category')}</label>
            <select className="input" value={form.categoryId ?? ''}
              onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : undefined }))}>
              <option value="">— {t('common.select')} —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.categoryCode} - {c.categoryName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('product.group')}</label>
            <select className="input" value={form.groupId ?? ''}
              onChange={(e) => setForm(f => ({ ...f, groupId: e.target.value ? Number(e.target.value) : undefined }))}>
              <option value="">— {t('common.select')} —</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.groupCode} - {g.groupName}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('product.brand')}</label>
          <select className="input" value={form.brandId ?? ''}
            onChange={(e) => setForm(f => ({ ...f, brandId: e.target.value ? Number(e.target.value) : undefined }))}>
            <option value="">— {t('common.select')} —</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.brandCode} - {b.brandName}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('product.costPrice')}</label>
            <input type="number" className={`input ${form.costPrice !== undefined && form.costPrice < 0 ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.costPrice ?? ''}
              onChange={(e) => setForm(f => ({ ...f, costPrice: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="0.00" min="0" step="0.01" />
            {form.costPrice !== undefined && form.costPrice < 0 && (
              <p className="text-xs text-red-500 mt-1">Price must be 0 or greater</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('product.sellingPrice')}</label>
            <input type="number" className={`input ${form.sellingPrice !== undefined && form.sellingPrice < 0 ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.sellingPrice ?? ''}
              onChange={(e) => setForm(f => ({ ...f, sellingPrice: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="0.00" min="0" step="0.01" />
            {form.sellingPrice !== undefined && form.sellingPrice < 0 && (
              <p className="text-xs text-red-500 mt-1">Price must be 0 or greater</p>
            )}
          </div>
        </div>

        <div className="border border-gray-100 rounded-lg p-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.trackStock}
              onChange={(e) => setForm(f => ({ ...f, trackStock: e.target.checked }))}
              className="w-4 h-4 rounded" />
            <span className="text-sm font-medium text-gray-700">{t('product.trackStock')}</span>
          </label>
          {form.trackStock && (
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('product.minStock')}</label>
              <input type="number" className="input" value={form.minStockLevel ?? ''}
                onChange={(e) => setForm(f => ({ ...f, minStockLevel: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="0" min="0" />
            </div>
          )}
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
              disabled={saveMutation.isPending || !form.productCode || !form.productName || !form.uomId || !pricesValid}
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

export default function ProductPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [panel, setPanel] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getAll({ limit: 100 }),
  })

  const allProducts = data?.data.data.data ?? []

  const products = useMemo(() => {
    if (!search.trim()) return allProducts
    const q = search.toLowerCase()
    return allProducts.filter((p) =>
      [p.productCode, p.productName, p.category?.categoryName, p.brand?.brandName].some(
        (v) => v && String(v).toLowerCase().includes(q),
      ),
    )
  }, [allProducts, search])

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  function formatPrice(price?: number) {
    if (price === undefined || price === null) return '-'
    return price.toLocaleString()
  }

  return (
    <div className="flex h-full -m-6">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{t('product.title')}</h1>
            <p className="text-slate-300 text-xs mt-0.5">{products.length} / {allProducts.length} {t('common.items')}</p>
          </div>
          <button onClick={() => setPanel({ open: true, product: null })}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + {t('product.add')}
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
                <th className="px-5 py-3 font-medium">{t('product.code')}</th>
                <th className="px-5 py-3 font-medium">{t('product.name')}</th>
                <th className="px-5 py-3 font-medium">{t('product.category')}</th>
                <th className="px-5 py-3 font-medium">{t('product.uom')}</th>
                <th className="px-5 py-3 font-medium text-right">{t('product.sellingPrice')}</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : products.map((p) => (
                <tr key={p.id} onClick={() => setPanel({ open: true, product: p })}
                  className={`cursor-pointer transition-colors hover:bg-blue-50 ${panel.product?.id === p.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                  <td className="px-5 py-3 font-mono font-semibold text-slate-700">{p.productCode}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{p.productName}</p>
                    {p.brand && <p className="text-xs text-gray-400">{p.brand.brandName}</p>}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{p.category?.categoryName ?? '-'}</td>
                  <td className="px-5 py-3 text-gray-500">{p.uom?.uomCode ?? '-'}</td>
                  <td className="px-5 py-3 text-right font-medium text-gray-800">{formatPrice(p.sellingPrice)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                      {p.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {panel.open && (
        <ProductPanel product={panel.product}
          onClose={() => setPanel({ open: false, product: null })} onToast={showToast} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
