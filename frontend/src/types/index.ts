export type Role = 'ADMIN' | 'USER'

export interface AuthResponse {
  token: string
  email: string
  fullName: string
  role: Role
  companyId: number
  companyName: string
  inviteCode: string | null
}

export type ColumnType = 'WENT_WELL' | 'TO_IMPROVE' | 'ACTION_ITEMS'

export interface Card {
  id: number
  content: string
  columnType: ColumnType
  voteCount: number
  createdBy: string
  anonymous: boolean
  createdAt: string
}

export interface Board {
  id: number
  name: string
  teamId: number
  teamName: string
  createdAt: string
  cards: Card[]
}
