export interface Uom {
  id: number
  uomCode: string
  uomName: string
  remarks?: string
  isActive: boolean
  createdAt: string
}

export interface UomListResponse {
  data: Uom[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateUomPayload {
  uomCode: string
  uomName: string
  remarks?: string
}

export interface UpdateUomPayload extends Partial<CreateUomPayload> {}

export interface UomQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}
