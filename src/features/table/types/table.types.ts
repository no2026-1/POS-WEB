export interface Table {
  id: number
  tableCode: string
  tableName: string
  zone?: string
  capacity: number
  locationId: number
  location?: { id: number; locationCode: string; locationName: string }
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING'
  isActive: boolean
  remarks?: string
}

export interface TableListResponse {
  data: Table[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TableQuery {
  page?: number
  limit?: number
  locationId?: number
  zone?: string
  status?: string
  isActive?: boolean
}

export interface CreateTablePayload {
  tableCode: string
  tableName: string
  zone?: string
  capacity: number
  locationId: number
  status?: string
  remarks?: string
}

export type UpdateTablePayload = Partial<CreateTablePayload>
