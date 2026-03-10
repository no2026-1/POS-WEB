export interface PosReturnLine {
  id: number
  posReturnId: number
  lineNo: number
  posOrderLineId: number
  productId: number
  product?: { id: number; productCode: string; productName: string }
  unitId: number
  unit?: { id: number; uomCode: string; uomName: string }
  qty: number
  price: number
  amount: number
  remarks?: string
}

export interface PosReturn {
  id: number
  returnNo: string
  returnDate: string
  posOrderId: number
  posOrder?: { posNo: string; locationId: number }
  returnReasonId?: number
  returnReason?: { code: string; name: string }
  returnAmt: number
  refundAmt: number
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED'
  remarks?: string
  lines?: PosReturnLine[]
  createDate: string
}

export interface PosReturnListResponse {
  data: PosReturn[]
  total: number
  page: number
  limit: number
}

export interface PosReturnQuery {
  page?: number
  limit?: number
  posOrderId?: number
  status?: string
  dateFrom?: string
  dateTo?: string
}

export interface CreatePosReturnPayload {
  returnNo: string
  returnDate: string
  posOrderId: number
  returnAmt?: number
  refundAmt?: number
  remarks?: string
  createId?: number
}

export interface CreatePosReturnLinePayload {
  posReturnId: number
  lineNo: number
  posOrderLineId: number
  productId: number
  unitId: number
  qty: number
  price: number
  amount: number
  remarks?: string
  createId?: number
}
