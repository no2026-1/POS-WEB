export interface BasicLine {
  id: number
  basicId: number
  code: string
  name: string
  nameTh?: string
  value?: string
  sortOrder: number
  isDefault: boolean
  isActive: boolean
}

export interface Basic {
  id: number
  code: string
  name: string
  nameTh?: string
  description?: string
  isActive: boolean
  lines: BasicLine[]
}

export interface BasicListResponse {
  data: Basic[]
  total: number
  page: number
  limit: number
}

export interface CreateBasicPayload {
  code: string
  name: string
  nameTh?: string
  description?: string
}

export interface UpdateBasicPayload {
  name?: string
  nameTh?: string
  description?: string
  isActive?: boolean
}

export interface CreateBasicLinePayload {
  code: string
  name: string
  nameTh?: string
  value?: string
  sortOrder?: number
  isDefault?: boolean
}

export interface UpdateBasicLinePayload {
  name?: string
  nameTh?: string
  value?: string
  sortOrder?: number
  isDefault?: boolean
  isActive?: boolean
}
