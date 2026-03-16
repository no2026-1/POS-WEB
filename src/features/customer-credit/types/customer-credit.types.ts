export interface CustomerCredit {
  id: number
  creditDate: string
  customerId: number
  customer?: { id: number; customerNo: string; englishName: string }
  transactionType: string
  posOrderId?: number
  paymentId?: number
  debit: number
  credit: number
  balance: number
  remarks?: string
  createDate: string
}

export interface CustomerCreditListResponse {
  data: CustomerCredit[]
  total: number
  page: number
  limit: number
}

export interface CustomerCreditQuery {
  page?: number
  limit?: number
  customerId?: number
  posOrderId?: number
  transactionType?: string
  dateFrom?: string
  dateTo?: string
}
