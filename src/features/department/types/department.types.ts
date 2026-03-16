export interface Department {
  id: number
  deptCode: string
  englishName: string
  localName?: string
  parentId?: number
  parent?: { id: number; deptCode: string; englishName: string }
  children?: Department[]
  isActive: boolean
  remarks?: string
}

export interface CreateDepartmentPayload {
  deptCode: string
  englishName: string
  localName?: string
  parentId?: number
  remarks?: string
}

export interface UpdateDepartmentPayload extends Partial<CreateDepartmentPayload> {
  isActive?: boolean
}

export interface DepartmentQuery {
  search?: string
  isActive?: string
  parentId?: string
}
