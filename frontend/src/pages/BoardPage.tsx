import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getBoard, addCard, voteCard, deleteCard } from '../api/boards'
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
  emptyColor: string
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
    emptyColor: 'rgba(16,185,129,0.2)',
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
    emptyColor: 'rgba(245,158,11,0.2)',
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
    emptyColor: 'rgba(99,102,241,0.2)',
  },
]

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const boardId = Number(id)
  const navigate = useNavigate()
  const { isAdmin, fullName } = useAuth()
  const [board, setBoard] = useState<Board | null>(null)
  const [newCard, setNewCard] = useState<{ [k in ColumnType]?: string }>({})
  const [anonymous, setAnonymous] = useState(false)
  const stompRef = useRef<Client | null>(null)

  const initials = fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

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
    await addCard(boardId, content, columnType, anonymous)
    setNewCard(prev => ({ ...prev, [columnType]: '' }))
  }

  const cardsOf = (type: ColumnType) =>
    (board?.cards ?? []).filter(c => c.columnType === type).sort((a, b) => b.voteCount - a.voteCount)

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
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
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

        {/* Kart sayıları */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          {COLUMNS.map(col => (
            <div key={col.type} style={{ padding: '5px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '12px' }}>{col.emoji}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: col.accent }}>{cardsOf(col.type).length}</span>
            </div>
          ))}
        </div>

        {/* Anonim toggle */}
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

        {/* Profil */}
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
      </header>

      {/* Kolonlar */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', position: 'relative', zIndex: 1 }}>
        {COLUMNS.map(col => {
          const cards = cardsOf(col.type)
          return (
            <div key={col.type} style={{
              borderRadius: '20px', overflow: 'hidden',
              border: `1px solid ${col.border}`,
              background: col.colBg, backdropFilter: 'blur(10px)',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Kolon başlığı */}
              <div style={{
                padding: '14px 18px', background: col.headerBg,
                borderBottom: `1px solid ${col.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '17px' }}>{col.emoji}</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>{col.label}</span>
                </div>
                <div style={{ minWidth: '24px', height: '24px', borderRadius: '7px', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: col.accent, padding: '0 7px' }}>
                  {cards.length}
                </div>
              </div>

              {/* Kartlar */}
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {cards.length === 0 ? (
                  <div style={{ padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '26px', opacity: 0.25 }}>{col.emoji}</span>
                    <span style={{ fontSize: '12px', color: '#475569' }}>Henüz kart yok</span>
                  </div>
                ) : cards.map(card => (
                  <CardItem
                    key={card.id} card={card} accent={col.accent} border={col.border}
                    canDelete={isAdmin || (!card.anonymous && card.createdBy === fullName)}
                    onVote={() => voteCard(card.id)}
                    onDelete={() => deleteCard(card.id)}
                  />
                ))}
              </div>

              {/* Kart ekle */}
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function CardItem({ card, accent, border, canDelete, onVote, onDelete }: {
  card: Card
  accent: string
  border: string
  canDelete: boolean
  onVote: () => void
  onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '14px', padding: '13px 15px',
        background: hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${hovered ? border : 'rgba(255,255,255,0.08)'}`,
        transition: 'all 0.2s', backdropFilter: 'blur(5px)',
      }}>
      <p style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: 1.55, margin: '0 0 10px', wordBreak: 'break-word' }}>
        {card.content}
      </p>
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
