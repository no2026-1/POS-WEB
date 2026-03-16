export interface PurchaseOrderLine {
  id: number
  purchaseOrderId: number
  lineNo: number
  productId: number
  product: { id: number; productCode: string; productName: string }
  uomId: number
  uom: { id: number; uomCode: string; uomName: string }
  qty: number
  price: number
  amount: number
  remarks?: string
}

export interface PurchaseOrder {
  id: number
  poNo: string
  poDate: string
  status: string
  vendorId: number
  vendor: { id: number; vendorNo: string; englishName: string }
  locationId: number
  location: { id: number; locationCode: string; locationName: string }
  poAmt: number
  requireApproval: boolean
  remarks?: string
  lines?: PurchaseOrderLine[]
  createDate: string
  approvedDate?: string
  receivedDate?: string
}

export interface PurchaseOrderListResponse {
  data: PurchaseOrder[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PurchaseOrderQuery {
  page?: number
  limit?: number
  vendorId?: number
  locationId?: number
  status?: string
  search?: string
}

export interface CreatePurchaseOrderPayload {
  poNo: string
  poDate: string
  vendorId: number
  locationId: number
  poAmt?: number
  requireApproval?: boolean
  remarks?: string
}

export type UpdatePurchaseOrderPayload = Partial<CreatePurchaseOrderPayload>

export interface CreatePurchaseOrderLinePayload {
  lineNo: number
  productId: number
  uomId: number
  qty: number
  price: number
  amount: number
  remarks?: string
}

export type UpdatePurchaseOrderLinePayload = Partial<CreatePurchaseOrderLinePayload>
