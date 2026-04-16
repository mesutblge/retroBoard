import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(email, password)
      setAuth(res.data.token, res.data.email, res.data.fullName)
      navigate('/')
    } catch {
      setError('Email veya şifre hatalı.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Arka plan glow */}
      <div style={{ position: 'absolute', top: '-200px', left: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.18), transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '460px',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(30px)',
      }}>

        {/* Üst renkli band */}
        <div style={{
          padding: '40px 40px 32px',
          background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(99,102,241,0.2) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          textAlign: 'center',
        }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', margin: '0 auto 16px',
            boxShadow: '0 8px 25px rgba(168,85,247,0.45)',
          }}>🔄</div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'white', margin: '0 0 6px', letterSpacing: '-0.5px' }}>RetroBoard</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Takımınla daha iyi retrospektifler yap</p>
        </div>

        {/* Form alanı */}
        <div style={{ padding: '36px 40px 40px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white', margin: '0 0 4px' }}>Giriş Yap</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 28px' }}>Hesabına hoş geldin 👋</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Email
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="ornek@sirket.com"
                style={{
                  width: '100%', borderRadius: '12px', padding: '13px 16px',
                  fontSize: '14px', color: 'white', outline: 'none',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#a855f7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Şifre
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{
                  width: '100%', borderRadius: '12px', padding: '13px 16px',
                  fontSize: '14px', color: 'white', outline: 'none',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#a855f7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {error && (
              <div style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '13px', color: '#fca5a5', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '15px', borderRadius: '14px',
              fontSize: '14px', fontWeight: 700, color: 'white',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              border: 'none', cursor: 'pointer', marginTop: '6px',
              boxShadow: '0 8px 25px rgba(168,85,247,0.35)',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
            }}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
            </button>
          </form>

          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
              Hesabın yok mu?{' '}
              <Link to="/register" style={{ color: '#a855f7', fontWeight: 700, textDecoration: 'none' }}>
                Kayıt ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
