import { api } from '@/lib/api/client'
import type {
  GoodsReceive,
  GoodsReceiveListResponse,
  GoodsReceiveQuery,
  CreateGoodsReceivePayload,
  UpdateGoodsReceivePayload,
} from '../types/goods-receive.types'

export const goodsReceiveApi = {
  getAll: (params?: GoodsReceiveQuery) =>
    api.get<{ success: boolean; data: GoodsReceiveListResponse }>('/goods-receives', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: GoodsReceive }>(`/goods-receives/${id}`),

  create: (payload: CreateGoodsReceivePayload) =>
    api.post<{ success: boolean; data: GoodsReceive }>('/goods-receives', payload),

  update: (id: number, payload: UpdateGoodsReceivePayload) =>
    api.put<{ success: boolean; data: GoodsReceive }>(`/goods-receives/${id}`, payload),

  confirm: (id: number, remarks?: string) =>
    api.post<{ success: boolean; data: GoodsReceive }>(`/goods-receives/${id}/confirm`, { remarks }),

  cancel: (id: number) =>
    api.post<{ success: boolean; data: GoodsReceive }>(`/goods-receives/${id}/cancel`, {}),
}
