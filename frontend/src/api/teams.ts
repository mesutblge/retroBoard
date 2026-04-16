import api from './axios'

export interface TeamResponse {
  id: number
  name: string
  members: UserMember[]
}

export interface UserMember {
  id: number
  email: string
  fullName: string
  role: 'ADMIN' | 'USER'
  createdAt: string
}

export const getTeams = () => api.get<TeamResponse[]>('/teams')
export const createTeam = (name: string) => api.post<TeamResponse>('/teams', { name })
export const deleteTeam = (id: number) => api.delete(`/teams/${id}`)
export const addMember = (teamId: number, userId: number) =>
  api.post<TeamResponse>(`/teams/${teamId}/members/${userId}`)
export const removeMember = (teamId: number, userId: number) =>
  api.delete<TeamResponse>(`/teams/${teamId}/members/${userId}`)
