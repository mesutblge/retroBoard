import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getBoard, addCard, voteCard, deleteCard } from '../api/boards'
import type { Board, Card, ColumnType } from '../types'

const COLUMNS: { type: ColumnType; label: string; emoji: string; gradient: string; bg: string; border: string; badge: string }[] = [
  {
    type: 'WENT_WELL',
    label: 'Went Well',
    emoji: '🟢',
    gradient: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    badge: '#059669',
  },
  {
    type: 'TO_IMPROVE',
    label: 'To Improve',
    emoji: '🟡',
    gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    bg: '#fffbeb',
    border: '#fcd34d',
    badge: '#d97706',
  },
  {
    type: 'ACTION_ITEMS',
    label: 'Action Items',
    emoji: '🔵',
    gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    bg: '#eff6ff',
    border: '#93c5fd',
    badge: '#2563eb',
  },
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
            setBoard(prev => prev ? { ...prev, cards: prev.cards.filter(c => c.id !== deletedId) } : prev)
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

  const cardsOf = (type: ColumnType) =>
    (board?.cards ?? [])
      .filter(c => c.columnType === type)
      .sort((a, b) => b.voteCount - a.voteCount)

  if (!board) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f7ff' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Yükleniyor...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#f8f7ff' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-xl border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:text-purple-600 hover:border-purple-200 transition-all"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-gray-800 text-lg leading-tight">{board.name}</h1>
          {board.sprintName && (
            <span className="text-xs font-medium text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
              {board.sprintName}
            </span>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Canlı
        </div>
      </header>

      {/* Kolonlar */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(col => {
          const cards = cardsOf(col.type)
          return (
            <div key={col.type} className="flex flex-col rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: col.border, background: col.bg }}>
              {/* Kolon başlığı */}
              <div className="px-5 py-4 flex items-center justify-between" style={{ background: col.gradient }}>
                <div className="flex items-center gap-2">
                  <span>{col.emoji}</span>
                  <h2 className="font-bold text-gray-700 text-sm">{col.label}</h2>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/60 text-gray-600">
                  {cards.length}
                </span>
              </div>

              {/* Kartlar */}
              <div className="flex-1 p-4 flex flex-col gap-3 min-h-[200px]">
                {cards.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-gray-300 text-sm py-8">
                    Henüz kart yok
                  </div>
                )}
                {cards.map(card => (
                  <div
                    key={card.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-white hover:shadow-md transition-shadow group"
                  >
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{card.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-300 font-medium">{card.createdBy}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => voteCard(card.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all hover:scale-105 active:scale-95"
                          style={{ background: card.voteCount > 0 ? '#f3f0ff' : '#f9fafb', color: card.voteCount > 0 ? '#7c3aed' : '#9ca3af' }}
                        >
                          👍 {card.voteCount}
                        </button>
                        <button
                          onClick={() => deleteCard(card.id)}
                          className="w-6 h-6 rounded-lg text-gray-200 hover:text-red-400 hover:bg-red-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 text-base leading-none"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Kart ekle */}
              <div className="p-4 border-t" style={{ borderColor: col.border }}>
                <div className="flex gap-2">
                  <input
                    value={newCard[col.type] ?? ''}
                    onChange={e => setNewCard(prev => ({ ...prev, [col.type]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddCard(col.type)}
                    placeholder="Kart ekle... (Enter)"
                    className="flex-1 bg-white border-2 border-gray-100 rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-400 transition-colors placeholder-gray-300"
                  />
                  <button
                    onClick={() => handleAddCard(col.type)}
                    className="w-9 h-9 rounded-xl text-white font-bold text-lg flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95 shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </main>
    </div>
  )
}
