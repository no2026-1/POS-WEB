export interface StockAdjustLine {
  id: number
  stockAdjustId: number
  lineNo: number
  productId: number
  product: { id: number; productCode: string; productName: string }
  uomId: number
  uom: { id: number; uomCode: string; uomName: string }
  qty: number
  remarks?: string
}

export interface StockAdjust {
  id: number
  adjustNo: string
  adjustDate: string
  status: string
  locationId: number
  location: { id: number; locationCode: string; locationName: string }
  adjustTypeId: number
  adjustType?: { id: number; code: string; name: string }
  adjustReason?: string
  requireApproval: boolean
  remarks?: string
  lines?: StockAdjustLine[]
  createDate: string
}

export interface StockAdjustListResponse {
  data: StockAdjust[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface StockAdjustQuery {
  page?: number
  limit?: number
  locationId?: number
  status?: string
  search?: string
}

export interface CreateStockAdjustPayload {
  adjustNo: string
  adjustDate: string
  locationId: number
  adjustTypeId: number
  adjustReason?: string
  requireApproval?: boolean
  remarks?: string
}

export type UpdateStockAdjustPayload = Partial<CreateStockAdjustPayload>

export interface CreateStockAdjustLinePayload {
  lineNo: number
  productId: number
  uomId: number
  qty: number
  remarks?: string
}

export type UpdateStockAdjustLinePayload = Partial<CreateStockAdjustLinePayload>
