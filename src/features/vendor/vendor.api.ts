import { api } from '@/api/client'
import type { Vendor, VendorListResponse, CreateVendorPayload, UpdateVendorPayload, VendorQuery } from './vendor.types'

export const vendorApi = {
  getAll: (params?: VendorQuery) =>
    api.get<{ success: boolean; data: VendorListResponse }>('/vendors', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: Vendor }>(`/vendors/${id}`),

  create: (payload: CreateVendorPayload) =>
    api.post<{ success: boolean; data: Vendor }>('/vendors', payload),

  update: (id: number, payload: UpdateVendorPayload) =>
    api.put<{ success: boolean; data: Vendor }>(`/vendors/${id}`, payload),

  delete: (id: number) =>
    api.delete(`/vendors/${id}`),
}
