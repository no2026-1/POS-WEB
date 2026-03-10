import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { posOrderApi } from '@/features/pos-order/pos-order.api'
import { sessionApi } from '@/features/session/session.api'

export default function DashboardPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)

  const { data: ordersData } = useQuery({
    queryKey: ['dashboard-orders', today],
    queryFn: () => posOrderApi.getAll({ page: 1, limit: 10, dateFrom: today, dateTo: today }),
  })
  const recentOrders = ordersData?.data.data ?? []
  const todayTotal = (recentOrders as any[]).reduce((sum, o) => sum + Number(o.totalAmt ?? 0), 0)
  const todayCount = (ordersData?.data as any)?.total ?? recentOrders.length

  const { data: sessionsData } = useQuery({
    queryKey: ['dashboard-sessions'],
    queryFn: () => sessionApi.getAll({ page: 1, limit: 100, status: 'OPEN' }),
  })
  const openSessions = sessionsData?.data.data.data ?? []
  const openSessionCount = (sessionsData?.data.data as any)?.total ?? openSessions.length

  const avgOrder = todayCount > 0 ? todayTotal / todayCount : 0

  const statCards = [
    {
      label: t('dashboard.todaySales'),
      value: todayTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      sub: 'Total revenue today',
      gradient: 'from-indigo-500 to-blue-600',
      icon: '💰',
    },
    {
      label: t('dashboard.todayOrders'),
      value: String(todayCount),
      sub: 'Orders placed today',
      gradient: 'from-emerald-500 to-teal-600',
      icon: '🧾',
    },
    {
      label: t('dashboard.openSessions'),
      value: String(openSessionCount),
      sub: 'Active POS sessions',
      gradient: 'from-orange-500 to-amber-500',
      icon: '🖥',
    },
    {
      label: t('dashboard.avgOrder'),
      value: avgOrder.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      sub: 'Per order average',
      gradient: 'from-purple-500 to-violet-600',
      icon: '📊',
    },
  ]

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-500',
      CONFIRMED: 'bg-emerald-100 text-emerald-700',
      CANCELLED: 'bg-red-100 text-red-600',
    }
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-500'}`
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">Overview</p>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('nav.dashboard')}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {t('auth.welcome')}, <span className="text-gray-600 font-medium">{user?.firstName} {user?.lastName}</span>
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-md`}>
            <div className="absolute top-3 right-4 text-2xl opacity-20">{card.icon}</div>
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">{card.label}</p>
            <p className="text-2xl font-bold leading-tight">{card.value}</p>
            <p className="text-xs text-white/60 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800 text-sm">{t('dashboard.recentOrders')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest transactions today</p>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">POS No.</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('common.status')}</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('posHistory.total')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(recentOrders as any[]).length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-gray-300 text-sm">
                    No orders today yet
                  </td>
                </tr>
              ) : (recentOrders as any[]).map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-gray-800">{o.posNo}</td>
                  <td className="px-5 py-3.5"><span className={statusBadge(o.status)}>{o.status}</span></td>
                  <td className="px-5 py-3.5 text-right font-bold text-gray-700">
                    {Number(o.totalAmt).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Open Sessions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800 text-sm">{t('dashboard.openSessions')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{openSessionCount} active</p>
            </div>
            <button onClick={() => navigate('/pos')}
              className="btn-primary text-xs px-3 py-2">
              {t('session.goToPOS')}
            </button>
          </div>
          <div className="flex-1 divide-y divide-gray-50">
            {(openSessions as any[]).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                <p className="text-sm">No open sessions</p>
              </div>
            ) : (openSessions as any[]).map((s) => (
              <div key={s.id} className="px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <p className="font-semibold text-sm text-gray-800">{s.sessionNo}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.posConfig?.configName ?? `Config #${s.posConfigId}`}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
