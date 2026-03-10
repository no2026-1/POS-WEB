export interface GoodsReceive {
  id: number
  grNo: string
  grDate: string
  status: string
  purchaseOrderId: number
  purchaseOrder: { id: number; poNo: string; status: string }
  locationId: number
  location: { id: number; locationCode: string; locationName: string }
  grAmt: number
  remarks?: string
  createDate: string
  confirmedDate?: string
}

export interface GoodsReceiveListResponse {
  data: GoodsReceive[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GoodsReceiveQuery {
  page?: number
  limit?: number
  purchaseOrderId?: number
  locationId?: number
  status?: string
}

export interface CreateGoodsReceivePayload {
  grNo: string
  grDate: string
  purchaseOrderId: number
  locationId: number
  grAmt?: number
  remarks?: string
}

export type UpdateGoodsReceivePayload = Partial<CreateGoodsReceivePayload>
