export interface StockMoveLine {
  id: number
  stockMoveId: number
  lineNo: number
  productId: number
  product: { id: number; productCode: string; productName: string }
  uomId: number
  uom: { id: number; uomCode: string; uomName: string }
  qty: number
  remarks?: string
}

export interface StockMove {
  id: number
  moveNo: string
  moveDate: string
  status: string
  locationFromId: number
  locationFrom: { id: number; locationCode: string; locationName: string }
  locationToId: number
  locationTo: { id: number; locationCode: string; locationName: string }
  requireApproval: boolean
  remarks?: string
  lines?: StockMoveLine[]
  createdAt: string
}

export interface StockMoveListResponse {
  data: StockMove[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface StockMoveQuery {
  page?: number
  limit?: number
  locationFromId?: number
  locationToId?: number
  status?: string
}

export interface CreateStockMovePayload {
  moveNo: string
  moveDate: string
  locationFromId: number
  locationToId: number
  requireApproval?: boolean
  remarks?: string
}

export type UpdateStockMovePayload = Partial<CreateStockMovePayload>

export interface CreateStockMoveLinePayload {
  lineNo: number
  productId: number
  uomId: number
  qty: number
  remarks?: string
}

export type UpdateStockMoveLinePayload = Partial<CreateStockMoveLinePayload>
