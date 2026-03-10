export interface Branch {
  id: number
  branchCode: string
  englishName: string
  localName?: string
  address?: string
  tel?: string
  email?: string
  autoProcess: boolean
  requireApproval: boolean
  allowReturnRefund: boolean
  returnDays: number
  isActive: boolean
  remarks?: string
  province?: { id: number; provinceCode: string; englishName: string }
  district?: { id: number; districtCode: string; englishName: string }
}

export interface BranchListResponse {
  data: Branch[]
  total: number
  page: number
  limit: number
}

export interface CreateBranchPayload {
  branchCode: string
  englishName: string
  localName?: string
  address?: string
  tel?: string
  email?: string
  autoProcess?: boolean
  requireApproval?: boolean
  allowReturnRefund?: boolean
  returnDays?: number
  remarks?: string
}

export interface UpdateBranchPayload extends Partial<CreateBranchPayload> {
  isActive?: boolean
}

export interface BranchQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}
