import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/features/auth/auth.api'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'th', label: 'ไทย' },
  { code: 'lo', label: 'ລາວ' },
]

export default function MainLayout() {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const navSections = [
    {
      label: null,
      items: [{ to: '/dashboard', label: t('nav.dashboard') }],
    },
    {
      label: t('nav.sectionMasterData'),
      items: [
        { to: '/branch', label: t('nav.branch') },
        { to: '/basic', label: t('nav.basic') },
        { to: '/department', label: t('nav.department') },
        { to: '/location', label: t('nav.location') },
        { to: '/employee', label: t('nav.employee') },
        { to: '/user', label: t('nav.user') },
      ],
    },
    {
      label: t('nav.sectionProduct'),
      items: [
        { to: '/uom', label: t('nav.uom') },
        { to: '/product-category', label: t('nav.productCategory') },
        { to: '/product-brand', label: t('nav.productBrand') },
        { to: '/product-group', label: t('nav.productGroup') },
        { to: '/product', label: t('nav.product') },
      ],
    },
    {
      label: t('nav.sectionPartners'),
      items: [
        { to: '/customer', label: t('nav.customer') },
        { to: '/vendor', label: t('nav.vendor') },
      ],
    },
    {
      label: t('nav.sectionInventory'),
      items: [
        { to: '/purchase-order', label: t('nav.purchaseOrder') },
        { to: '/goods-receive', label: t('nav.goodsReceive') },
        { to: '/stock-adjust', label: t('nav.stockAdjust') },
        { to: '/stock', label: t('nav.stock') },
      ],
    },
    {
      label: t('nav.sectionPOS'),
      items: [
        { to: '/pos-config', label: t('nav.posConfig') },
        { to: '/session', label: t('nav.session') },
        { to: '/pos', label: t('nav.pos') },
        { to: '/pos-history', label: t('nav.posHistory') },
        { to: '/pos-return', label: t('nav.posReturn') },
      ],
    },
    {
      label: t('nav.sectionReports'),
      items: [
        { to: '/daily-close', label: t('nav.dailyClose') },
        { to: '/stock-card', label: t('nav.stockCard') },
        { to: '/customer-credit', label: t('nav.customerCredit') },
      ],
    },
    {
      label: t('nav.sectionSettings'),
      items: [
        { to: '/exchange-rate', label: t('nav.exchangeRate') },
        { to: '/product-conversion', label: t('nav.productConversion') },
      ],
    },
  ]

  function changeLanguage(code: string) {
    i18n.changeLanguage(code)
    localStorage.setItem('pos-lang', code)
  }

  async function handleLogout() {
    await authApi.logout().catch(() => {})
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className="w-60 flex flex-col flex-shrink-0"
        style={{ background: 'linear-gradient(175deg, #1e1b4b 0%, #2d2a6e 50%, #1e3a5f 100%)' }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white font-bold text-base">P</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide leading-tight">POS System</p>
              <p className="text-indigo-300/70 text-[11px]">Management</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          {navSections.map((section, i) => (
            <div key={i} className={i > 0 ? 'mt-1' : ''}>
              {section.label && (
                <p className="px-3 pt-4 pb-1 text-[10px] font-bold text-indigo-300/50 uppercase tracking-widest">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all my-0.5 ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-indigo-200/75 hover:bg-white/8 hover:text-white'
                    }`
                  }
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all`}
                    style={{ background: 'currentColor', opacity: 0.5 }} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10">
          {/* Language switcher */}
          <div className="flex gap-1 mb-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  i18n.language === lang.code
                    ? 'bg-white/20 text-white'
                    : 'text-indigo-300/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* User info */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow">
              <span className="text-white text-xs font-bold">
                {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-indigo-300/60 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2.5 text-xs text-indigo-300/60 hover:text-red-300 transition-colors"
          >
            {t('common.logout')} →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className="p-6 max-w-[1400px] flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
