import { api } from '@/api/client'
import type { Department, CreateDepartmentPayload, UpdateDepartmentPayload, DepartmentQuery } from './department.types'

export const departmentApi = {
  getAll: (params?: DepartmentQuery) =>
    api.get<{ success: boolean; data: Department[] }>('/department', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: Department }>(`/department/${id}`),

  create: (payload: CreateDepartmentPayload) =>
    api.post<{ success: boolean; data: Department }>('/department', payload),

  update: (id: number, payload: UpdateDepartmentPayload) =>
    api.put<{ success: boolean; data: Department }>(`/department/${id}`, payload),

  delete: (id: number) =>
    api.delete(`/department/${id}`),
}
