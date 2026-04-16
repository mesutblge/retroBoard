import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBoards, createBoard, deleteBoard } from '../api/boards'
import { useAuth } from '../context/AuthContext'
import type { Board } from '../types'

export default function DashboardPage() {
  const [boards, setBoards] = useState<Board[]>([])
  const [name, setName] = useState('')
  const [sprintName, setSprintName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { fullName, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { getBoards().then(res => setBoards(res.data)) }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await createBoard(name, sprintName)
      setBoards(prev => [res.data, ...prev])
      setName('')
      setSprintName('')
      setShowForm(false)
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu board silinsin mi?')) return
    await deleteBoard(id)
    setBoards(prev => prev.filter(b => b.id !== id))
  }

  const initials = fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  const totalCards = boards.reduce((s, b) => s + b.cards.length, 0)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      {/* Arka plan efektleri */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(80px)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-8 py-5 flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>🔄</div>
          <span className="text-xl font-black text-white tracking-tight">RetroBoard</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="w-8 h-8 rounded-lg text-white text-xs font-bold flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
              {initials}
            </div>
            <span className="text-sm text-slate-300 hidden sm:block">{fullName}</span>
          </div>
          <button onClick={logout}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors px-3 py-2 rounded-xl hover:bg-red-500/10">
            Çıkış
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-8 py-10">
        {/* İstatistik kartları */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Toplam Board', value: boards.length, icon: '📋' },
            { label: 'Toplam Kart', value: totalCards, icon: '🃏' },
            { label: 'Aktif Sprint', value: boards.filter(b => b.sprintName).length, icon: '🚀' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
              <div className="text-3xl">{s.icon}</div>
              <div>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Başlık + buton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Boardlarım</h2>
            <p className="text-slate-400 text-sm mt-0.5">Sprint retrospektiflerini yönet</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', boxShadow: '0 8px 25px rgba(168,85,247,0.35)' }}
          >
            + Yeni Board
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl p-6 mb-6"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', backdropFilter: 'blur(10px)' }}>
            <h3 className="font-bold text-white mb-5">Yeni Board Oluştur</h3>
            <form onSubmit={handleCreate} className="flex gap-3 items-end">
              {[
                { label: 'Board Adı *', value: name, onChange: setName, placeholder: 'Q2 Sprint 5 Retro', required: true },
                { label: 'Sprint Adı', value: sprintName, onChange: setSprintName, placeholder: 'Sprint 5', required: false },
              ].map(f => (
                <div key={f.label} className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{f.label}</label>
                  <input
                    value={f.value}
                    onChange={e => f.onChange(e.target.value)}
                    required={f.required}
                    placeholder={f.placeholder}
                    className="rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => e.target.style.borderColor = '#a855f7'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-3 text-sm text-slate-400 hover:text-white border border-white/10 rounded-xl transition-colors">
                  İptal
                </button>
                <button type="submit" disabled={loading}
                  className="text-white text-sm font-bold px-6 py-3 rounded-xl disabled:opacity-50 transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
                  {loading ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Board kartları */}
        {boards.length === 0 ? (
          <div className="text-center py-24 rounded-3xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-slate-300 mb-1">Henüz board yok</h3>
            <p className="text-slate-500 text-sm">İlk retrospektif boardunu oluştur</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {boards.map(board => (
              <div key={board.id} onClick={() => navigate(`/board/${board.id}`)}
                className="rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 group relative overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(10px)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}>

                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"
                  style={{ background: 'radial-gradient(circle at top left, rgba(168,85,247,0.08), transparent 70%)' }} />

                <div className="relative flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(99,102,241,0.3))', border: '1px solid rgba(168,85,247,0.2)' }}>
                    📋
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(board.id) }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 text-lg leading-none">
                    ×
                  </button>
                </div>

                <h3 className="font-bold text-white text-base mb-2 leading-snug group-hover:text-purple-300 transition-colors">
                  {board.name}
                </h3>

                {board.sprintName && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                    {board.sprintName}
                  </span>
                )}

                <div className="flex items-center justify-between mt-5 pt-4"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span>🃏</span> {board.cards.length} kart
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(board.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
