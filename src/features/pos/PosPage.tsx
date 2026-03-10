import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { sessionApi } from '@/features/session/session.api'
import { posOrderApi, paymentApi } from '@/features/pos-order/pos-order.api'
import { productApi } from '@/features/product/product.api'
import { productCategoryApi } from '@/features/product-category/product-category.api'
import { useAuthStore } from '@/stores/auth.store'
import type { PosOrderLine } from '@/features/pos-order/pos-order.types'

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
      type === 'success' ? 'bg-green-600' : 'bg-red-500'
    }`}>{message}</div>
  )
}

function genNo(prefix: string) {
  const now = new Date()
  return `${prefix}${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
}

interface CartItem {
  productId: number
  productCode: string
  productName: string
  unitId: number
  unitCode: string
  qty: number
  price: number
  lineTotal: number
}

export default function PosPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const [categoryFilter, setCategoryFilter] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [tendered, setTendered] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Get open session
  const { data: sessionsData } = useQuery({
    queryKey: ['sessions', 'OPEN'],
    queryFn: () => sessionApi.getAll({ status: 'OPEN', limit: 10 }),
  })
  const openSession = sessionsData?.data.data.data?.[0] ?? null

  // Products
  const { data: productsData } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => productApi.getAll({ limit: 100 }),
  })
  const allProducts = productsData?.data.data.data ?? []

  // Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['product-categories-all'],
    queryFn: () => productCategoryApi.getAll({ limit: 100 }),
  })
  const categories = categoriesData?.data.data.data ?? []

  const products = useMemo(() => {
    let list = allProducts
    if (categoryFilter) list = list.filter((p) => p.categoryId === categoryFilter)
    if (search.trim()) list = list.filter((p) =>
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.productCode.toLowerCase().includes(search.toLowerCase())
    )
    return list
  }, [allProducts, categoryFilter, search])

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  function addToCart(product: any) {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id)
      if (existing) {
        return prev.map((c) => c.productId === product.id
          ? { ...c, qty: c.qty + 1, lineTotal: +(( c.qty + 1) * c.price).toFixed(2) }
          : c
        )
      }
      return [...prev, {
        productId: product.id,
        productCode: product.productCode,
        productName: product.productName,
        unitId: product.uomId ?? 1,
        unitCode: product.uom?.uomCode ?? 'PCS',
        qty: 1,
        price: Number(product.sellingPrice ?? 0),
        lineTotal: Number(product.sellingPrice ?? 0),
      }]
    })
  }

  function updateQty(productId: number, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.productId !== productId))
    } else {
      setCart((prev) => prev.map((c) => c.productId === productId
        ? { ...c, qty, lineTotal: +(qty * c.price).toFixed(2) }
        : c
      ))
    }
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((c) => c.productId !== productId))
  }

  const totalAmt = cart.reduce((s, c) => s + c.lineTotal, 0)
  const change = tendered ? Math.max(0, Number(tendered) - totalAmt) : 0

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!openSession) throw new Error('No open session')
      const now = new Date()
      const posDate = now.toISOString().slice(0, 10)
      const posTime = now.toTimeString().slice(0, 8)
      const posNo = genNo('POS')

      // Create order
      const orderRes = await posOrderApi.create({
        posNo,
        posDate,
        posTime,
        orderType: 'RETAIL',
        sessionId: openSession.id,
        locationId: openSession.posConfig?.id ?? 1,
        saleAmt: totalAmt,
        totalAmt,
        createId: user?.id,
      })
      const orderId = orderRes.data.data.id

      // Add lines
      for (let i = 0; i < cart.length; i++) {
        const item = cart[i]
        await posOrderApi.addLine({
          posOrderId: orderId,
          lineNo: i + 1,
          productId: item.productId,
          unitId: item.unitId,
          qty: item.qty,
          price: item.price,
          lineAmt: item.lineTotal,
          lineTotal: item.lineTotal,
        })
      }

      return orderId
    },
    onSuccess: (orderId) => {
      setCurrentOrderId(orderId)
      setShowPayment(true)
    },
    onError: (e: any) => showToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrderId) throw new Error('No order')
      const now = new Date()
      const paymentNo = genNo('PAY')

      await paymentApi.create({
        paymentNo,
        paymentDate: now.toISOString(),
        paymentTime: now.toISOString(),
        posOrderId: currentOrderId,
        paymentAmt: Number(tendered),
      })

      await posOrderApi.confirm(currentOrderId)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pos-orders'] })
      setCart([])
      setCurrentOrderId(null)
      setShowPayment(false)
      setTendered('')
      showToast(t('pos.paySuccess'), 'success')
    },
    onError: (e: any) => showToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  function handlePay() {
    if (cart.length === 0) return
    if (currentOrderId) {
      setShowPayment(true)
    } else {
      createOrderMutation.mutate()
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Left: Products */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold">{t('pos.title')}</h1>
            {openSession ? (
              <p className="text-green-400 text-xs mt-0.5">● {openSession.sessionNo} — {openSession.posConfig?.configName}</p>
            ) : (
              <p className="text-red-400 text-xs mt-0.5">● {t('pos.noSession')}</p>
            )}
          </div>
          <button onClick={() => navigate('/session')}
            className="text-slate-300 hover:text-white text-xs underline">
            {t('session.title')}
          </button>
        </div>

        {!openSession ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
            <p className="text-lg font-medium">{t('pos.noSession')}</p>
            <button onClick={() => navigate('/session')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
              {t('session.open')}
            </button>
          </div>
        ) : (
          <>
            {/* Search + Category filter */}
            <div className="px-4 py-2 bg-white border-b border-gray-200 flex gap-2 flex-wrap">
              <input
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
                placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
              <button onClick={() => setCategoryFilter(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${!categoryFilter ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                All
              </button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${categoryFilter === cat.id ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {cat.categoryName}
                </button>
              ))}
            </div>

            {/* Product grid */}
            <div className="flex-1 overflow-auto p-4">
              {products.length === 0 ? (
                <p className="text-center text-gray-400 mt-12">{t('common.noData')}</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {products.map((p) => (
                    <button key={p.id} onClick={() => addToCart(p)}
                      className="bg-white rounded-xl border border-gray-200 p-3 text-left hover:border-blue-400 hover:shadow-md transition-all active:scale-95">
                      <div className="w-full h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-2 flex items-center justify-center text-2xl">
                        🛍️
                      </div>
                      <p className="text-xs font-semibold text-gray-800 truncate">{p.productName}</p>
                      <p className="text-xs text-gray-400">{p.productCode}</p>
                      <p className="text-sm font-bold text-blue-600 mt-1">
                        {(p.sellingPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right: Cart */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl">
        <div className="px-4 py-3 bg-slate-700 text-white font-semibold text-sm">
          {t('pos.cart')} ({cart.length} {t('common.items')})
        </div>

        <div className="flex-1 overflow-auto">
          {cart.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-300 text-sm">{t('pos.emptyCart')}</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={item.productId} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} × {item.qty}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">{item.lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <button onClick={() => removeFromCart(item.productId)}
                        className="text-xs text-red-400 hover:text-red-600">✕</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQty(item.productId, item.qty - 1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm flex items-center justify-center">
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                    <button onClick={() => updateQty(item.productId, item.qty + 1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm flex items-center justify-center">
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total + Pay */}
        <div className="border-t border-gray-200 px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">{t('pos.total')}</span>
            <span className="text-xl font-bold text-gray-800">{totalAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          {cart.length > 0 && (
            <button onClick={handlePay}
              disabled={createOrderMutation.isPending}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-50">
              {createOrderMutation.isPending ? t('common.saving') : `💳 ${t('pos.pay')}`}
            </button>
          )}
          {cart.length > 0 && (
            <button onClick={() => setCart([])}
              className="w-full mt-2 text-xs text-red-400 hover:text-red-600 text-center">
              {t('pos.clearCart')}
            </button>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96">
            <h3 className="font-bold text-gray-800 text-lg mb-4">{t('pos.payment')}</h3>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>{t('pos.total')}</span>
                <span className="font-bold text-gray-800 text-lg">{totalAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('pos.tendered')}</label>
              <input
                type="number"
                className="input w-full text-lg font-bold text-right"
                value={tendered}
                onChange={(e) => setTendered(e.target.value)}
                placeholder="0.00"
                autoFocus
                min={totalAmt}
                step="0.01"
              />
            </div>

            {/* Quick amount buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[...new Set([totalAmt, Math.ceil(totalAmt / 10) * 10, Math.ceil(totalAmt / 50) * 50, Math.ceil(totalAmt / 100) * 100])].map((amt, i) => (
                <button key={i} onClick={() => setTendered(String(amt))}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2 rounded-lg transition">
                  {amt.toLocaleString()}
                </button>
              ))}
            </div>

            {tendered && Number(tendered) >= totalAmt && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex justify-between">
                <span className="text-sm text-green-700">{t('pos.change')}</span>
                <span className="font-bold text-green-700">{change.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => payMutation.mutate()}
                disabled={payMutation.isPending || !tendered || Number(tendered) < totalAmt}
                className="btn-primary flex-1 py-3 text-base font-bold disabled:opacity-50">
                {payMutation.isPending ? t('common.saving') : t('pos.confirmPayment')}
              </button>
              <button onClick={() => { setShowPayment(false); setCurrentOrderId(null) }}
                className="btn-secondary px-4">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
