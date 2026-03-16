import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { permissionApi } from '../services/permission.service'
import type { BasicRole, PermissionMenu, PermissionModel, PermissionButton } from '../types/permission.types'

type Tab = 'menu' | 'model' | 'button'

// ── Menu permission row ───────────────────────────────────────────────────────
const MENU_CODES = [
  'dashboard','company','branch','department','location','employee','user',
  'uom','productCategory','productBrand','productGroup','product',
  'customer','vendor',
  'purchaseOrder','goodsReceive','stockAdjust','stockMove','stock',
  'posConfig','session','pos','posHistory','posReturn',
  'dailyClose','stockCard','customerCredit',
  'exchangeRate','productConversion','productPrice','tables','approval',
]

const MODEL_NAMES = [
  'Company','Branch','Department','Location','Employee','User',
  'Uom','ProductCategory','ProductBrand','ProductGroup','Product',
  'Customer','Vendor',
  'PurchaseOrder','GoodsReceive','StockAdjust','StockMove',
  'PosConfig','Session','PosOrder','PosReturn',
  'DailyClose','ExchangeRate','ProductConversion','ProductPrice','Table',
]

const BUTTON_CODES = [
  'po.receive','po.cancel',
  'gr.confirm','gr.cancel',
  'stockAdjust.confirm','stockAdjust.cancel',
  'stockMove.approve','stockMove.confirm','stockMove.cancel',
  'posReturn.confirm','posReturn.cancel',
  'dailyClose.close',
  'approval.approve','approval.reject',
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${checked ? 'bg-indigo-500' : 'bg-gray-200'}`}
    >
      <span className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

function MenuTab({ roleId }: { roleId: number }) {
  const qc = useQueryClient()
  const { data } = useQuery({
    queryKey: ['perm-menu', roleId],
    queryFn: () => permissionApi.getMenuPerms(roleId),
  })
  const perms: PermissionMenu[] = data?.data.data ?? []
  const permMap = Object.fromEntries(perms.map(p => [p.menuCode, p]))

  const mutation = useMutation({
    mutationFn: (d: { menuCode: string; canView: boolean }) =>
      permissionApi.upsertMenuPerm({ roleId, ...d }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['perm-menu', roleId] }),
  })

  return (
    <div className="divide-y divide-gray-100">
      {MENU_CODES.map(code => {
        const perm = permMap[code]
        return (
          <div key={code} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50">
            <span className="text-sm font-mono text-gray-600">{code}</span>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">View</span>
                <Toggle
                  checked={perm?.canView ?? false}
                  onChange={(v) => mutation.mutate({ menuCode: code, canView: v })}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ModelTab({ roleId }: { roleId: number }) {
  const qc = useQueryClient()
  const { data } = useQuery({
    queryKey: ['perm-model', roleId],
    queryFn: () => permissionApi.getModelPerms(roleId),
  })
  const perms: PermissionModel[] = data?.data.data ?? []
  const permMap = Object.fromEntries(perms.map(p => [p.modelName, p]))

  const mutation = useMutation({
    mutationFn: (d: Omit<PermissionModel, 'id' | 'roleId'> & { modelName: string }) =>
      permissionApi.upsertModelPerm({ roleId, ...d }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['perm-model', roleId] }),
  })

  function toggle(modelName: string, field: 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete', value: boolean) {
    const existing = permMap[modelName]
    mutation.mutate({
      modelName,
      canCreate: existing?.canCreate ?? false,
      canRead:   existing?.canRead   ?? false,
      canUpdate: existing?.canUpdate ?? false,
      canDelete: existing?.canDelete ?? false,
      [field]: value,
    })
  }

  return (
    <div>
      <div className="grid grid-cols-5 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide sticky top-0">
        <span>Model</span>
        <span className="text-center">Create</span>
        <span className="text-center">Read</span>
        <span className="text-center">Update</span>
        <span className="text-center">Delete</span>
      </div>
      <div className="divide-y divide-gray-100">
        {MODEL_NAMES.map(name => {
          const perm = permMap[name]
          return (
            <div key={name} className="grid grid-cols-5 items-center px-4 py-2.5 hover:bg-gray-50">
              <span className="text-sm font-mono text-gray-600">{name}</span>
              {(['canCreate','canRead','canUpdate','canDelete'] as const).map(field => (
                <div key={field} className="flex justify-center">
                  <Toggle
                    checked={perm?.[field] ?? false}
                    onChange={(v) => toggle(name, field, v)}
                  />
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ButtonTab({ roleId }: { roleId: number }) {
  const qc = useQueryClient()
  const { data } = useQuery({
    queryKey: ['perm-button', roleId],
    queryFn: () => permissionApi.getButtonPerms(roleId),
  })
  const perms: PermissionButton[] = data?.data.data ?? []
  const permMap = Object.fromEntries(perms.map(p => [p.buttonCode, p]))

  const mutation = useMutation({
    mutationFn: (d: { buttonCode: string; canExecute: boolean }) =>
      permissionApi.upsertButtonPerm({ roleId, ...d }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['perm-button', roleId] }),
  })

  return (
    <div className="divide-y divide-gray-100">
      {BUTTON_CODES.map(code => {
        const perm = permMap[code]
        return (
          <div key={code} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50">
            <span className="text-sm font-mono text-gray-600">{code}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Execute</span>
              <Toggle
                checked={perm?.canExecute ?? false}
                onChange={(v) => mutation.mutate({ buttonCode: code, canExecute: v })}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function PermissionPage() {
  const { t } = useTranslation()
  const [selectedRole, setSelectedRole] = useState<BasicRole | null>(null)
  const [tab, setTab] = useState<Tab>('menu')

  const { data, isLoading } = useQuery({
    queryKey: ['perm-roles'],
    queryFn: () => permissionApi.getRoles(),
  })

  const roles: BasicRole[] = data?.data.data ?? []

  // Group by basic category
  const grouped = roles.reduce<Record<string, BasicRole[]>>((acc, r) => {
    const cat = r.basic?.name ?? 'Other'
    ;(acc[cat] ??= []).push(r)
    return acc
  }, {})

  const tabs: { key: Tab; label: string }[] = [
    { key: 'menu',   label: 'Menu Access' },
    { key: 'model',  label: 'Data (CRUD)' },
    { key: 'button', label: 'Buttons' },
  ]

  return (
    <div className="flex h-full -m-6">
      {/* Role list sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 px-4 py-4">
          <h1 className="text-white font-bold text-sm">Permissions</h1>
          <p className="text-slate-300 text-xs mt-0.5">Roles & Access Control</p>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {isLoading ? (
            <p className="text-center py-8 text-gray-400 text-xs">{t('common.loading')}</p>
          ) : roles.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-xs">No roles found.<br />Add roles in Basic Data.</p>
          ) : Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="mb-1">
              <p className="px-3 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cat}</p>
              {items.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    selectedRole?.id === role.id
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-2 border-indigo-500'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="block font-medium">{role.name}</span>
                  <span className="block text-[10px] text-gray-400 font-mono">{role.code}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Permission editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedRole ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-4xl mb-3">🔐</p>
              <p className="text-sm font-medium">Select a role to manage permissions</p>
            </div>
          </div>
        ) : (
          <>
            {/* Role header */}
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 px-6 py-4">
              <h2 className="text-white font-bold">{selectedRole.name}</h2>
              <p className="text-indigo-200 text-xs font-mono">{selectedRole.code}</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white px-4 pt-2 gap-1">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    tab === t.key
                      ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              {tab === 'menu'   && <MenuTab   roleId={selectedRole.id} />}
              {tab === 'model'  && <ModelTab  roleId={selectedRole.id} />}
              {tab === 'button' && <ButtonTab roleId={selectedRole.id} />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
