import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await register(
        email, password, fullName,
        mode === 'create' ? companyName : undefined,
        mode === 'join' ? inviteCode : undefined
      )
      const d = res.data
      setAuth(d.token, d.email, d.fullName, d.role, d.companyId, d.companyName, d.inviteCode)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kayıt başarısız.')
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
      <div style={{ position: 'absolute', top: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.18), transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-200px', left: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '460px',
        borderRadius: '28px', overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(30px)',
      }}>

        {/* Üst band */}
        <div style={{
          padding: '36px 40px 28px',
          background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(99,102,241,0.2) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          textAlign: 'center',
        }}>
          <div style={{
            width: '58px', height: '58px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', margin: '0 auto 14px',
            boxShadow: '0 8px 25px rgba(168,85,247,0.45)',
          }}>🔄</div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'white', margin: '0 0 4px', letterSpacing: '-0.3px' }}>Hesap Oluştur</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>RetroBoard'a katıl</p>
        </div>

        {/* Form alanı */}
        <div style={{ padding: '28px 40px 36px' }}>

          {/* Mod toggle */}
          <div style={{
            display: 'flex', gap: '6px',
            padding: '5px', borderRadius: '14px',
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '24px',
          }}>
            {([
              { id: 'create' as const, icon: '🏢', label: 'Şirket Kur', sub: 'Admin hesabı' },
              { id: 'join' as const, icon: '🔗', label: 'Katıl', sub: 'Davet koduyla' },
            ]).map(opt => (
              <button key={opt.id} type="button" onClick={() => setMode(opt.id)}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: '10px',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: mode === opt.id
                    ? 'linear-gradient(135deg, #a855f7, #6366f1)'
                    : 'transparent',
                  boxShadow: mode === opt.id ? '0 4px 14px rgba(168,85,247,0.4)' : 'none',
                }}>
                <div style={{ fontSize: '15px', marginBottom: '2px' }}>{opt.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: mode === opt.id ? 'white' : '#64748b', lineHeight: 1.2 }}>{opt.label}</div>
                <div style={{ fontSize: '11px', color: mode === opt.id ? 'rgba(255,255,255,0.7)' : '#475569', marginTop: '1px' }}>{opt.sub}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Ad Soyad */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Ad Soyad
              </label>
              <input
                type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                required placeholder="Mesut Bilge"
                style={{ width: '100%', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: 'white', outline: 'none', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#a855f7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Email
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="ornek@sirket.com"
                style={{ width: '100%', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: 'white', outline: 'none', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#a855f7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Şifre */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Şifre
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required minLength={6} placeholder="En az 6 karakter"
                style={{ width: '100%', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: 'white', outline: 'none', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#a855f7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Şirket adı veya davet kodu */}
            {mode === 'create' ? (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Şirket Adı
                </label>
                <input
                  type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                  required placeholder="Acme Corp"
                  style={{ width: '100%', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: 'white', outline: 'none', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#a855f7'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <p style={{ fontSize: '11px', color: '#475569', margin: '5px 0 0', paddingLeft: '4px' }}>
                  Şirket kurulur, sana admin + davet kodu verilir
                </p>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Davet Kodu
                </label>
                <input
                  type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  required placeholder="ABCD1234" maxLength={8}
                  style={{ width: '100%', borderRadius: '12px', padding: '12px 16px', fontSize: '18px', fontWeight: 800, color: '#c084fc', outline: 'none', background: 'rgba(168,85,247,0.08)', border: '1.5px solid rgba(168,85,247,0.2)', transition: 'border-color 0.2s', boxSizing: 'border-box', letterSpacing: '0.25em', textAlign: 'center', fontFamily: 'monospace' }}
                  onFocus={e => e.target.style.borderColor = '#a855f7'}
                  onBlur={e => e.target.style.borderColor = 'rgba(168,85,247,0.2)'}
                />
                <p style={{ fontSize: '11px', color: '#475569', margin: '5px 0 0', paddingLeft: '4px' }}>
                  Adminden aldığın 8 haneli kodu gir
                </p>
              </div>
            )}

            {error && (
              <div style={{ padding: '11px 14px', borderRadius: '12px', fontSize: '13px', color: '#fca5a5', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: '14px', marginTop: '4px',
              fontSize: '14px', fontWeight: 700, color: 'white',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 25px rgba(168,85,247,0.35)',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s', letterSpacing: '0.02em',
            }}>
              {loading ? 'Kaydediliyor...' : mode === 'create' ? 'Şirket Kur ve Devam Et →' : 'Katıl →'}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
              Zaten hesabın var mı?{' '}
              <Link to="/login" style={{ color: '#a855f7', fontWeight: 700, textDecoration: 'none' }}>
                Giriş yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
