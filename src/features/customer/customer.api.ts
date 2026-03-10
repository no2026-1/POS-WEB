import { api } from '@/api/client'
import type { Customer, CustomerListResponse, CreateCustomerPayload, UpdateCustomerPayload, CustomerQuery } from './customer.types'

export const customerApi = {
  getAll: (params?: CustomerQuery) =>
    api.get<{ success: boolean; data: CustomerListResponse }>('/customers', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: Customer }>(`/customers/${id}`),

  create: (payload: CreateCustomerPayload) =>
    api.post<{ success: boolean; data: Customer }>('/customers', payload),

  update: (id: number, payload: UpdateCustomerPayload) =>
    api.put<{ success: boolean; data: Customer }>(`/customers/${id}`, payload),

  delete: (id: number) =>
    api.delete(`/customers/${id}`),
}
