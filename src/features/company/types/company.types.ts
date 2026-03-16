export interface Company {
  id: number
  companyCode: string
  englishName: string
  localName?: string
  address?: string
  tel?: string
  email?: string
  taxId?: string
  currency: string
  isActive: boolean
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface CompanyListResponse {
  data: Company[]
  total: number
  page: number
  limit: number
}

export interface CreateCompanyPayload {
  companyCode: string
  englishName: string
  localName?: string
  address?: string
  tel?: string
  email?: string
  taxId?: string
  currency: string
  remarks?: string
}

export interface UpdateCompanyPayload extends Partial<CreateCompanyPayload> {
  isActive?: boolean
}
