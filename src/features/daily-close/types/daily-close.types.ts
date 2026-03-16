export interface DailyClose {
  id: number
  closeDate: string
  locationId: number
  location?: { id: number; locationCode: string; locationName: string }
  status: 'OPEN' | 'CLOSED'
  totalProducts?: number
  totalValue?: number
  closedBy?: number
  closedDate?: string
  remarks?: string
  createdAt: string
}

export interface DailyCloseListResponse {
  data: DailyClose[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface DailyCloseQuery {
  page?: number
  limit?: number
  locationId?: number
  status?: string
  dateFrom?: string
  dateTo?: string
}

export interface CreateDailyClosePayload {
  closeDate: string
  locationId: number
  remarks?: string
}

export interface CloseDailyClosePayload {
  totalProducts?: number
  totalValue?: number
  remarks?: string
}
