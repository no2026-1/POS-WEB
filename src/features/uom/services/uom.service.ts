import { api } from '@/lib/api/client'
import type { Uom, UomListResponse, CreateUomPayload, UpdateUomPayload, UomQuery } from '../types/uom.types'

export const uomApi = {
  getAll: (params?: UomQuery) =>
    api.get<{ success: boolean; data: UomListResponse }>('/uoms', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: Uom }>(`/uoms/${id}`),

  create: (payload: CreateUomPayload) =>
    api.post<{ success: boolean; data: Uom }>('/uoms', payload),

  update: (id: number, payload: UpdateUomPayload) =>
    api.put<{ success: boolean; data: Uom }>(`/uoms/${id}`, payload),

  delete: (id: number) =>
    api.delete(`/uoms/${id}`),
}
