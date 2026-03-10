export interface ProductBrand {
  id: number
  brandCode: string
  brandName: string
  remarks?: string
  isActive: boolean
  createdAt: string
}

export interface ProductBrandListResponse {
  data: ProductBrand[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateProductBrandPayload {
  brandCode: string
  brandName: string
  remarks?: string
}

export interface UpdateProductBrandPayload extends Partial<CreateProductBrandPayload> {}

export interface ProductBrandQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}
