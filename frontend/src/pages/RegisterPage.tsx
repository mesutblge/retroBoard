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
      setAuth(res.data.token, res.data.email, res.data.fullName, res.data.role)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kayıt başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
    }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.2), transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="rounded-3xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(30px)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>

          {/* Üst başlık bandı */}
          <div className="px-10 pt-10 pb-6 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.15))', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', boxShadow: '0 8px 25px rgba(168,85,247,0.4)' }}>
              🔄
            </div>
            <h2 className="text-2xl font-black text-white">Hesap Oluştur</h2>
            <p className="text-slate-400 text-sm mt-1">RetroBoard'a katıl</p>
          </div>

          {/* Form */}
          <div className="p-10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {[
                { label: 'Ad Soyad', type: 'text', value: fullName, onChange: setFullName, placeholder: 'Mesut Bilge' },
                { label: 'Email', type: 'email', value: email, onChange: setEmail, placeholder: 'ornek@sirket.com' },
                { label: 'Şifre', type: 'password', value: password, onChange: setPassword, placeholder: 'En az 6 karakter' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">{f.label}</label>
                  <input
                    type={f.type} value={f.value} onChange={e => f.onChange(e.target.value)}
                    required minLength={f.type === 'password' ? 6 : undefined} placeholder={f.placeholder}
                    className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.08)' }}
                    onFocus={e => e.target.style.borderColor = '#a855f7'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
              ))}

              {error && (
                <div className="px-4 py-3 rounded-xl text-sm text-red-300"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 mt-1"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', boxShadow: '0 8px 30px rgba(168,85,247,0.35)' }}>
                {loading ? 'Kaydediliyor...' : 'Kayıt Ol →'}
              </button>
            </form>

            <p className="text-sm text-slate-500 mt-6 text-center">
              Zaten hesabın var mı?{' '}
              <Link to="/login" className="font-semibold hover:text-purple-300 transition-colors" style={{ color: '#a855f7' }}>
                Giriş yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
