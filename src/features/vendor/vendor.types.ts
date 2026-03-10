export interface Vendor {
  id: number
  vendorNo: string
  vendorCode: string
  englishName: string
  localName?: string
  phone?: string
  email?: string
  address?: string
  provinceId?: number
  districtId?: number
  taxId?: string
  paymentTerms?: string
  remarks?: string
  isActive: boolean
  createdAt: string
  province?: { id: number; englishName: string }
  district?: { id: number; englishName: string }
}

export interface VendorListResponse {
  data: Vendor[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface CreateVendorPayload {
  vendorNo: string
  vendorCode: string
  englishName: string
  localName?: string
  phone?: string
  email?: string
  address?: string
  provinceId?: number
  districtId?: number
  taxId?: string
  paymentTerms?: string
  remarks?: string
}

export interface UpdateVendorPayload extends Partial<Omit<CreateVendorPayload, 'vendorNo'>> {}

export interface VendorQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}
