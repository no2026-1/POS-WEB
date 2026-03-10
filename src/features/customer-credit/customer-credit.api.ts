import { api } from '@/api/client'
import type { CustomerCredit, CustomerCreditListResponse, CustomerCreditQuery } from './customer-credit.types'

export const customerCreditApi = {
  getAll: (params?: CustomerCreditQuery) =>
    api.get<{ success: boolean; data: CustomerCreditListResponse }>('/customer-credits', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: CustomerCredit }>(`/customer-credits/${id}`),
}
