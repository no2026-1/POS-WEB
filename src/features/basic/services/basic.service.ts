import { api } from '@/lib/api/client'
import type {
  Basic,
  CreateBasicPayload,
  UpdateBasicPayload,
  CreateBasicLinePayload,
  UpdateBasicLinePayload,
} from '../types/basic.types'

export const basicApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ success: boolean; data: Basic[]; total: number; page: number; limit: number }>('/basic', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: Basic }>(`/basic/${id}`),

  create: (payload: CreateBasicPayload) =>
    api.post<{ success: boolean; data: Basic }>('/basic', payload),

  update: (id: number, payload: UpdateBasicPayload) =>
    api.put<{ success: boolean; data: Basic }>(`/basic/${id}`, payload),

  delete: (id: number) =>
    api.delete(`/basic/${id}`),

  createLine: (basicId: number, payload: CreateBasicLinePayload) =>
    api.post(`/basic/${basicId}/lines`, payload),

  updateLine: (lineId: number, payload: UpdateBasicLinePayload) =>
    api.put(`/basic/lines/${lineId}`, payload),

  deleteLine: (lineId: number) =>
    api.delete(`/basic/lines/${lineId}`),
}
