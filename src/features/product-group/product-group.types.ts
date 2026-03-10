export interface ProductGroup {
  id: number
  groupCode: string
  groupName: string
  remarks?: string
  isActive: boolean
  createdAt: string
}

export interface ProductGroupListResponse {
  data: ProductGroup[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateProductGroupPayload {
  groupCode: string
  groupName: string
  remarks?: string
}

export interface UpdateProductGroupPayload extends Partial<CreateProductGroupPayload> {}

export interface ProductGroupQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}
