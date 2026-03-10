import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from './auth.api'
import { useAuthStore } from '@/stores/auth.store'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      const { accessToken, user } = res.data.data
      setAuth(accessToken, user)
      navigate('/dashboard')
    } catch {
      setError(t('auth.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a5f 100%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12">
        <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center mb-8 shadow-2xl">
          <span className="text-white font-black text-3xl">P</span>
        </div>
        <h2 className="text-white text-3xl font-bold mb-3 tracking-tight">POS System</h2>
        <p className="text-indigo-200/70 text-center max-w-xs text-sm leading-relaxed">
          Streamlined point-of-sale management for modern businesses.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-3 w-full max-w-xs">
          {['Inventory', 'POS Sales', 'Reports', 'Multi-user'].map((f) => (
            <div key={f} className="bg-white/8 rounded-xl px-4 py-2.5 text-center">
              <p className="text-white/80 text-xs font-medium">{f}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex flex-1 lg:flex-none lg:w-[420px] items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Header */}
            <div className="mb-7">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-4 shadow-md">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('auth.loginTitle')}</h1>
              <p className="text-sm text-gray-400 mt-1">{t('auth.loginSubtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input"
                  placeholder="admin@pos.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  {t('auth.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('auth.loggingIn') : t('auth.loginButton')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
