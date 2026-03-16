export interface ApprovalLog {
  id: number
  approvalHeaderId: number
  action: 'APPROVE' | 'REJECT' | 'REQUEST'
  actionBy: number
  remarks?: string
  actionDate: string
}

export interface ApprovalHeader {
  id: number
  tableName: string
  recordId: number
  requestedBy: number
  requestedDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  approvedBy?: number
  approvedDate?: string
  remarks?: string
  logs: ApprovalLog[]
}

export interface CreateApprovalPayload {
  tableName: string
  recordId: number
  requestedBy: number
  remarks?: string
}
