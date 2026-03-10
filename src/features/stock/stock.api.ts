import { api } from '@/api/client'
import type { Stock, StockListResponse, StockQuery } from './stock.types'

export const stockApi = {
  getAll: (params?: StockQuery) =>
    api.get<{ success: boolean; data: StockListResponse }>('/stocks', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: Stock }>(`/stocks/${id}`),
}
