import { api } from '@/api/client'
import type { User, UserListResponse, CreateUserPayload, UpdateUserPayload, UserQuery } from './user.types'

export const userApi = {
  getAll: (params?: UserQuery) =>
    api.get<{ success: boolean; data: User[]; pagination: UserListResponse['pagination'] }>('/users', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: User }>(`/users/${id}`),

  create: (payload: CreateUserPayload) =>
    api.post<{ success: boolean; data: User }>('/users', payload),

  update: (id: number, payload: UpdateUserPayload) =>
    api.put<{ success: boolean; data: User }>(`/users/${id}`, payload),

  delete: (id: number) =>
    api.delete(`/users/${id}`),

  updateStatus: (id: number, isActive: boolean) =>
    api.patch(`/users/${id}/status`, { isActive }),
}
