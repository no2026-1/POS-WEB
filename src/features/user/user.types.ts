export interface UserRole {
  id: number
  roleId: number
  role?: { id: number; code: string; name: string }
}

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  userRoles?: UserRole[]
}

export interface UserListResponse {
  data: User[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export interface CreateUserPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
  roleIds: number[]
}

export interface UpdateUserPayload {
  email?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  roleIds?: number[]
  isActive?: boolean
}

export interface UserQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: string
}
