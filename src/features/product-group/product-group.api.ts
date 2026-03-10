import { api } from '@/api/client'
import type { ProductGroup, ProductGroupListResponse, CreateProductGroupPayload, UpdateProductGroupPayload, ProductGroupQuery } from './product-group.types'

export const productGroupApi = {
  getAll: (params?: ProductGroupQuery) =>
    api.get<{ success: boolean; data: ProductGroupListResponse }>('/product-groups', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: ProductGroup }>(`/product-groups/${id}`),

  create: (payload: CreateProductGroupPayload) =>
    api.post<{ success: boolean; data: ProductGroup }>('/product-groups', payload),

  update: (id: number, payload: UpdateProductGroupPayload) =>
    api.put<{ success: boolean; data: ProductGroup }>(`/product-groups/${id}`, payload),

  delete: (id: number) =>
    api.delete(`/product-groups/${id}`),
}
