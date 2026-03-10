export interface PosConfig {
  id: number
  configCode: string
  configName: string
  branchId: number
  branch?: { id: number; branchCode: string; branchName: string }
  locationId?: number
  location?: { id: number; locationCode: string; locationName: string }
  autoProcess: boolean
  requireApproval: boolean
  allowReturnRefund: boolean
  returnDays: number
  remarks?: string
  isActive: boolean
  createDate: string
}

export interface PosConfigListResponse {
  data: PosConfig[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PosConfigQuery {
  page?: number
  limit?: number
  search?: string
  branchId?: number
}

export interface CreatePosConfigPayload {
  configCode: string
  configName: string
  branchId: number
  locationId?: number
  autoProcess?: boolean
  requireApproval?: boolean
  allowReturnRefund?: boolean
  returnDays?: number
  remarks?: string
}

export type UpdatePosConfigPayload = Partial<CreatePosConfigPayload>
