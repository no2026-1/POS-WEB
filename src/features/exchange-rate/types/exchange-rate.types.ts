export interface ExchangeRate {
  id: number
  fromCurrency: string
  toCurrency: string
  rate: number
  effectiveDate: string
  expiryDate?: string
  remarks?: string
  isActive: boolean
  createdAt?: string
}

export interface ExchangeRateQuery {
  page?: number
  limit?: number
  fromCurrency?: string
  toCurrency?: string
  isActive?: boolean
}

export interface CreateExchangeRatePayload {
  fromCurrency: string
  toCurrency: string
  rate: number
  effectiveDate: string
  expiryDate?: string
  remarks?: string
}

export interface UpdateExchangeRatePayload {
  rate?: number
  effectiveDate?: string
  expiryDate?: string
  remarks?: string
  isActive?: boolean
}
