import api from './axios'

export interface UserResponse {
  id: number
  email: string
  fullName: string
  role: 'ADMIN' | 'USER'
  createdAt: string
}

export const getUsers = () => api.get<UserResponse[]>('/users')
export const updateRole = (userId: number, role: 'ADMIN' | 'USER') =>
  api.patch<UserResponse>(`/users/${userId}/role?role=${role}`)
export const updateProfile = (data: {
  fullName?: string
  email?: string
  currentPassword?: string
  newPassword?: string
}) => api.patch<UserResponse>('/users/me', data)
