import { api } from '@/lib/api/client'
import type { PosOrder, PosOrderListResponse, PosOrderQuery, CreatePosOrderPayload, CreatePosOrderLinePayload } from '../types/pos-order.types'

export const posOrderApi = {
  getAll: (params?: PosOrderQuery) =>
    api.get<{ success: boolean; data: PosOrderListResponse }>('/pos-orders', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: PosOrder }>(`/pos-orders/${id}`),

  create: (payload: CreatePosOrderPayload) =>
    api.post<{ success: boolean; data: PosOrder }>('/pos-orders', payload),

  update: (id: number, payload: Partial<CreatePosOrderPayload>) =>
    api.put<{ success: boolean; data: PosOrder }>(`/pos-orders/${id}`, payload),

  confirm: (id: number) =>
    api.post<{ success: boolean; data: PosOrder }>(`/pos-orders/${id}/confirm`, {}),

  cancel: (id: number) =>
    api.post<{ success: boolean; data: PosOrder }>(`/pos-orders/${id}/cancel`, {}),

  addLine: (payload: CreatePosOrderLinePayload) =>
    api.post('/pos-order-lines', payload),

  updateLine: (lineId: number, payload: Partial<CreatePosOrderLinePayload>) =>
    api.put(`/pos-order-lines/${lineId}`, payload),

  deleteLine: (lineId: number) =>
    api.delete(`/pos-order-lines/${lineId}`),
}

export const paymentApi = {
  create: (payload: { paymentNo: string; paymentDate: string; paymentTime: string; posOrderId: number; paymentAmt: number; remarks?: string }) =>
    api.post('/payments', payload),
}
