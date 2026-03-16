export interface ProductConversion {
  id: number
  parentId: number
  childId: number
  conversionRatio: number
  isActive: boolean
  remarks?: string
  parent?: { id: number; productCode: string; productName: string }
  child?: { id: number; productCode: string; productName: string }
}

export interface ProductConversionQuery {
  page?: number
  limit?: number
  parentId?: number
  childId?: number
  isActive?: boolean
}

export interface CreateProductConversionPayload {
  parentId: number
  childId: number
  conversionRatio: number
  isActive?: boolean
  remarks?: string
}

export interface UpdateProductConversionPayload {
  conversionRatio?: number
  isActive?: boolean
  remarks?: string
}
