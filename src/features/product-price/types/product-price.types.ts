export interface ProductPrice {
  id: number
  productId: number
  product: { id: number; productCode: string; productName: string }
  priceType: string
  price: number
  currency: string
  effectiveDate: string
  expiryDate?: string
  isActive: boolean
  remarks?: string
  createdAt: string
}

export interface ProductPriceListResponse {
  data: ProductPrice[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProductPriceQuery {
  page?: number
  limit?: number
  productId?: number
  priceType?: string
  isActive?: boolean
}

export interface CreateProductPricePayload {
  productId: number
  priceType: string
  price: number
  currency?: string
  effectiveDate: string
  expiryDate?: string
  remarks?: string
}

export interface UpdateProductPricePayload {
  price?: number
  currency?: string
  effectiveDate?: string
  expiryDate?: string | null
  remarks?: string
  isActive?: boolean
}
