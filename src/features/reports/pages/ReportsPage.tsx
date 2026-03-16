import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const REPORT_CARDS = [
  {
    title: 'POS History',
    desc: 'View all sales transactions and order details',
    icon: '🧾',
    route: ROUTES.POS_HISTORY,
    color: 'from-indigo-500 to-blue-600',
  },
  {
    title: 'Daily Close',
    desc: 'End-of-day closing reports and summaries',
    icon: '📅',
    route: ROUTES.DAILY_CLOSE,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Stock Card',
    desc: 'Product stock movement history and balance',
    icon: '📦',
    route: ROUTES.STOCK_CARD,
    color: 'from-orange-500 to-amber-500',
  },
  {
    title: 'Stock Ledger',
    desc: 'Full inventory ledger with in/out movements',
    icon: '📋',
    route: ROUTES.STOCK,
    color: 'from-purple-500 to-violet-600',
  },
  {
    title: 'POS Returns',
    desc: 'Return and refund transaction records',
    icon: '↩️',
    route: ROUTES.POS_RETURN,
    color: 'from-red-500 to-rose-600',
  },
  {
    title: 'Customer Credit',
    desc: 'Customer credit balance and transaction history',
    icon: '💳',
    route: ROUTES.CUSTOMER_CREDIT,
    color: 'from-cyan-500 to-sky-600',
  },
]

export default function ReportsPage() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="mb-7">
        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">Analytics</p>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports</h1>
        <p className="text-gray-400 text-sm mt-1">View sales, inventory, and financial reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_CARDS.map((card) => (
          <button
            key={card.title}
            onClick={() => navigate(card.route)}
            className="text-left group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 p-5"
          >
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${card.color}`} />
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-xl mb-4 shadow-sm`}>
              <span>{card.icon}</span>
            </div>
            <p className="font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">{card.title}</p>
            <p className="text-xs text-gray-400 leading-relaxed">{card.desc}</p>
            <div className="mt-4 text-xs font-semibold text-indigo-500 group-hover:text-indigo-700 flex items-center gap-1">
              View Report <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
