import api from './axios'
import type { AuthResponse } from '../types'

export const register = (
  email: string,
  password: string,
  fullName: string,
  companyName?: string,
  inviteCode?: string
) =>
  api.post<AuthResponse>('/auth/register', { email, password, fullName, companyName, inviteCode })

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password })
