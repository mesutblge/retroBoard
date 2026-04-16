import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsers, updateRole, type UserResponse } from '../api/users'
import { useAuth } from '../context/AuthContext'

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState<number | null>(null)
  const { fullName, email: currentEmail, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return }
    getUsers().then(res => setUsers(res.data))
  }, [isAdmin])

  const handleRoleToggle = async (user: UserResponse) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
    setLoading(user.id)
    try {
      const res = await updateRole(user.id, newRole)
      setUsers(prev => prev.map(u => u.id === user.id ? res.data : u))
    } finally {
      setLoading(null)
    }
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
          <span style={{ fontSize: '17px', fontWeight: 900, color: 'white' }}>RetroBoard</span>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: '📋 Boardlar', path: '/' },
            { label: '👥 Kullanıcılar', path: '/users' },
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{
                padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                background: item.path === '/users' ? 'rgba(168,85,247,0.2)' : 'transparent',
                color: item.path === '/users' ? '#c084fc' : '#64748b',
              }}>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white' }}>{initials}</div>
            <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 500 }}>{fullName}</span>
          </div>
          <button onClick={logout}
            style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            ↩ Çıkış
          </button>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white', margin: '0 0 4px' }}>Kullanıcı Yönetimi</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Kullanıcıları görüntüle ve rol değiştir</p>
        </div>

        <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}>
          {/* Tablo başlığı */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 140px', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
            {['İsim', 'Email', 'Kayıt Tarihi', 'Rol'].map(h => (
              <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
            ))}
          </div>

          {/* Kullanıcı satırları */}
          {users.map((user, i) => (
            <div key={user.id}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 140px', padding: '16px 24px', alignItems: 'center', borderBottom: i < users.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>

              {/* İsim */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: user.role === 'ADMIN' ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                  {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{user.fullName}</div>
                  {user.email === currentEmail && <div style={{ fontSize: '11px', color: '#a855f7', marginTop: '1px' }}>Sen</div>}
                </div>
              </div>

              {/* Email */}
              <span style={{ fontSize: '13px', color: '#64748b' }}>{user.email}</span>

              {/* Tarih */}
              <span style={{ fontSize: '12px', color: '#475569' }}>
                {new Date(user.createdAt).toLocaleDateString('tr-TR')}
              </span>

              {/* Rol */}
              <div>
                {user.email === currentEmail ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)' }}>
                    👑 Admin (Sen)
                  </span>
                ) : (
                  <button
                    onClick={() => handleRoleToggle(user)}
                    disabled={loading === user.id}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                      cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                      opacity: loading === user.id ? 0.6 : 1,
                      background: user.role === 'ADMIN' ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.06)',
                      color: user.role === 'ADMIN' ? '#c084fc' : '#64748b',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = user.role === 'ADMIN' ? 'rgba(239,68,68,0.15)' : 'rgba(168,85,247,0.2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = user.role === 'ADMIN' ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.06)'}>
                    {loading === user.id ? '...' : user.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '12px', color: '#334155', marginTop: '16px', textAlign: 'center' }}>
          Butona tıklayarak kullanıcının rolünü değiştirebilirsin
        </p>
      </main>
    </div>
  )
}
