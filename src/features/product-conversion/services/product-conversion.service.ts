import { api } from '@/lib/api/client'
import type { ProductConversion, ProductConversionQuery, CreateProductConversionPayload, UpdateProductConversionPayload } from '../types/product-conversion.types'

export const productConversionApi = {
  getAll: (params?: ProductConversionQuery) =>
    api.get<{ success: boolean; data: ProductConversion[]; total?: number }>('/product-conversions', { params }),
  getById: (id: number) =>
    api.get<{ success: boolean; data: ProductConversion }>(`/product-conversions/${id}`),
  create: (payload: CreateProductConversionPayload) =>
    api.post<{ success: boolean; data: ProductConversion }>('/product-conversions', payload),
  update: (id: number, payload: UpdateProductConversionPayload) =>
    api.put<{ success: boolean; data: ProductConversion }>(`/product-conversions/${id}`, payload),
  delete: (id: number) =>
    api.delete(`/product-conversions/${id}`),
}
