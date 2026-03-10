import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { userApi } from './user.api'
import { basicApi } from '@/features/basic/basic.api'
import type { User, CreateUserPayload, UpdateUserPayload } from './user.types'

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
      type === 'success' ? 'bg-green-600' : 'bg-red-500'
    }`}>{message}</div>
  )
}

function UserPanel({
  user, onClose, onToast,
}: {
  user: User | null
  onClose: () => void
  onToast: (msg: string, type: 'success' | 'error') => void
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const isEdit = !!user

  // Fetch roles from Basic USER_ROLE category
  const { data: roleBasic } = useQuery({
    queryKey: ['basic-user-role'],
    queryFn: () => basicApi.getAll({ limit: 100 }),
    select: (res) => res.data.data.find((b) => b.code === 'USER_ROLE')?.lines ?? [],
  })
  const availableRoles = roleBasic ?? []

  const currentRoleIds = user?.userRoles?.map((ur) => ur.roleId) ?? []

  const [form, setForm] = useState({
    email: user?.email ?? '',
    password: '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phoneNumber: user?.phoneNumber ?? '',
    roleIds: currentRoleIds,
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  function toggleRole(id: number) {
    setForm((f) => ({
      ...f,
      roleIds: f.roleIds.includes(id) ? f.roleIds.filter((r) => r !== id) : [...f.roleIds, id],
    }))
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      if (isEdit) {
        const payload: UpdateUserPayload = {
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNumber: form.phoneNumber || undefined,
          roleIds: form.roleIds,
        }
        return userApi.update(user!.id, payload)
      } else {
        const payload: CreateUserPayload = {
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNumber: form.phoneNumber || undefined,
          roleIds: form.roleIds,
        }
        return userApi.create(payload)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      onToast(isEdit ? t('common.updateSuccess') : t('common.createSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => userApi.delete(user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      onToast(t('common.deleteSuccess'), 'success')
      onClose()
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const statusMutation = useMutation({
    mutationFn: (isActive: boolean) => userApi.updateStatus(user!.id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      onToast(t('common.updateSuccess'), 'success')
    },
    onError: (e: any) => onToast(e.response?.data?.message ?? t('common.error'), 'error'),
  })

  const passwordValid = isEdit || (
    form.password.length >= 8 &&
    /[A-Z]/.test(form.password) &&
    /[a-z]/.test(form.password) &&
    /[0-9]/.test(form.password)
  )
  const canSave = form.firstName && form.lastName && form.roleIds.length > 0 &&
    (isEdit || (form.email && form.password)) && passwordValid

  return (
    <div className="w-[420px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <h2 className="font-bold text-gray-800 text-sm">
          {isEdit ? t('user.edit') : t('user.add')}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-xl leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        {!isEdit && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('auth.email')} *</label>
            <input type="email" className="input" value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="user@pos.com" />
          </div>
        )}

        {!isEdit && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('auth.password')} *</label>
            <input type="password" className={`input ${form.password && !passwordValid ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Min 8 chars, A-Z, a-z, 0-9" />
            {form.password && !passwordValid && (
              <p className="text-xs text-red-500 mt-1">Must be 8+ chars with uppercase, lowercase, and number</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('user.firstName')} *</label>
            <input className="input" value={form.firstName}
              onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('user.lastName')} *</label>
            <input className="input" value={form.lastName}
              onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('user.phone')}</label>
          <input className="input" value={form.phoneNumber}
            onChange={(e) => setForm(f => ({ ...f, phoneNumber: e.target.value }))} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('user.roles')} *</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {availableRoles.map((role) => {
              const selected = form.roleIds.includes(role.id)
              return (
                <button key={role.id} type="button" onClick={() => toggleRole(role.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                    selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}>
                  {role.name}
                </button>
              )
            })}
            {availableRoles.length === 0 && (
              <p className="text-xs text-gray-400">ไม่พบ roles — กรุณาสร้าง USER_ROLE ใน Basic ก่อน</p>
            )}
          </div>
        </div>

        {isEdit && (
          <div className="border border-gray-100 rounded-lg p-3">
            <label className="block text-xs font-medium text-gray-500 mb-2">{t('common.status')}</label>
            <div className="flex gap-2">
              <button onClick={() => statusMutation.mutate(true)}
                disabled={user!.isActive}
                className={`px-3 py-1 rounded text-xs font-medium ${user!.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-green-50'}`}>
                {t('common.active')}
              </button>
              <button onClick={() => statusMutation.mutate(false)}
                disabled={!user!.isActive}
                className={`px-3 py-1 rounded text-xs font-medium ${!user!.isActive ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-red-50'}`}>
                {t('common.inactive')}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-2">
        {!confirmDelete ? (
          <>
            <button onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !canSave}
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

export default function UserPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [panel, setPanel] = useState<{ open: boolean; user: User | null }>({ open: false, user: null })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll({ limit: 100 }),
  })

  const allUsers = data?.data.data ?? []

  const users = useMemo(() => {
    if (!search.trim()) return allUsers
    const q = search.toLowerCase()
    return allUsers.filter((u) =>
      [u.email, u.firstName, u.lastName, u.phoneNumber].some((v) => v && String(v).toLowerCase().includes(q)),
    )
  }, [allUsers, search])

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex h-full -m-6">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">{t('user.title')}</h1>
            <p className="text-slate-300 text-xs mt-0.5">{users.length} / {allUsers.length} {t('common.items')}</p>
          </div>
          <button onClick={() => setPanel({ open: true, user: null })}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + {t('user.add')}
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
                <th className="px-5 py-3 font-medium">{t('auth.email')}</th>
                <th className="px-5 py-3 font-medium">{t('user.name')}</th>
                <th className="px-5 py-3 font-medium">{t('user.roles')}</th>
                <th className="px-5 py-3 font-medium">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">{t('common.loading')}</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">{t('common.noData')}</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} onClick={() => setPanel({ open: true, user: u })}
                  className={`cursor-pointer transition-colors hover:bg-blue-50 ${panel.user?.id === u.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                  <td className="px-5 py-3 text-gray-700">{u.email}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{u.firstName} {u.lastName}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.userRoles?.map((ur, i) => (
                        <span key={ur.roleId ?? ur.id ?? i} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          {ur.role?.name ?? ur.role?.code ?? ur.roleId}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                      {u.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {panel.open && (
        <UserPanel user={panel.user}
          onClose={() => setPanel({ open: false, user: null })} onToast={showToast} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
