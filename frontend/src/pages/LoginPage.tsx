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
    <div className="min-h-screen flex" style={{
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
    }}>
      {/* Sol bilgi paneli */}
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1 relative overflow-hidden">
        {/* Dekoratif daireler */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
              🔄
            </div>
            <span className="text-3xl font-black text-white tracking-tight">RetroBoard</span>
          </div>

          <h1 className="text-5xl font-black text-white leading-tight mb-5">
            Takımınla<br/>
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              daha iyi
            </span><br/>
            retrospektifler
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm mb-10">
            Sprint sonu toplantılarını dijitalleştir. Sorunları tespit et, aksiyonlar al, her sprint daha iyi ol.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { icon: '⚡', title: 'Gerçek zamanlı', desc: 'Takım aynı anda düzenleyebilir' },
              { icon: '🗳️', title: 'Oylama sistemi', desc: 'Önemli konular öne çıksın' },
              { icon: '📱', title: 'Her platformda', desc: 'Web ve mobil uygulaması' },
            ].map(f => (
              <div key={f.title} className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'rgba(168, 85, 247, 0.2)' }}>
                  {f.icon}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{f.title}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sağ form paneli */}
      <div className="flex items-center justify-center w-full lg:w-auto lg:min-w-[500px] p-8">
        <div className="w-full max-w-md rounded-3xl p-10"
          style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
          }}>

          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>🔄</div>
            <span className="text-2xl font-black text-white">RetroBoard</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Giriş Yap</h2>
          <p className="text-slate-400 text-sm mb-8">Hesabına hoş geldin</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="ornek@sirket.com"
                className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                }}
                onFocus={e => e.target.style.borderColor = '#a855f7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-widest">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                }}
                onFocus={e => e.target.style.borderColor = '#a855f7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

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
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            Hesabın yok mu?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#a855f7' }}>
              Kayıt ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
