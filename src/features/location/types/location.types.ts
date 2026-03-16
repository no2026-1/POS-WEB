export interface Location {
  id: number
  branchId: number
  locationCode: string
  locationName: string
  locationTypeId?: number
  isActive: boolean
  remarks?: string
  branch?: { id: number; branchCode: string; englishName: string }
}

export interface LocationListResponse {
  data: Location[]
  total: number
  page: number
  limit: number
}

export interface CreateLocationPayload {
  branchId: number
  locationCode: string
  locationName: string
  locationTypeId?: number
  remarks?: string
}

export interface UpdateLocationPayload {
  locationName?: string
  locationTypeId?: number
  remarks?: string
  isActive?: boolean
}

export interface LocationQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  branchId?: number
}
