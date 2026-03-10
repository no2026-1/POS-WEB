import { api } from '@/api/client'
import type { StockCard, StockCardListResponse, StockCardQuery } from './stock-card.types'

export const stockCardApi = {
  getAll: (params?: StockCardQuery) =>
    api.get<{ success: boolean; data: StockCardListResponse }>('/stock-cards', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: StockCard }>(`/stock-cards/${id}`),
}
