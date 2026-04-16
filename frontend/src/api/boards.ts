import api from './axios'
import type { Board, Card, ColumnType } from '../types'

export const getBoards = () => api.get<Board[]>('/boards')
export const getBoard = (id: number) => api.get<Board>(`/boards/${id}`)
export const createBoard = (name: string, teamId: number) =>
  api.post<Board>('/boards', { name, teamId })
export const deleteBoard = (id: number) => api.delete(`/boards/${id}`)

export const addCard = (boardId: number, content: string, columnType: ColumnType, anonymous: boolean) =>
  api.post<Card>(`/boards/${boardId}/cards`, { content, columnType, anonymous })
export const voteCard = (cardId: number) =>
  api.post<Card>(`/boards/cards/${cardId}/vote`)
export const deleteCard = (cardId: number) =>
  api.delete(`/boards/cards/${cardId}`)
