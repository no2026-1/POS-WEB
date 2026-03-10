import { api } from '@/api/client'
import type { Product, ProductListResponse, CreateProductPayload, UpdateProductPayload, ProductQuery } from './product.types'

export const productApi = {
  getAll: (params?: ProductQuery) =>
    api.get<{ success: boolean; data: ProductListResponse }>('/products', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: Product }>(`/products/${id}`),

  create: (payload: CreateProductPayload) =>
    api.post<{ success: boolean; data: Product }>('/products', payload),

  update: (id: number, payload: UpdateProductPayload) =>
    api.put<{ success: boolean; data: Product }>(`/products/${id}`, payload),

  delete: (id: number) =>
    api.delete(`/products/${id}`),
}
