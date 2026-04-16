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
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Sol panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1 text-white">
        <div className="mb-4 text-5xl">🔄</div>
        <h1 className="text-5xl font-black mb-4 leading-tight">Retro<br/>Board</h1>
        <p className="text-purple-200 text-lg max-w-sm leading-relaxed">
          Takımınla daha iyi retrospektifler yap. Sorunları tespit et, aksiyonlar al, büyü.
        </p>
        <div className="mt-10 flex flex-col gap-3">
          {['Gerçek zamanlı işbirliği', 'Kolay kart yönetimi', 'Oylama sistemi'].map(f => (
            <div key={f} className="flex items-center gap-3 text-purple-100">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</div>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sağ panel */}
      <div className="flex items-center justify-center w-full lg:w-auto lg:min-w-[480px] p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
          <div className="lg:hidden mb-6 text-center">
            <span className="text-4xl">🔄</span>
            <h2 className="text-2xl font-black text-gray-800 mt-1">RetroBoard</h2>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Hoş geldin!</h2>
          <p className="text-gray-400 text-sm mb-8">Hesabına giriş yap</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="ornek@sirket.com"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition-colors bg-gray-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition-colors bg-gray-50 focus:bg-white"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 text-sm tracking-wide shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-6 text-center">
            Hesabın yok mu?{' '}
            <Link to="/register" className="text-purple-600 font-semibold hover:text-purple-700">
              Kayıt ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
