import { api } from '@/lib/api/client'
import type {
  ProductPrice,
  ProductPriceListResponse,
  ProductPriceQuery,
  CreateProductPricePayload,
  UpdateProductPricePayload,
} from '../types/product-price.types'

export const productPriceApi = {
  getAll: (params?: ProductPriceQuery) =>
    api.get<{ success: boolean; data: ProductPriceListResponse }>('/product-prices', { params }),

  getById: (id: number) =>
    api.get<{ success: boolean; data: ProductPrice }>(`/product-prices/${id}`),

  create: (payload: CreateProductPricePayload) =>
    api.post<{ success: boolean; data: ProductPrice }>('/product-prices', payload),

  update: (id: number, payload: UpdateProductPricePayload) =>
    api.put<{ success: boolean; data: ProductPrice }>(`/product-prices/${id}`, payload),

  delete: (id: number) =>
    api.delete(`/product-prices/${id}`),
}
