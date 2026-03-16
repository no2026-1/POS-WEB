export interface BasicRole {
  id: number
  code: string
  name: string
  nameTh?: string
  basicId: number
  basic: { code: string; name: string }
}

export interface PermissionMenu {
  id: number
  roleId: number
  menuCode: string
  canView: boolean
}

export interface PermissionModel {
  id: number
  roleId: number
  modelName: string
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
}

export interface PermissionButton {
  id: number
  roleId: number
  buttonCode: string
  canExecute: boolean
}

export interface UserRole {
  id: number
  userId: number
  roleId: number
  isActive: boolean
  role: { id: number; code: string; name: string }
}
