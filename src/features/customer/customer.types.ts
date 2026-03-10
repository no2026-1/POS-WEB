export interface Customer {
  id: number
  customerNo: string
  customerCode: string
  englishName: string
  localName?: string
  phone?: string
  email?: string
  address?: string
  provinceId?: number
  districtId?: number
  creditLimit: number
  remarks?: string
  isActive: boolean
  createdAt: string
  province?: { id: number; englishName: string }
  district?: { id: number; englishName: string }
}

export interface CustomerListResponse {
  data: Customer[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface CreateCustomerPayload {
  customerNo: string
  customerCode: string
  englishName: string
  localName?: string
  phone?: string
  email?: string
  address?: string
  provinceId?: number
  districtId?: number
  creditLimit?: number
  remarks?: string
}

export interface UpdateCustomerPayload extends Partial<Omit<CreateCustomerPayload, 'customerNo'>> {}

export interface CustomerQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}
