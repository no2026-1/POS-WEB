export interface ProductCategory {
  id: number
  categoryCode: string
  categoryName: string
  parentId?: number
  remarks?: string
  isActive: boolean
  createdAt: string
  parent?: { id: number; categoryCode: string; categoryName: string }
  children?: ProductCategory[]
}

export interface ProductCategoryListResponse {
  data: ProductCategory[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface CreateProductCategoryPayload {
  categoryCode: string
  categoryName: string
  parentId?: number
  remarks?: string
}

export interface UpdateProductCategoryPayload extends Partial<CreateProductCategoryPayload> {}

export interface ProductCategoryQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}
