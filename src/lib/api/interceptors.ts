import type { AxiosInstance } from 'axios'
import { useAuthStore } from '@/stores/auth.store'

export function applyInterceptors(instance: AxiosInstance) {
  // Attach Bearer token on every request
  instance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  // Auto logout on 401
  instance.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout()
      }
      return Promise.reject(error)
    },
  )
}
