import { api } from '@/api/client'
import type {
  Branch,
  BranchListResponse,
  CreateBranchPayload,
  UpdateBranchPayload,
  BranchQuery,
} from './branch.types'

export const branchApi = {
  getAll: (query?: BranchQuery) =>
    api.get<{ success: boolean; data: BranchListResponse }>('/branch', { params: query }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: Branch }>(`/branch/${id}`),

  create: (payload: CreateBranchPayload) =>
    api.post<{ success: boolean; data: Branch }>('/branch', payload),

  update: (id: number, payload: UpdateBranchPayload) =>
    api.put<{ success: boolean; data: Branch }>(`/branch/${id}`, payload),

  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/branch/${id}`),
}
