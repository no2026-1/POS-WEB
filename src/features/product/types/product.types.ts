export interface Product {
  id: number
  productCode: string
  productName: string
  categoryId?: number
  groupId?: number
  brandId?: number
  uomId: number
  costPrice?: number
  sellingPrice?: number
  trackStock: boolean
  minStockLevel?: number
  remarks?: string
  isActive: boolean
  createdAt: string
  category?: { id: number; categoryCode: string; categoryName: string }
  group?: { id: number; groupCode: string; groupName: string }
  brand?: { id: number; brandCode: string; brandName: string }
  uom?: { id: number; uomCode: string; uomName: string }
}

export interface ProductListResponse {
  data: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateProductPayload {
  productCode: string
  productName: string
  uomId: number
  categoryId?: number
  groupId?: number
  brandId?: number
  costPrice?: number
  sellingPrice?: number
  trackStock?: boolean
  minStockLevel?: number
  remarks?: string
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export interface ProductQuery {
  page?: number
  limit?: number
  search?: string
  categoryId?: number
  groupId?: number
  brandId?: number
  isActive?: boolean
}
