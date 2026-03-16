import { api } from '@/lib/api/client'
import type { ProductBrand, ProductBrandListResponse, CreateProductBrandPayload, UpdateProductBrandPayload, ProductBrandQuery } from '../types/product-brand.types'

export const productBrandApi = {
  getAll: (params?: ProductBrandQuery) =>
    api.get<{ success: boolean; data: ProductBrandListResponse }>('/product-brands', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: ProductBrand }>(`/product-brands/${id}`),

  create: (payload: CreateProductBrandPayload) =>
    api.post<{ success: boolean; data: ProductBrand }>('/product-brands', payload),

  update: (id: number, payload: UpdateProductBrandPayload) =>
    api.put<{ success: boolean; data: ProductBrand }>(`/product-brands/${id}`, payload),

  delete: (id: number) =>
    api.delete(`/product-brands/${id}`),
}
