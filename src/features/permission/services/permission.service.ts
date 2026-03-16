import { api } from '@/lib/api/client'
import type { BasicRole, PermissionMenu, PermissionModel, PermissionButton, UserRole } from '../types/permission.types'

export const permissionApi = {
  getRoles: () => api.get<BasicRole[]>('/permissions/roles'),

  getMenuPerms: (roleId: number) => api.get<PermissionMenu[]>(`/permissions/menu/${roleId}`),
  upsertMenuPerm: (data: { roleId: number; menuCode: string; canView: boolean }) =>
    api.put<PermissionMenu>('/permissions/menu', data),
  deleteMenuPerm: (id: number) => api.delete(`/permissions/menu/${id}`),

  getModelPerms: (roleId: number) => api.get<PermissionModel[]>(`/permissions/model/${roleId}`),
  upsertModelPerm: (data: { roleId: number; modelName: string; canCreate: boolean; canRead: boolean; canUpdate: boolean; canDelete: boolean }) =>
    api.put<PermissionModel>('/permissions/model', data),
  deleteModelPerm: (id: number) => api.delete(`/permissions/model/${id}`),

  getButtonPerms: (roleId: number) => api.get<PermissionButton[]>(`/permissions/button/${roleId}`),
  upsertButtonPerm: (data: { roleId: number; buttonCode: string; canExecute: boolean }) =>
    api.put<PermissionButton>('/permissions/button', data),
  deleteButtonPerm: (id: number) => api.delete(`/permissions/button/${id}`),

  getUserRoles: (userId: number) => api.get<UserRole[]>(`/permissions/user-roles/${userId}`),
  assignRole: (data: { userId: number; roleId: number }) => api.post('/permissions/user-roles', data),
  removeRole: (data: { userId: number; roleId: number }) => api.delete('/permissions/user-roles', { data }),
}
