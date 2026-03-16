import { api } from '@/lib/api/client'
import type {
  PurchaseOrder,
  PurchaseOrderListResponse,
  PurchaseOrderQuery,
  CreatePurchaseOrderPayload,
  UpdatePurchaseOrderPayload,
  CreatePurchaseOrderLinePayload,
  UpdatePurchaseOrderLinePayload,
} from '../types/purchase-order.types'

export const purchaseOrderApi = {
  getAll: (params?: PurchaseOrderQuery) =>
    api.get<{ success: boolean; data: PurchaseOrderListResponse }>('/purchase-orders', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: PurchaseOrder }>(`/purchase-orders/${id}`),

  create: (payload: CreatePurchaseOrderPayload) =>
    api.post<{ success: boolean; data: PurchaseOrder }>('/purchase-orders', payload),

  update: (id: number, payload: UpdatePurchaseOrderPayload) =>
    api.put<{ success: boolean; data: PurchaseOrder }>(`/purchase-orders/${id}`, payload),

  approve: (id: number, remarks?: string) =>
    api.post<{ success: boolean; data: PurchaseOrder }>(`/purchase-orders/${id}/approve`, { remarks }),

  receive: (id: number, receivedDate: string, remarks?: string) =>
    api.post<{ success: boolean; data: PurchaseOrder }>(`/purchase-orders/${id}/receive`, { receivedDate, remarks }),

  cancel: (id: number) =>
    api.post<{ success: boolean; data: PurchaseOrder }>(`/purchase-orders/${id}/cancel`, {}),

  addLine: (id: number, payload: CreatePurchaseOrderLinePayload) =>
    api.post(`/purchase-orders/${id}/lines`, payload),

  updateLine: (id: number, lineId: number, payload: UpdatePurchaseOrderLinePayload) =>
    api.put(`/purchase-orders/${id}/lines/${lineId}`, payload),

  deleteLine: (id: number, lineId: number) =>
    api.delete(`/purchase-orders/${id}/lines/${lineId}`),
}
