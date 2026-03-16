import { api } from '@/lib/api/client'
import type { ExchangeRate, ExchangeRateQuery, CreateExchangeRatePayload, UpdateExchangeRatePayload } from '../types/exchange-rate.types'

export const exchangeRateApi = {
  getAll: (params?: ExchangeRateQuery) =>
    api.get<{ success: boolean; data: ExchangeRate[]; total?: number }>('/exchange-rates', { params }),
  getById: (id: number) =>
    api.get<{ success: boolean; data: ExchangeRate }>(`/exchange-rates/${id}`),
  create: (payload: CreateExchangeRatePayload) =>
    api.post<{ success: boolean; data: ExchangeRate }>('/exchange-rates', payload),
  update: (id: number, payload: UpdateExchangeRatePayload) =>
    api.put<{ success: boolean; data: ExchangeRate }>(`/exchange-rates/${id}`, payload),
  delete: (id: number) =>
    api.delete(`/exchange-rates/${id}`),
}
