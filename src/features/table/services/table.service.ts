import { api } from '@/lib/api/client'
import type { Table, TableListResponse, TableQuery, CreateTablePayload, UpdateTablePayload } from '../types/table.types'

export const tableApi = {
  getAll: (params?: TableQuery) =>
    api.get<{ success: boolean; data: TableListResponse }>('/tables', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: Table }>(`/tables/${id}`),

  create: (payload: CreateTablePayload) =>
    api.post<{ success: boolean; data: Table }>('/tables', payload),

  update: (id: number, payload: UpdateTablePayload) =>
    api.put<{ success: boolean; data: Table }>(`/tables/${id}`, payload),

  updateStatus: (id: number, status: string) =>
    api.patch<{ success: boolean; data: Table }>(`/tables/${id}/status`, { status }),

  delete: (id: number) =>
    api.delete(`/tables/${id}`),
}
