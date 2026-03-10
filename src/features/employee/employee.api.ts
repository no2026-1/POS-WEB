import { api } from '@/api/client'
import type { Employee, EmployeeListResponse, CreateEmployeePayload, UpdateEmployeePayload, EmployeeQuery } from './employee.types'

export const employeeApi = {
  getAll: (params?: EmployeeQuery) =>
    api.get<{ success: boolean; data: EmployeeListResponse }>('/employee', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: Employee }>(`/employee/${id}`),

  create: (payload: CreateEmployeePayload) =>
    api.post<{ success: boolean; data: Employee }>('/employee', payload),

  update: (id: number, payload: UpdateEmployeePayload) =>
    api.put<{ success: boolean; data: Employee }>(`/employee/${id}`, payload),

  delete: (id: number) =>
    api.delete(`/employee/${id}`),
}
