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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
    }}>
      {/* Arka plan efektleri */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.2), transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.05), transparent 60%)' }} />
      </div>

      {/* Merkezi kart */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col lg:flex-row gap-0 rounded-3xl overflow-hidden shadow-2xl"
        style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)' }}>

        {/* Sol bilgi paneli */}
        <div className="flex-1 flex flex-col justify-center p-12 relative"
          style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.25) 0%, rgba(99,102,241,0.25) 100%)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="absolute inset-0"
            style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

          <div className="relative">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', boxShadow: '0 8px 20px rgba(168,85,247,0.4)' }}>
                🔄
              </div>
              <span className="text-3xl font-black text-white tracking-tight">RetroBoard</span>
            </div>

            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Takımınla<br/>
              <span style={{ background: 'linear-gradient(135deg, #c084fc, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                güçlü retrospektifler
              </span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-10 text-sm">
              Sprint sonu toplantılarını dijitalleştir. Sorunları tespit et, aksiyonlar al.
            </p>

            <div className="flex flex-col gap-3">
              {[
                { icon: '⚡', text: 'Gerçek zamanlı işbirliği' },
                { icon: '🗳️', text: 'Oylama ile önceliklendirme' },
                { icon: '📱', text: 'Web & mobil uygulama' },
              ].map(f => (
                <div key={f.text} className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}>
                    {f.icon}
                  </div>
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ form paneli */}
        <div className="flex-1 flex flex-col justify-center p-12"
          style={{ background: 'rgba(15,12,41,0.8)', backdropFilter: 'blur(30px)' }}>
          <h2 className="text-2xl font-bold text-white mb-1">Giriş Yap</h2>
          <p className="text-slate-500 text-sm mb-8">Hesabına hoş geldin 👋</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="ornek@sirket.com"
                className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.target.style.borderColor = '#a855f7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">Şifre</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.target.style.borderColor = '#a855f7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm text-red-300"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 mt-1"
              style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', boxShadow: '0 8px 30px rgba(168,85,247,0.35)' }}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
            </button>
          </form>

          <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm text-slate-500 text-center">
              Hesabın yok mu?{' '}
              <Link to="/register" className="font-semibold transition-colors hover:text-purple-300" style={{ color: '#a855f7' }}>
                Kayıt ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
