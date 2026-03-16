import { api } from '@/lib/api/client'
import type {
  StockMove,
  StockMoveListResponse,
  StockMoveQuery,
  CreateStockMovePayload,
  UpdateStockMovePayload,
  CreateStockMoveLinePayload,
  UpdateStockMoveLinePayload,
} from '../types/stock-move.types'

export const stockMoveApi = {
  getAll: (params?: StockMoveQuery) =>
    api.get<{ success: boolean; data: StockMoveListResponse }>('/stock-moves', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: StockMove }>(`/stock-moves/${id}`),

  create: (payload: CreateStockMovePayload) =>
    api.post<{ success: boolean; data: StockMove }>('/stock-moves', payload),

  update: (id: number, payload: UpdateStockMovePayload) =>
    api.put<{ success: boolean; data: StockMove }>(`/stock-moves/${id}`, payload),

  approve: (id: number, remarks?: string) =>
    api.post<{ success: boolean; data: StockMove }>(`/stock-moves/${id}/approve`, { remarks }),

  confirm: (id: number, remarks?: string) =>
    api.post<{ success: boolean; data: StockMove }>(`/stock-moves/${id}/confirm`, { remarks }),

  cancel: (id: number) =>
    api.post<{ success: boolean; data: StockMove }>(`/stock-moves/${id}/cancel`, {}),

  addLine: (id: number, payload: CreateStockMoveLinePayload) =>
    api.post(`/stock-moves/${id}/lines`, payload),

  updateLine: (id: number, lineId: number, payload: UpdateStockMoveLinePayload) =>
    api.put(`/stock-moves/${id}/lines/${lineId}`, payload),

  deleteLine: (id: number, lineId: number) =>
    api.delete(`/stock-moves/${id}/lines/${lineId}`),
}
