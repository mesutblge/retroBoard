import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getBoard, addCard, voteCard, deleteCard, reorderCards, toggleReveal } from '../api/boards'
import type { Board, Card, ColumnType } from '../types'

const COLUMNS: {
  type: ColumnType
  label: string
  emoji: string
  headerBg: string
  colBg: string
  border: string
  accent: string
  cardBg: string
}[] = [
  {
    type: 'WENT_WELL',
    label: 'Went Well',
    emoji: '✅',
    headerBg: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.2))',
    colBg: 'rgba(16,185,129,0.06)',
    border: 'rgba(16,185,129,0.25)',
    accent: '#34d399',
    cardBg: 'rgba(16,185,129,0.08)',
  },
  {
    type: 'TO_IMPROVE',
    label: 'To Improve',
    emoji: '⚠️',
    headerBg: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(217,119,6,0.2))',
    colBg: 'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.25)',
    accent: '#fbbf24',
    cardBg: 'rgba(245,158,11,0.08)',
  },
  {
    type: 'ACTION_ITEMS',
    label: 'Action Items',
    emoji: '⚡',
    headerBg: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(79,70,229,0.2))',
    colBg: 'rgba(99,102,241,0.06)',
    border: 'rgba(99,102,241,0.25)',
    accent: '#818cf8',
    cardBg: 'rgba(99,102,241,0.08)',
  },
]

const EMOJI_LIST = ['🔥', '🎉', '👏', '💜', '🚀', '😂', '❤️', '⭐', '💡', '🎯']

type EmojiParticle = {
  id: number
  emoji: string
  x: number
  duration: number
  size: number
  delay: number
  swing: number
}

let particleCounter = 0

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const boardId = Number(id)
  const navigate = useNavigate()
  const { isAdmin, fullName, logout } = useAuth()
  const [board, setBoard] = useState<Board | null>(null)
  const [newCard, setNewCard] = useState<{ [k in ColumnType]?: string }>({})
  const [anonymous, setAnonymous] = useState(false)
  const [emojiPanelOpen, setEmojiPanelOpen] = useState(false)
  const [particles, setParticles] = useState<EmojiParticle[]>([])
  const stompRef = useRef<Client | null>(null)

  const initials = fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const spawnParticles = useCallback((emoji: string) => {
    const count = 18 + Math.floor(Math.random() * 8)
    const newParticles: EmojiParticle[] = Array.from({ length: count }, () => ({
      id: particleCounter++,
      emoji,
      x: Math.random() * 96,
      duration: 2200 + Math.random() * 1800,
      size: 22 + Math.random() * 28,
      delay: Math.random() * 800,
      swing: (Math.random() - 0.5) * 120,
    }))
    setParticles(prev => [...prev, ...newParticles])
    const maxDuration = Math.max(...newParticles.map(p => p.duration + p.delay)) + 200
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)))
    }, maxDuration)
  }, [])

  useEffect(() => {
    getBoard(boardId).then(res => setBoard(res.data))
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      onConnect: () => {
        client.subscribe(`/topic/board/${boardId}`, (msg) => {
          const data = JSON.parse(msg.body)

          if (data && typeof data === 'object' && data.type === 'card_deleted') {
            setBoard(prev => prev ? { ...prev, cards: prev.cards.filter(c => c.id !== data.cardId) } : prev)
            return
          }

          if (data && typeof data === 'object' && data.type === 'board_revealed') {
            setBoard(prev => prev ? { ...prev, revealed: data.revealed } : prev)
            return
          }

          if (data && typeof data === 'object' && data.type === 'reorder') {
            const orders: { cardId: number; sortOrder: number }[] = data.orders
            setBoard(prev => {
              if (!prev) return prev
              const updated = prev.cards.map(c => {
                const o = orders.find(x => x.cardId === c.id)
                return o ? { ...c, sortOrder: o.sortOrder } : c
              })
              return { ...prev, cards: updated }
            })
            return
          }

          if (data && typeof data === 'object' && data.type === 'emoji') {
            spawnParticles(data.emoji)
            return
          }

          const card: Card = data
          setBoard(prev => {
            if (!prev) return prev
            const exists = prev.cards.find(c => c.id === card.id)
            if (exists) {
              return { ...prev, cards: prev.cards.map(c => c.id === card.id ? { ...card, mine: c.mine } : c) }
            }
            return { ...prev, cards: [...prev.cards, card] }
          })
        })
      },
    })
    client.activate()
    stompRef.current = client
    return () => { client.deactivate() }
  }, [boardId, spawnParticles])

  const handleAddCard = async (columnType: ColumnType) => {
    const content = newCard[columnType]?.trim()
    if (!content) return
    const res = await addCard(boardId, content, columnType, anonymous)
    setBoard(prev => {
      if (!prev) return prev
      const exists = prev.cards.find(c => c.id === res.data.id)
      if (exists) return { ...prev, cards: prev.cards.map(c => c.id === res.data.id ? res.data : c) }
      return { ...prev, cards: [...prev.cards, res.data] }
    })
    setNewCard(prev => ({ ...prev, [columnType]: '' }))
  }

  const handleReorder = useCallback(async (columnType: ColumnType, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    setBoard(prev => {
      if (!prev) return prev
      const colCards = prev.cards
        .filter(c => c.columnType === columnType)
        .sort((a, b) => a.sortOrder !== b.sortOrder ? a.sortOrder - b.sortOrder : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      const reordered = [...colCards]
      const [moved] = reordered.splice(fromIndex, 1)
      reordered.splice(toIndex, 0, moved)
      const orders = reordered.map((c, i) => ({ cardId: c.id, sortOrder: i }))
      const updated = prev.cards.map(c => {
        const o = orders.find(x => x.cardId === c.id)
        return o ? { ...c, sortOrder: o.sortOrder } : c
      })
      // persist in background
      reorderCards(boardId, orders)
      return { ...prev, cards: updated }
    })
  }, [boardId])

  const handleEmojiSend = (emoji: string) => {
    stompRef.current?.publish({
      destination: `/app/board/${boardId}/emoji`,
      body: JSON.stringify(emoji),
    })
    setEmojiPanelOpen(false)
  }

  const cardsOf = (type: ColumnType, cards?: Card[]) => {
    const source = cards ?? board?.cards ?? []
    return source
      .filter(c => c.columnType === type)
      .sort((a, b) => a.sortOrder !== b.sortOrder ? a.sortOrder - b.sortOrder : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  if (!board) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid rgba(168,85,247,0.3)', borderTopColor: '#a855f7', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#64748b', fontSize: '14px' }}>Yükleniyor...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      {/* Emoji rain layer */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
        {particles.map(p => (
          <span key={p.id} style={{
            position: 'absolute',
            top: '-60px',
            left: `${p.x}%`,
            fontSize: `${p.size}px`,
            animation: `emojifall ${p.duration}ms ease-in ${p.delay}ms forwards`,
            '--swing': `${p.swing}px`,
          } as React.CSSProperties}>
            {p.emoji}
          </span>
        ))}
      </div>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-100px', left: '30%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', gap: '14px',
        background: 'rgba(15,12,41,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <button onClick={() => navigate('/')} style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#94a3b8', fontSize: '18px', cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(168,85,247,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = 'white' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8' }}>
          ←
        </button>

        <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>🔄</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '16px', fontWeight: 800, color: 'white', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {board.name}
          </h1>
          <span style={{ fontSize: '11px', color: '#475569' }}>👥 {board.teamName}</span>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          {COLUMNS.map(col => (
            <div key={col.type} style={{ padding: '5px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '12px' }}>{col.emoji}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: col.accent }}>{cardsOf(col.type).length}</span>
            </div>
          ))}
        </div>

        {/* Reveal toggle — admin only */}
        {isAdmin && (
          <button onClick={async () => {
            setBoard(prev => prev ? { ...prev, revealed: !prev.revealed } : prev)
            try { await toggleReveal(boardId) } catch {
              setBoard(prev => prev ? { ...prev, revealed: !prev.revealed } : prev)
            }
          }} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontSize: '12px', fontWeight: 700, flexShrink: 0, transition: 'all 0.2s',
            background: board.revealed ? 'rgba(251,191,36,0.15)' : 'rgba(99,102,241,0.2)',
            color: board.revealed ? '#fbbf24' : '#818cf8',
            outline: board.revealed ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(99,102,241,0.4)',
          }}>
            {board.revealed ? '🙈 Gizle' : '👁 Göster'}
          </button>
        )}

        {/* Emoji panel */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button onClick={() => setEmojiPanelOpen(o => !o)} style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: emojiPanelOpen ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${emojiPanelOpen ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.1)'}`,
            fontSize: '18px', cursor: 'pointer', transition: 'all 0.2s',
          }}>
            🎉
          </button>
          {emojiPanelOpen && (
            <div style={{
              position: 'absolute', top: '44px', right: 0,
              background: 'rgba(15,12,41,0.96)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px', padding: '10px',
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(20px)', zIndex: 100,
            }}>
              {EMOJI_LIST.map(e => (
                <button key={e} onClick={() => handleEmojiSend(e)} style={{
                  width: '38px', height: '38px', borderRadius: '10px', border: 'none',
                  background: 'rgba(255,255,255,0.06)', fontSize: '20px', cursor: 'pointer',
                  transition: 'transform 0.15s, background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                  onMouseEnter={e2 => { (e2.currentTarget as HTMLButtonElement).style.background = 'rgba(168,85,247,0.2)'; (e2.currentTarget as HTMLButtonElement).style.transform = 'scale(1.2)' }}
                  onMouseLeave={e2 => { (e2.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e2.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}>
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => setAnonymous(a => !a)}
          title={anonymous ? 'Anonim mod açık — tıkla kapatmak için' : 'Anonim mod kapalı — tıkla açmak için'}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontSize: '12px', fontWeight: 700, flexShrink: 0, transition: 'all 0.2s',
            background: anonymous ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
            color: anonymous ? '#c084fc' : '#475569',
            outline: anonymous ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.08)',
          }}>
          {anonymous ? '🎭 Anonim' : '👤 İsimli'}
        </button>

        <button onClick={() => navigate('/profile')} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 12px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
        }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'}>
          <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white' }}>{initials}</div>
          <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500 }}>{fullName}</span>
        </button>

        <button onClick={() => { logout(); navigate('/login') }} style={{
          padding: '7px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
          fontSize: '12px', fontWeight: 700, flexShrink: 0, transition: 'all 0.2s',
          background: 'rgba(239,68,68,0.1)', color: '#fca5a5',
          outline: '1px solid rgba(239,68,68,0.25)',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'}>
          ↩ Çıkış
        </button>
      </header>

      {/* Kolonlar */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', position: 'relative', zIndex: 1, alignItems: 'start' }}>
        {COLUMNS.map(col => {
          const cards = cardsOf(col.type)
          return (
            <div key={col.type} style={{
              borderRadius: '20px', overflow: 'hidden',
              border: `1px solid ${col.border}`,
              background: col.colBg, backdropFilter: 'blur(10px)',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                padding: '14px 18px', background: col.headerBg,
                borderBottom: `1px solid ${col.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '17px' }}>{col.emoji}</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>{col.label}</span>
                  {isAdmin && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>sürükle</span>}
                </div>
                <div style={{ minWidth: '24px', height: '24px', borderRadius: '7px', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: col.accent, padding: '0 7px' }}>
                  {cards.length}
                </div>
              </div>

              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cards.length === 0 ? (
                  <div style={{ padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '26px', opacity: 0.25 }}>{col.emoji}</span>
                    <span style={{ fontSize: '12px', color: '#475569' }}>Henüz kart yok</span>
                  </div>
                ) : cards.map((card, index) => (
                  <CardItem
                    key={card.id} card={card} accent={col.accent} border={col.border}
                    canDelete={isAdmin || (!card.anonymous && card.createdBy === fullName)}
                    canDrag={isAdmin}
                    revealed={isAdmin || board.revealed || card.mine}
                    index={index}
                    totalInColumn={cards.length}
                    onVote={() => voteCard(card.id)}
                    onDelete={() => deleteCard(card.id)}
                    onDrop={(fromIndex) => handleReorder(col.type, fromIndex, index)}
                  />
                ))}
              </div>

              <div style={{ padding: '10px 14px', borderTop: `1px solid ${col.border}`, background: 'rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <input
                    value={newCard[col.type] ?? ''}
                    onChange={e => setNewCard(prev => ({ ...prev, [col.type]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddCard(col.type)}
                    placeholder={anonymous ? '🎭 Anonim kart... (Enter)' : 'Kart ekle... (Enter)'}
                    style={{
                      flex: 1, borderRadius: '10px', padding: '9px 13px',
                      fontSize: '13px', color: 'white', outline: 'none',
                      background: 'rgba(255,255,255,0.07)',
                      border: `1.5px solid rgba(255,255,255,0.08)`,
                      transition: 'border-color 0.2s', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = col.accent}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                  <button onClick={() => handleAddCard(col.type)} style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                    border: 'none', color: 'white', fontSize: '22px', fontWeight: 300,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(168,85,247,0.35)', transition: 'transform 0.15s', lineHeight: 1,
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}>
                    +
                  </button>
                </div>
                {anonymous && (
                  <p style={{ fontSize: '10px', color: '#7c3aed', margin: 0, paddingLeft: '2px' }}>
                    🎭 Anonim mod — adın gizlenecek
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes emojifall {
          0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          80%  { opacity: 0.9; }
          100% { transform: translateY(110vh) translateX(var(--swing)) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function CardItem({ card, accent, border, canDelete, canDrag, revealed, index, onVote, onDelete, onDrop }: {
  card: Card
  accent: string
  border: string
  canDelete: boolean
  canDrag: boolean
  revealed: boolean
  index: number
  totalInColumn: number
  onVote: () => void
  onDelete: () => void
  onDrop: (fromIndex: number) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [dragging, setDragging] = useState(false)

  if (!revealed) {
    return (
      <div
        draggable={canDrag}
        onDragStart={e => { setDragging(true); e.dataTransfer.setData('text/plain', String(index)) }}
        onDragEnd={() => setDragging(false)}
        onDragOver={e => { if (canDrag) { e.preventDefault(); setDragOver(true) } }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); onDrop(Number(e.dataTransfer.getData('text/plain'))) }}
        style={{
          borderRadius: '14px', padding: '16px 15px',
          background: dragOver ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)',
          border: `1px dashed ${dragOver ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)'}`,
          transition: 'all 0.15s', backdropFilter: 'blur(5px)',
          cursor: canDrag ? 'grab' : 'default',
          opacity: dragging ? 0.4 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
        <span style={{ fontSize: '18px', opacity: 0.3 }}>🔒</span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>gizli</span>
      </div>
    )
  }

  return (
    <div
      draggable={canDrag}
      onDragStart={e => { setDragging(true); e.dataTransfer.setData('text/plain', String(index)) }}
      onDragEnd={() => setDragging(false)}
      onDragOver={e => { if (canDrag) { e.preventDefault(); setDragOver(true) } }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => {
        e.preventDefault()
        setDragOver(false)
        const fromIndex = Number(e.dataTransfer.getData('text/plain'))
        onDrop(fromIndex)
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '14px', padding: '13px 15px',
        background: dragOver ? 'rgba(168,85,247,0.15)' : hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${dragOver ? 'rgba(168,85,247,0.5)' : hovered ? border : 'rgba(255,255,255,0.08)'}`,
        transition: 'all 0.15s', backdropFilter: 'blur(5px)',
        cursor: canDrag ? 'grab' : 'default',
        opacity: dragging ? 0.4 : 1,
        outline: dragOver ? '2px solid rgba(168,85,247,0.4)' : 'none',
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        {canDrag && (
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px', paddingTop: '2px', flexShrink: 0, cursor: 'grab' }}>⠿</span>
        )}
        <p style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: 1.55, margin: '0 0 10px', wordBreak: 'break-word', flex: 1 }}>
          {card.content}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: card.anonymous ? '#7c3aed' : '#475569', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
          {card.anonymous ? '🎭' : ''} {card.createdBy}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={onVote} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '4px 9px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '12px', fontWeight: 700, transition: 'all 0.15s',
            background: card.voteCount > 0 ? `rgba(${accent === '#34d399' ? '16,185,129' : accent === '#fbbf24' ? '245,158,11' : '99,102,241'},0.2)` : 'rgba(255,255,255,0.06)',
            color: card.voteCount > 0 ? accent : '#64748b',
          }}>
            👍 {card.voteCount}
          </button>
          {hovered && canDelete && (
            <button onClick={onDelete} style={{
              width: '26px', height: '26px', borderRadius: '7px', border: 'none',
              background: 'rgba(239,68,68,0.12)', color: '#f87171',
              fontSize: '17px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s', lineHeight: 1,
            }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.25)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)'}>
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
