export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedData<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: PaginatedData<T>
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}
