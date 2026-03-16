export interface Employee {
  id: number
  empNo: string
  empCode: string
  branchId: number
  departmentId?: number
  userId?: number
  englishName: string
  localName?: string
  position?: string
  hireDate?: string
  phone?: string
  email?: string
  address?: string
  isActive: boolean
  remarks?: string
  branch?: { id: number; branchCode: string; englishName: string }
  department?: { id: number; deptCode: string; englishName: string }
}

export interface EmployeeListResponse {
  data: Employee[]
  total: number
  page: number
  limit: number
}

export interface CreateEmployeePayload {
  empNo: string
  empCode: string
  branchId: number
  departmentId?: number
  englishName: string
  localName?: string
  position?: string
  hireDate?: string
  phone?: string
  email?: string
  address?: string
  remarks?: string
}

export interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {
  isActive?: boolean
}

export interface EmployeeQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  branchId?: number
  departmentId?: number
}
