import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
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
      const res = await register(email, password, fullName)
      setAuth(res.data.token, res.data.email, res.data.fullName)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kayıt başarısız.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.08)',
    border: '1.5px solid rgba(255,255,255,0.1)',
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
    }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative w-full max-w-md rounded-3xl p-10"
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
        }}>

        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>🔄</div>
          <span className="text-2xl font-black text-white">RetroBoard</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1 text-center">Hesap Oluştur</h2>
        <p className="text-slate-400 text-sm mb-8 text-center">Takımına katıl, retro yap</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { label: 'Ad Soyad', type: 'text', value: fullName, onChange: setFullName, placeholder: 'Mesut Bilge' },
            { label: 'Email', type: 'email', value: email, onChange: setEmail, placeholder: 'ornek@sirket.com' },
            { label: 'Şifre', type: 'password', value: password, onChange: setPassword, placeholder: 'En az 6 karakter' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-widest">{f.label}</label>
              <input
                type={f.type}
                value={f.value}
                onChange={e => f.onChange(e.target.value)}
                required
                minLength={f.type === 'password' ? 6 : undefined}
                placeholder={f.placeholder}
                className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#a855f7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          ))}

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-300"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-all active:scale-95 disabled:opacity-50 mt-2"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', boxShadow: '0 8px 30px rgba(168,85,247,0.4)' }}
          >
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol →'}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-6 text-center">
          Zaten hesabın var mı?{' '}
          <Link to="/login" className="font-semibold" style={{ color: '#a855f7' }}>Giriş yap</Link>
        </p>
      </div>
    </div>
  )
}
