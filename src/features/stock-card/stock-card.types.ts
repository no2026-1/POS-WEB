export interface StockCard {
  id: number
  stockDate: string
  locationId: number
  location?: { id: number; locationCode: string; locationName: string }
  productId: number
  product?: { id: number; productCode: string; productName: string }
  tableName: string
  recordId: number
  qtyIn?: number
  qtyOut?: number
  balanceQty: number
  avgCost: number
  balanceAmt: number
  remarks?: string
}

export interface StockCardListResponse {
  data: StockCard[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface StockCardQuery {
  page?: number
  limit?: number
  locationId?: number
  productId?: number
  dateFrom?: string
  dateTo?: string
}
