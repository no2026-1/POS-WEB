export interface Stock {
  id: number
  stockDate: string
  tableName: string
  refNo?: string
  locationId: number
  location: { id: number; locationCode: string; locationName: string }
  productId: number
  product: { id: number; productCode: string; productName: string }
  inoutClassId?: number
  inoutClass?: { id: number; code: string; name: string }
  inoutTypeId?: number
  inoutType?: { id: number; code: string; name: string }
  qtyIn: number
  qtyOut: number
  balanceQty: number
  createDate: string
}

export interface StockListResponse {
  data: Stock[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface StockQuery {
  page?: number
  limit?: number
  locationId?: number
  productId?: number
  tableName?: string
  dateFrom?: string
  dateTo?: string
}
