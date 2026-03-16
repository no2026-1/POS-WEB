import { api } from '@/lib/api/client'
import type { DailyClose, DailyCloseListResponse, DailyCloseQuery, CreateDailyClosePayload, CloseDailyClosePayload } from '../types/daily-close.types'

export const dailyCloseApi = {
  getAll: (params?: DailyCloseQuery) =>
    api.get<{ success: boolean; data: DailyCloseListResponse }>('/daily-closes', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: DailyClose }>(`/daily-closes/${id}`),

  create: (payload: CreateDailyClosePayload) =>
    api.post<{ success: boolean; data: DailyClose }>('/daily-closes', payload),

  close: (id: number, payload: CloseDailyClosePayload) =>
    api.post<{ success: boolean; data: DailyClose }>(`/daily-closes/${id}/close`, payload),
}
