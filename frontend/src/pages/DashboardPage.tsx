import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBoards, createBoard, deleteBoard } from '../api/boards'
import { getTeams, type TeamResponse } from '../api/teams'
import { useAuth } from '../context/AuthContext'
import type { Board } from '../types'

export default function DashboardPage() {
  const [boards, setBoards] = useState<Board[]>([])
  const [teams, setTeams] = useState<TeamResponse[]>([])
  const [name, setName] = useState('')
  const [teamId, setTeamId] = useState<number | ''>('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { fullName, companyName, inviteCode, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getBoards().then(res => setBoards(res.data))
    if (isAdmin) getTeams().then(res => setTeams(res.data))
  }, [isAdmin])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamId) return
    setLoading(true)
    try {
      const res = await createBoard(name, teamId as number)
      setBoards(prev => [res.data, ...prev])
      setName(''); setTeamId(''); setShowForm(false)
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu board silinsin mi?')) return
    await deleteBoard(id)
    setBoards(prev => prev.filter(b => b.id !== id))
  }

  const initials = fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  const totalCards = boards.reduce((s, b) => s + b.cards.length, 0)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: 'absolute', top: '-100px', left: '20%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-100px', right: '20%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 20, padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15,12,41,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🔄</div>
          <div>
            <span style={{ fontSize: '17px', fontWeight: 900, color: 'white' }}>RetroBoard</span>
            {companyName && <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px', fontWeight: 500 }}>{companyName}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: '📋 Boardlar', path: '/' },
            ...(isAdmin ? [{ label: '👥 Takımlar', path: '/teams' }] : []),
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{
                padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                background: item.path === '/' ? 'rgba(168,85,247,0.2)' : 'transparent',
                color: item.path === '/' ? '#c084fc' : '#64748b',
              }}>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAdmin && inviteCode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer' }}
              onClick={() => { navigator.clipboard.writeText(inviteCode); alert('Davet kodu kopyalandı: ' + inviteCode) }}
              title="Davet kodunu kopyala">
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'monospace' }}>{inviteCode}</span>
              <span style={{ fontSize: '11px', color: '#059669' }}>📋</span>
            </div>
          )}
          <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white' }}>{initials}</div>
            <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 500 }}>{fullName}</span>
          </button>
          <button onClick={logout}
            style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            ↩ Çıkış
          </button>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>

        {/* İstatistik kartları */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'Toplam Board', value: boards.length, icon: '📋', accent: '#a855f7' },
            { label: 'Toplam Kart', value: totalCards, icon: '🃏', accent: '#6366f1' },
            { label: 'Takım Sayısı', value: teams.length, icon: '👥', accent: '#10b981' },
          ].map(s => (
            <div key={s.label} style={{ borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `rgba(${s.accent === '#a855f7' ? '168,85,247' : s.accent === '#6366f1' ? '99,102,241' : '16,185,129'},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: s.accent, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Başlık + buton */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white', margin: 0 }}>Boardlar</h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Sprint retrospektiflerini yönet</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowForm(!showForm)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '14px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer', border: 'none', boxShadow: '0 8px 25px rgba(168,85,247,0.35)' }}>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
              Yeni Board
            </button>
          )}
        </div>

        {/* Board oluşturma formu */}
        {showForm && (
          <div style={{ borderRadius: '20px', padding: '28px', marginBottom: '24px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '20px' }}>Yeni Board Oluştur</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Board Adı *</label>
                <input value={name} onChange={e => setName(e.target.value)} required placeholder="Q2 Sprint 5 Retro"
                  style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: 'white', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#a855f7'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
              <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Takım *</label>
                <select value={teamId} onChange={e => setTeamId(Number(e.target.value))} required
                  style={{ borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: teamId ? 'white' : '#64748b', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', outline: 'none', cursor: 'pointer' }}>
                  <option value="">Takım seç...</option>
                  {teams.map(t => <option key={t.id} value={t.id} style={{ background: '#1e1b4b' }}>{t.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ padding: '12px 18px', borderRadius: '12px', fontSize: '14px', color: '#94a3b8', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  İptal
                </button>
                <button type="submit" disabled={loading || !teamId}
                  style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #a855f7, #6366f1)', border: 'none', cursor: 'pointer', opacity: (loading || !teamId) ? 0.6 : 1 }}>
                  {loading ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
            {teams.length === 0 && (
              <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '12px' }}>
                ⚠️ Önce <button onClick={() => navigate('/teams')} style={{ color: '#fbbf24', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Takımlar</button> sayfasından bir takım oluştur.
              </p>
            )}
          </div>
        )}

        {/* Board kartları */}
        {boards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 32px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Henüz board yok</h3>
            <p style={{ fontSize: '13px', color: '#475569' }}>
              {isAdmin ? 'Yukarıdaki "Yeni Board" butonuna tıkla' : 'Admin bir board oluşturduğunda burada görünecek'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {boards.map(board => (
              <div key={board.id} onClick={() => navigate(`/board/${board.id}`)}
                style={{ borderRadius: '20px', padding: '24px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', transition: 'border-color 0.2s, box-shadow 0.2s', position: 'relative' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(168,85,247,0.45)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 45px rgba(168,85,247,0.15)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(99,102,241,0.25))', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                    📋
                  </div>
                  {isAdmin && (
                    <button onClick={e => { e.stopPropagation(); handleDelete(board.id) }}
                      style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#475569', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s', lineHeight: 1 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#475569' }}>
                      ×
                    </button>
                  )}
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '6px', lineHeight: 1.4 }}>{board.name}</h3>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '99px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                    👥 {board.teamName}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>🃏 {board.cards.length} kart</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{new Date(board.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
