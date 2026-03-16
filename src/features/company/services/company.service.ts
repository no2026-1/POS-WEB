import { api } from '@/lib/api/client'
import type { Company, CompanyListResponse, CreateCompanyPayload, UpdateCompanyPayload } from '../types/company.types'

export const companyApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) =>
    api.get<{ success: boolean; data: Company[]; total: number }>('/companies', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: Company }>(`/companies/${id}`),

  create: (payload: CreateCompanyPayload) =>
    api.post<{ success: boolean; data: Company }>('/companies', payload),

  update: (id: number, payload: UpdateCompanyPayload) =>
    api.put<{ success: boolean; data: Company }>(`/companies/${id}`, payload),

  delete: (id: number) =>
    api.delete<{ success: boolean }>(`/companies/${id}`),
}
