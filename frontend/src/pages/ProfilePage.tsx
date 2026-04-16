import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from '../api/users'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { fullName, email, role, companyName, inviteCode, setAuth, token, companyId, logout } = useAuth()
  const navigate = useNavigate()

  const [fullNameVal, setFullNameVal] = useState(fullName ?? '')
  const [emailVal, setEmailVal] = useState(email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const initials = fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword && newPassword !== confirmPassword) {
      setError('Yeni şifreler eşleşmiyor.')
      return
    }
    if (newPassword && newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalı.')
      return
    }
    if (newPassword && !currentPassword) {
      setError('Şifre değiştirmek için mevcut şifreyi gir.')
      return
    }

    setLoading(true)
    try {
      const payload: Record<string, string> = {}
      if (fullNameVal.trim() && fullNameVal.trim() !== fullName) payload.fullName = fullNameVal.trim()
      if (emailVal.trim() && emailVal.trim() !== email) payload.email = emailVal.trim()
      if (newPassword) { payload.currentPassword = currentPassword; payload.newPassword = newPassword }

      if (Object.keys(payload).length === 0) {
        setError('Değiştirilecek bir şey yok.')
        return
      }

      const res = await updateProfile(payload)
      setAuth(token!, res.data.email, res.data.fullName, res.data.role, companyId!, companyName!, inviteCode)
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      setSuccess('Profil güncellendi.')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Güncelleme başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 20, padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15,12,41,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ width: '34px', height: '34px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}>←</button>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>🔄</div>
          <span style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>RetroBoard</span>
        </div>
        <button onClick={logout} style={{ padding: '7px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          ↩ Çıkış
        </button>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '560px', width: '100%', margin: '40px auto', padding: '0 24px' }}>

        {/* Profil kartı */}
        <div style={{ borderRadius: '24px', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(30px)', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>

          {/* Üst band */}
          <div style={{ padding: '32px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.15))', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 900, color: 'white', margin: '0 auto 14px', boxShadow: '0 8px 25px rgba(168,85,247,0.4)' }}>
              {initials}
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: '0 0 4px' }}>{fullName}</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{email}</span>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: role === 'ADMIN' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.08)', color: role === 'ADMIN' ? '#c084fc' : '#64748b', fontWeight: 700 }}>
                {role === 'ADMIN' ? '👑 Admin' : '👤 User'}
              </span>
              {companyName && <span style={{ fontSize: '11px', color: '#475569' }}>🏢 {companyName}</span>}
            </div>
          </div>

          {/* Form */}
          <div style={{ padding: '32px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Ad Soyad */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ad Soyad</label>
                <input value={fullNameVal} onChange={e => setFullNameVal(e.target.value)}
                  style={{ width: '100%', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: 'white', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#a855f7'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</label>
                <input type="email" value={emailVal} onChange={e => setEmailVal(e.target.value)}
                  style={{ width: '100%', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: 'white', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#a855f7'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              {/* Ayraç */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '20px' }}>
                <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 16px', fontWeight: 600 }}>Şifre Değiştir <span style={{ fontWeight: 400 }}>(isteğe bağlı)</span></p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { label: 'Mevcut Şifre', value: currentPassword, onChange: setCurrentPassword },
                    { label: 'Yeni Şifre', value: newPassword, onChange: setNewPassword },
                    { label: 'Yeni Şifre Tekrar', value: confirmPassword, onChange: setConfirmPassword },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{f.label}</label>
                      <input type="password" value={f.value} onChange={e => f.onChange(e.target.value)}
                        placeholder="••••••••"
                        style={{ width: '100%', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: 'white', background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${f.label === 'Yeni Şifre Tekrar' && confirmPassword && newPassword && confirmPassword !== newPassword ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`, outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = '#a855f7'}
                        onBlur={e => e.target.style.borderColor = f.label === 'Yeni Şifre Tekrar' && confirmPassword && newPassword && confirmPassword !== newPassword ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'} />
                      {f.label === 'Yeni Şifre Tekrar' && confirmPassword && newPassword && confirmPassword !== newPassword && (
                        <p style={{ fontSize: '11px', color: '#f87171', margin: '4px 0 0' }}>Şifreler eşleşmiyor</p>
                      )}
                      {f.label === 'Yeni Şifre Tekrar' && confirmPassword && newPassword && confirmPassword === newPassword && (
                        <p style={{ fontSize: '11px', color: '#34d399', margin: '4px 0 0' }}>✓ Şifreler eşleşiyor</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '13px', color: '#fca5a5', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '13px', color: '#34d399', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  ✓ {success}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '14px', borderRadius: '14px', fontSize: '14px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #a855f7, #6366f1)', border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 8px 25px rgba(168,85,247,0.3)' }}>
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </form>

            {/* Davet kodu */}
            {inviteCode && (
              <div style={{ marginTop: '24px', padding: '16px', borderRadius: '14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Şirket Davet Kodu</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#34d399', letterSpacing: '0.15em', fontFamily: 'monospace' }}>{inviteCode}</span>
                  <button onClick={() => { navigator.clipboard.writeText(inviteCode); alert('Kopyalandı!') }}
                    style={{ padding: '7px 14px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, color: '#34d399', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer' }}>
                    Kopyala
                  </button>
                </div>
                <p style={{ fontSize: '11px', color: '#475569', margin: '6px 0 0' }}>Bu kodu takım üyelerinle paylaş</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
