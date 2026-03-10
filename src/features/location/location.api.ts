import { api } from '@/api/client'
import type { Location, LocationListResponse, CreateLocationPayload, UpdateLocationPayload, LocationQuery } from './location.types'

export const locationApi = {
  getAll: (params?: LocationQuery) =>
    api.get<{ success: boolean; data: LocationListResponse }>('/location', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: Location }>(`/location/${id}`),

  create: (payload: CreateLocationPayload) =>
    api.post<{ success: boolean; data: Location }>('/location', payload),

  update: (id: number, payload: UpdateLocationPayload) =>
    api.put<{ success: boolean; data: Location }>(`/location/${id}`, payload),

  delete: (id: number) =>
    api.delete(`/location/${id}`),
}
