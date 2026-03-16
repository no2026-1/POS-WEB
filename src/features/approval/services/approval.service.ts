import { api } from '@/lib/api/client'
import type { ApprovalHeader, CreateApprovalPayload } from '../types/approval.types'

interface ListParams {
  page?: number
  limit?: number
  tableName?: string
  status?: string
}

export const approvalApi = {
  getAll: (params?: ListParams) =>
    api.get<{ data: ApprovalHeader[]; total: number; page: number; limit: number; totalPages: number }>('/approvals', { params }),

  getById: (id: number) =>
    api.get<ApprovalHeader>(`/approvals/${id}`),

  create: (payload: CreateApprovalPayload) =>
    api.post<ApprovalHeader>('/approvals', payload),

  approve: (id: number, remarks?: string) =>
    api.post<ApprovalHeader>(`/approvals/${id}/approve`, { remarks }),

  reject: (id: number, remarks: string) =>
    api.post<ApprovalHeader>(`/approvals/${id}/reject`, { remarks }),
}
