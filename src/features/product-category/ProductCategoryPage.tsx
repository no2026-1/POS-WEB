import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { productCategoryApi } from './product-category.api'
import type { ProductCategory, CreateProductCategoryPayload } from './product-category.types'

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

function CategoryPanel({
  category, allCategories, onClose, onToast,
}: {
  category: ProductCategory | null
  allCategories: ProductCategory[]
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const isEdit = !!category

  const [form, setForm] = useState<CreateProductCategoryPayload>({
    categoryCode: category?.categoryCode ?? '',
    categoryName: category?.categoryName ?? '',
    parentId: category?.parentId ?? undefined,
    remarks: category?.remarks ?? '',
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  const parentOptions = allCategories.filter((c) => c.id !== category?.id)

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = clean(form) as CreateProductCategoryPayload
      return isEdit ? productCategoryApi.update(category!.id, payload) : productCategoryApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-categories'] })
      onToast(isEdit ? t('common.updateSuccess') : t('common.createSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => productCategoryApi.delete(category!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-categories'] })
      onToast(t('common.deleteSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <h2 className="font-bold text-gray-800 text-sm">
          {isEdit ? t('productCategory.edit') : t('productCategory.add')}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-xl leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('productCategory.code')} *</label>
          <input className="input" value={form.categoryCode}
            onChange={(e) => setForm(f => ({ ...f, categoryCode: e.target.value.toUpperCase() }))}
            disabled={isEdit} placeholder="BEV" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('productCategory.name')} *</label>
          <input className="input" value={form.categoryName}
            onChange={(e) => setForm(f => ({ ...f, categoryName: e.target.value }))}
            placeholder="Beverages" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('productCategory.parent')}</label>
          <select className="input" value={form.parentId ?? ''}
            onChange={(e) => setForm(f => ({ ...f, parentId: e.target.value ? Number(e.target.value) : undefined }))}>
            <option value="">— {t('productCategory.noParent')} —</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.categoryCode} - {c.categoryName}</option>
            ))}
          </select>
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
              disabled={saveMutation.isPending || !form.categoryCode || !form.categoryName}
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

export default function ProductCategoryPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [panel, setPanel] = useState<{ open: boolean; category: ProductCategory | null }>({ open: false, category: null })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => productCategoryApi.getAll({ limit: 100 }),
  })

  const allCategories = data?.data.data.data ?? []

  const categories = useMemo(() => {
    if (!search.trim()) return allCategories
    const q = search.toLowerCase()
    return allCategories.filter((c) =>
      [c.categoryCode, c.categoryName].some((v) => v && String(v).toLowerCase().includes(q)),
    )
  }, [allCategories, search])

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{t('productCategory.title')}</h1>
            <p className="text-slate-300 text-xs mt-0.5">{categories.length} / {allCategories.length} {t('common.items')}</p>
          </div>
          <button onClick={() => setPanel({ open: true, category: null })}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + {t('productCategory.add')}
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
                <th className="px-5 py-3 font-medium">{t('productCategory.code')}</th>
                <th className="px-5 py-3 font-medium">{t('productCategory.name')}</th>
                <th className="px-5 py-3 font-medium">{t('productCategory.parent')}</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : categories.map((c) => (
                <tr key={c.id} onClick={() => setPanel({ open: true, category: c })}
                  className={`cursor-pointer transition-colors hover:bg-blue-50 ${panel.category?.id === c.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                  <td className="px-5 py-3 font-mono font-semibold text-slate-700">{c.categoryCode}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{c.categoryName}</td>
                  <td className="px-5 py-3 text-gray-500">{c.parent?.categoryName ?? '-'}</td>
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
        <CategoryPanel category={panel.category} allCategories={allCategories}
          onClose={() => setPanel({ open: false, category: null })} onToast={showToast} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
