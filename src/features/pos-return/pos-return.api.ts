import { api } from '@/api/client'
import type { PosReturn, PosReturnListResponse, PosReturnQuery, CreatePosReturnPayload, CreatePosReturnLinePayload } from './pos-return.types'

export const posReturnApi = {
  getAll: (params?: PosReturnQuery) =>
    api.get<{ success: boolean; data: PosReturnListResponse }>('/pos-returns', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: PosReturn }>(`/pos-returns/${id}`),

  create: (payload: CreatePosReturnPayload) =>
    api.post<{ success: boolean; data: PosReturn }>('/pos-returns', payload),

  confirm: (id: number) =>
    api.post<{ success: boolean; data: PosReturn }>(`/pos-returns/${id}/confirm`, {}),

  cancel: (id: number) =>
    api.post<{ success: boolean; data: PosReturn }>(`/pos-returns/${id}/cancel`, {}),

  addLine: (payload: CreatePosReturnLinePayload) =>
    api.post('/pos-return-lines', payload),

  deleteLine: (lineId: number) =>
    api.delete(`/pos-return-lines/${lineId}`),
}
