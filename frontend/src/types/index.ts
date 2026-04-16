export type Role = 'ADMIN' | 'USER'

export interface AuthResponse {
  token: string
  email: string
  fullName: string
  role: Role
}

export type ColumnType = 'WENT_WELL' | 'TO_IMPROVE' | 'ACTION_ITEMS'

export interface Card {
  id: number
  content: string
  columnType: ColumnType
  voteCount: number
  createdBy: string
  createdAt: string
}

export interface Board {
  id: number
  name: string
  sprintName: string
  createdAt: string
  cards: Card[]
}
