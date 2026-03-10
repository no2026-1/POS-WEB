import { api } from '@/api/client'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
    user: {
      id: number
      email: string
      firstName: string
      lastName: string
      roles: string[]
    }
  }
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', payload),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me'),
}
