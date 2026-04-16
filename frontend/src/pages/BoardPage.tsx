import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getBoard, addCard, voteCard, deleteCard } from '../api/boards'
import type { Board, Card, ColumnType } from '../types'

const COLUMNS: { type: ColumnType; label: string; color: string }[] = [
  { type: 'WENT_WELL', label: 'Went Well', color: 'bg-green-50 border-green-200' },
  { type: 'TO_IMPROVE', label: 'To Improve', color: 'bg-amber-50 border-amber-200' },
  { type: 'ACTION_ITEMS', label: 'Action Items', color: 'bg-blue-50 border-blue-200' },
]

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const boardId = Number(id)
  const navigate = useNavigate()
  const [board, setBoard] = useState<Board | null>(null)
  const [newCard, setNewCard] = useState<{ [k in ColumnType]?: string }>({})
  const stompRef = useRef<Client | null>(null)

  useEffect(() => {
    getBoard(boardId).then(res => setBoard(res.data))

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      onConnect: () => {
        client.subscribe(`/topic/board/${boardId}`, (msg) => {
          const data = JSON.parse(msg.body)
          if (typeof data === 'string' && data.startsWith('card_deleted:')) {
            const deletedId = Number(data.split(':')[1])
            setBoard(prev => prev ? {
              ...prev,
              cards: prev.cards.filter(c => c.id !== deletedId)
            } : prev)
          } else {
            const card: Card = data
            setBoard(prev => {
              if (!prev) return prev
              const exists = prev.cards.find(c => c.id === card.id)
              return {
                ...prev,
                cards: exists
                  ? prev.cards.map(c => c.id === card.id ? card : c)
                  : [...prev.cards, card],
              }
            })
          }
        })
      },
    })
    client.activate()
    stompRef.current = client
    return () => { client.deactivate() }
  }, [boardId])

  const handleAddCard = async (columnType: ColumnType) => {
    const content = newCard[columnType]?.trim()
    if (!content) return
    await addCard(boardId, content, columnType)
    setNewCard(prev => ({ ...prev, [columnType]: '' }))
  }

  const handleVote = async (cardId: number) => {
    await voteCard(cardId)
  }

  const handleDelete = async (cardId: number) => {
    await deleteCard(cardId)
  }

  const cardsOf = (type: ColumnType) =>
    (board?.cards ?? [])
      .filter(c => c.columnType === type)
      .sort((a, b) => b.voteCount - a.voteCount)

  if (!board) return (
    <div className="min-h-screen flex items-center justify-center text-slate-400">Yükleniyor...</div>
  )

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600 transition text-lg">←</button>
        <div>
          <h1 className="font-bold text-slate-800">{board.name}</h1>
          {board.sprintName && <span className="text-xs text-indigo-500">{board.sprintName}</span>}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        {COLUMNS.map(col => (
          <div key={col.type} className={`rounded-xl border p-4 flex flex-col gap-3 ${col.color}`}>
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
              {col.label}
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({cardsOf(col.type).length})
              </span>
            </h2>

            {/* Kart Listesi */}
            <div className="flex flex-col gap-2 flex-1">
              {cardsOf(col.type).map(card => (
                <div key={card.id} className="bg-white rounded-lg p-3 shadow-sm flex flex-col gap-2">
                  <p className="text-sm text-slate-700">{card.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{card.createdBy}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote(card.id)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition"
                      >
                        👍 {card.voteCount}
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="text-slate-300 hover:text-red-400 transition text-sm"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Kart Ekle */}
            <div className="flex gap-2 mt-1">
              <input
                value={newCard[col.type] ?? ''}
                onChange={e => setNewCard(prev => ({ ...prev, [col.type]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAddCard(col.type)}
                placeholder="Kart ekle..."
                className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
              <button
                onClick={() => handleAddCard(col.type)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg transition"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
