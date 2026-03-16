import { api } from '@/lib/api/client'
import type { Session, SessionListResponse, SessionQuery, CreateSessionPayload, CloseSessionPayload } from '../types/session.types'

export const sessionApi = {
  getAll: (params?: SessionQuery) =>
    api.get<{ success: boolean; data: SessionListResponse }>('/sessions', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: Session }>(`/sessions/${id}`),

  create: (payload: CreateSessionPayload) =>
    api.post<{ success: boolean; data: Session }>('/sessions', payload),

  close: (id: number, payload: CloseSessionPayload) =>
    api.post<{ success: boolean; data: Session }>(`/sessions/${id}/close`, payload),
}
