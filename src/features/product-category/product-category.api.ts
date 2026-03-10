import { api } from '@/api/client'
import type { ProductCategory, ProductCategoryListResponse, CreateProductCategoryPayload, UpdateProductCategoryPayload, ProductCategoryQuery } from './product-category.types'

export const productCategoryApi = {
  getAll: (params?: ProductCategoryQuery) =>
    api.get<{ success: boolean; data: ProductCategoryListResponse }>('/product-categories', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: ProductCategory }>(`/product-categories/${id}`),

  create: (payload: CreateProductCategoryPayload) =>
    api.post<{ success: boolean; data: ProductCategory }>('/product-categories', payload),

  update: (id: number, payload: UpdateProductCategoryPayload) =>
    api.put<{ success: boolean; data: ProductCategory }>(`/product-categories/${id}`, payload),

  delete: (id: number) =>
    api.delete(`/product-categories/${id}`),
}
