import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getBoard, addCard, voteCard, deleteCard } from '../api/boards'
import type { Board, Card, ColumnType } from '../types'

const COLUMNS: { type: ColumnType; label: string; emoji: string; color: string; glow: string; cardBorder: string; badgeBg: string; badgeColor: string }[] = [
  { type: 'WENT_WELL', label: 'Went Well', emoji: '✅', color: 'rgba(16,185,129,0.15)', glow: 'rgba(16,185,129,0.3)', cardBorder: 'rgba(16,185,129,0.2)', badgeBg: 'rgba(16,185,129,0.2)', badgeColor: '#34d399' },
  { type: 'TO_IMPROVE', label: 'To Improve', emoji: '⚠️', color: 'rgba(245,158,11,0.15)', glow: 'rgba(245,158,11,0.3)', cardBorder: 'rgba(245,158,11,0.2)', badgeBg: 'rgba(245,158,11,0.2)', badgeColor: '#fbbf24' },
  { type: 'ACTION_ITEMS', label: 'Action Items', emoji: '⚡', color: 'rgba(99,102,241,0.15)', glow: 'rgba(99,102,241,0.3)', cardBorder: 'rgba(99,102,241,0.2)', badgeBg: 'rgba(99,102,241,0.2)', badgeColor: '#818cf8' },
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
              return { ...prev, cards: exists ? prev.cards.map(c => c.id === card.id ? card : c) : [...prev.cards, card] }
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
    (board?.cards ?? []).filter(c => c.columnType === type).sort((a, b) => b.voteCount - a.voteCount)

  if (!board) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full mx-auto mb-4"
          style={{ border: '3px solid rgba(168,85,247,0.3)', borderTopColor: '#a855f7', animation: 'spin 1s linear infinite' }} />
        <p className="text-slate-400 text-sm">Yükleniyor...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      {/* Arka plan efekti */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)', filter: 'blur(80px)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-8 py-4 flex items-center gap-4"
        style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate('/')}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          ←
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-white text-lg leading-tight">{board.name}</h1>
          {board.sprintName && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
              {board.sprintName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-400"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'pulse 2s infinite' }} />
          Canlı
        </div>
      </header>

      {/* Kolonlar */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(col => {
          const cards = cardsOf(col.type)
          return (
            <div key={col.type} className="flex flex-col rounded-2xl overflow-hidden"
              style={{ background: col.color, border: `1px solid ${col.cardBorder}`, backdropFilter: 'blur(10px)', boxShadow: `0 0 40px ${col.glow}` }}>

              {/* Kolon başlık */}
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ background: 'rgba(0,0,0,0.2)', borderBottom: `1px solid ${col.cardBorder}` }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{col.emoji}</span>
                  <h2 className="font-bold text-white text-sm tracking-wide">{col.label}</h2>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: col.badgeBg, color: col.badgeColor }}>
                  {cards.length}
                </span>
              </div>

              {/* Kartlar */}
              <div className="flex-1 p-4 flex flex-col gap-3 min-h-[220px]">
                {cards.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-600">
                    <div className="text-4xl mb-2 opacity-30">{col.emoji}</div>
                    <p className="text-xs">Henüz kart yok</p>
                  </div>
                )}
                {cards.map(card => (
                  <div key={card.id} className="rounded-xl p-4 group transition-all hover:-translate-y-0.5"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = col.cardBorder)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}>
                    <p className="text-sm text-slate-200 leading-relaxed mb-3">{card.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{card.createdBy}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => voteCard(card.id)}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg transition-all hover:scale-105 active:scale-95"
                          style={{
                            background: card.voteCount > 0 ? col.badgeBg : 'rgba(255,255,255,0.06)',
                            color: card.voteCount > 0 ? col.badgeColor : '#475569',
                            border: `1px solid ${card.voteCount > 0 ? col.cardBorder : 'transparent'}`
                          }}>
                          👍 {card.voteCount}
                        </button>
                        <button
                          onClick={() => deleteCard(card.id)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all text-base leading-none">
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Kart ekle */}
              <div className="p-4" style={{ borderTop: `1px solid ${col.cardBorder}`, background: 'rgba(0,0,0,0.15)' }}>
                <div className="flex gap-2">
                  <input
                    value={newCard[col.type] ?? ''}
                    onChange={e => setNewCard(prev => ({ ...prev, [col.type]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddCard(col.type)}
                    placeholder="Kart ekle... (Enter)"
                    className="flex-1 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.08)' }}
                    onFocus={e => e.target.style.borderColor = col.badgeColor}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                  <button
                    onClick={() => handleAddCard(col.type)}
                    className="w-9 h-9 rounded-xl text-white font-bold text-lg flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95"
                    style={{ background: `linear-gradient(135deg, #a855f7, #6366f1)`, boxShadow: '0 4px 15px rgba(168,85,247,0.3)' }}>
                    +
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}
