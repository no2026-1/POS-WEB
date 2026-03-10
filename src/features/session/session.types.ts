export interface Session {
  id: number
  sessionNo: string
  posConfigId: number
  posConfig?: { id: number; configCode: string; configName: string }
  userId: number
  user?: { id: number; username: string; fullName: string }
  openingBalance: number
  closingBalance?: number
  status: 'OPEN' | 'CLOSED'
  openedAt: string
  closedAt?: string
  remarks?: string
  isActive: boolean
  createDate: string
}

export interface SessionListResponse {
  data: Session[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SessionQuery {
  page?: number
  limit?: number
  status?: 'OPEN' | 'CLOSED'
  posConfigId?: number
  userId?: number
}

export interface CreateSessionPayload {
  sessionNo: string
  posConfigId: number
  userId: number
  openingBalance: number
  remarks?: string
}

export interface CloseSessionPayload {
  closingBalance: number
  remarks?: string
}
