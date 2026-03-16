import axios from 'axios'
import { env } from '@/config/env'
import { applyInterceptors } from './interceptors'

export const api = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
})

applyInterceptors(api)
