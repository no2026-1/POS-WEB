export interface PosOrderLine {
  id: number
  posOrderId: number
  lineNo: number
  productId: number
  product: { id: number; productCode: string; productName: string; price?: number }
  unitId: number
  unit: { id: number; uomCode: string; uomName: string }
  qty: number
  price: number
  discountAmt: number
  discountPct: number
  vatPct: number
  vatAmt: number
  lineAmt: number
  lineTotal: number
  remarks?: string
}

export interface PosOrder {
  id: number
  posNo: string
  posDate: string
  posTime: string
  orderType: 'RETAIL' | 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
  status: string
  sessionId: number
  session?: { id: number; sessionNo: string }
  locationId: number
  location?: { id: number; locationCode: string; locationName: string }
  customerId?: number
  customer?: { id: number; customerNo: string; englishName: string }
  saleAmt: number
  discountAmt: number
  discountPct: number
  vatAmt: number
  totalAmt: number
  creditAmt: number
  remarks?: string
  lines?: PosOrderLine[]
  createDate: string
}

export interface PosOrderListResponse {
  data: PosOrder[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PosOrderQuery {
  page?: number
  limit?: number
  sessionId?: number
  locationId?: number
  status?: string
  orderType?: string
  dateFrom?: string
  dateTo?: string
}

export interface CreatePosOrderPayload {
  posNo: string
  posDate: string
  posTime: string
  orderType: 'RETAIL' | 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
  sessionId: number
  locationId: number
  customerId?: number
  saleAmt?: number
  discountAmt?: number
  discountPct?: number
  vatAmt?: number
  totalAmt?: number
  creditAmt?: number
  remarks?: string
  createId?: number
}

export interface CreatePosOrderLinePayload {
  posOrderId: number
  lineNo: number
  productId: number
  unitId: number
  qty: number
  price: number
  discountAmt?: number
  discountPct?: number
  vatPct?: number
  vatAmt?: number
  lineAmt: number
  lineTotal: number
  remarks?: string
}
