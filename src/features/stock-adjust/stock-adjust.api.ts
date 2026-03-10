import { api } from '@/api/client'
import type {
  StockAdjust,
  StockAdjustListResponse,
  StockAdjustQuery,
  CreateStockAdjustPayload,
  UpdateStockAdjustPayload,
  CreateStockAdjustLinePayload,
  UpdateStockAdjustLinePayload,
} from './stock-adjust.types'

export const stockAdjustApi = {
  getAll: (params?: StockAdjustQuery) =>
    api.get<{ success: boolean; data: StockAdjustListResponse }>('/stock-adjusts', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: StockAdjust }>(`/stock-adjusts/${id}`),

  create: (payload: CreateStockAdjustPayload) =>
    api.post<{ success: boolean; data: StockAdjust }>('/stock-adjusts', payload),

  update: (id: number, payload: UpdateStockAdjustPayload) =>
    api.put<{ success: boolean; data: StockAdjust }>(`/stock-adjusts/${id}`, payload),

  approve: (id: number, remarks?: string) =>
    api.post<{ success: boolean; data: StockAdjust }>(`/stock-adjusts/${id}/approve`, { remarks }),

  confirm: (id: number, remarks?: string) =>
    api.post<{ success: boolean; data: StockAdjust }>(`/stock-adjusts/${id}/confirm`, { remarks }),

  cancel: (id: number) =>
    api.post<{ success: boolean; data: StockAdjust }>(`/stock-adjusts/${id}/cancel`, {}),

  addLine: (id: number, payload: CreateStockAdjustLinePayload) =>
    api.post(`/stock-adjusts/${id}/lines`, payload),

  updateLine: (id: number, lineId: number, payload: UpdateStockAdjustLinePayload) =>
    api.put(`/stock-adjusts/${id}/lines/${lineId}`, payload),

  deleteLine: (id: number, lineId: number) =>
    api.delete(`/stock-adjusts/${id}/lines/${lineId}`),
}
