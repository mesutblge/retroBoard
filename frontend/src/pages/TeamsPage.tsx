import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTeams, createTeam, deleteTeam, addMember, removeMember, type TeamResponse } from '../api/teams'
import { getUsers, type UserResponse } from '../api/users'
import { useAuth } from '../context/AuthContext'

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamResponse[]>([])
  const [users, setUsers] = useState<UserResponse[]>([])
  const [newTeamName, setNewTeamName] = useState('')
  const [creating, setCreating] = useState(false)
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null)
  const { fullName, companyName, inviteCode, logout, isAdmin, email: currentEmail } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return }
    getTeams().then(res => setTeams(res.data))
    getUsers().then(res => setUsers(res.data))
  }, [isAdmin])

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim()) return
    setCreating(true)
    try {
      const res = await createTeam(newTeamName.trim())
      setTeams(prev => [...prev, res.data])
      setNewTeamName('')
    } finally { setCreating(false) }
  }

  const handleDeleteTeam = async (id: number) => {
    if (!confirm('Bu takım silinsin mi?')) return
    await deleteTeam(id)
    setTeams(prev => prev.filter(t => t.id !== id))
    if (expandedTeam === id) setExpandedTeam(null)
  }

  const handleAddMember = async (teamId: number, userId: number) => {
    const res = await addMember(teamId, userId)
    setTeams(prev => prev.map(t => t.id === teamId ? res.data : t))
  }

  const handleRemoveMember = async (teamId: number, userId: number) => {
    const res = await removeMember(teamId, userId)
    setTeams(prev => prev.map(t => t.id === teamId ? res.data : t))
  }

  const initials = fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', left: '20%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)', filter: 'blur(60px)' }} />
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
            { label: '👥 Takımlar', path: '/teams' },
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{
                padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                background: item.path === '/teams' ? 'rgba(168,85,247,0.2)' : 'transparent',
                color: item.path === '/teams' ? '#c084fc' : '#64748b',
              }}>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {inviteCode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer' }}
              onClick={() => { navigator.clipboard.writeText(inviteCode); alert('Davet kodu kopyalandı: ' + inviteCode) }}
              title="Davet kodunu kopyala">
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Davet:</span>
              <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'monospace' }}>{inviteCode}</span>
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

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto', padding: '40px 32px' }}>

        {/* Başlık */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white', margin: '0 0 4px' }}>Takım Yönetimi</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Takımları oluştur, üye ekle veya çıkar</p>
          </div>
          <div style={{ fontSize: '12px', color: '#475569' }}>{teams.length} takım · {users.length} kullanıcı</div>
        </div>

        {/* Kullanıcılar kutusu - üstte */}
        <div style={{ borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Şirket Kullanıcıları</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: u.role === 'ADMIN' ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white' }}>
                  {u.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', lineHeight: 1 }}>{u.fullName}</div>
                  {u.email === currentEmail && <div style={{ fontSize: '10px', color: '#a855f7', marginTop: '1px' }}>Sen</div>}
                  {u.role === 'ADMIN' && u.email !== currentEmail && <div style={{ fontSize: '10px', color: '#818cf8', marginTop: '1px' }}>Admin</div>}
                </div>
              </div>
            ))}
            {users.length === 0 && <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>Henüz kullanıcı yok.</p>}
          </div>
        </div>

        {/* Takım oluşturma formu */}
        <form onSubmit={handleCreateTeam} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="Yeni takım adı..." required
            style={{ flex: 1, borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: 'white', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#a855f7'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          <button type="submit" disabled={creating || !newTeamName.trim()}
            style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #a855f7, #6366f1)', border: 'none', cursor: 'pointer', opacity: (creating || !newTeamName.trim()) ? 0.6 : 1, whiteSpace: 'nowrap' }}>
            + Takım Oluştur
          </button>
        </form>

        {/* Takım listesi */}
        {teams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 32px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#94a3b8' }}>Henüz takım yok</h3>
            <p style={{ fontSize: '13px', color: '#475569' }}>Yukarıdan ilk takımı oluştur</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {teams.map(team => {
              const memberIds = new Set(team.members.map(m => m.id))
              const nonMembers = users.filter(u => !memberIds.has(u.id))
              const isExpanded = expandedTeam === team.id

              return (
                <div key={team.id} style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                  {/* Takım başlığı */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer' }}
                    onClick={() => setExpandedTeam(isExpanded ? null : team.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(99,102,241,0.3))', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                        👥
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>{team.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>{team.members.length} üye</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px', color: '#64748b', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>⌄</span>
                      <button onClick={e => { e.stopPropagation(); handleDeleteTeam(team.id) }}
                        style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}>
                        Sil
                      </button>
                    </div>
                  </div>

                  {/* Genişlemiş içerik */}
                  {isExpanded && (
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {/* Mevcut üyeler */}
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Üyeler</div>
                        {team.members.length === 0 ? (
                          <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>Henüz üye yok.</p>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {team.members.map(m => (
                              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '10px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white' }}>
                                  {m.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <span style={{ fontSize: '13px', color: '#c084fc', fontWeight: 500 }}>{m.fullName}</span>
                                <button onClick={() => handleRemoveMember(team.id, m.id)}
                                  style={{ width: '18px', height: '18px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer', lineHeight: 1, flexShrink: 0 }}
                                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#f87171'}
                                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#64748b'}>
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Eklenebilir üyeler */}
                      {nonMembers.length > 0 && (
                        <div style={{ marginTop: '14px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Ekle</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {nonMembers.map(u => (
                              <button key={u.id} onClick={() => handleAddMember(team.id, u.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(168,85,247,0.15)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(168,85,247,0.3)' }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)' }}>
                                <span style={{ fontSize: '13px', color: '#94a3b8' }}>+ {u.fullName}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
