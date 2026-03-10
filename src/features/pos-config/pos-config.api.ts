import { api } from '@/api/client'
import type { PosConfig, PosConfigListResponse, PosConfigQuery, CreatePosConfigPayload, UpdatePosConfigPayload } from './pos-config.types'

export const posConfigApi = {
  getAll: (params?: PosConfigQuery) =>
    api.get<{ success: boolean; data: PosConfigListResponse }>('/pos-config', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: PosConfig }>(`/pos-config/${id}`),

  create: (payload: CreatePosConfigPayload) =>
    api.post<{ success: boolean; data: PosConfig }>('/pos-config', payload),

  update: (id: number, payload: UpdatePosConfigPayload) =>
    api.put<{ success: boolean; data: PosConfig }>(`/pos-config/${id}`, payload),
}
