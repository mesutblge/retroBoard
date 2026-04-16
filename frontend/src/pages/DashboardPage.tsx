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

  useEffect(() => {
    getBoards().then(res => setBoards(res.data))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await createBoard(name, sprintName)
      setBoards(prev => [res.data, ...prev])
      setName('')
      setSprintName('')
      setShowForm(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu board silinsin mi?')) return
    await deleteBoard(id)
    setBoards(prev => prev.filter(b => b.id !== id))
  }

  const initials = fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="min-h-screen" style={{ background: '#f8f7ff' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔄</span>
          <span className="text-xl font-black" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            RetroBoard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full text-white text-sm font-bold flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              {initials}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{fullName}</span>
          </div>
          <button
            onClick={logout}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors border border-gray-200 rounded-lg px-3 py-1.5 hover:border-red-200"
          >
            Çıkış
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-10">
        {/* Üst alan */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Boardlarım</h1>
            <p className="text-gray-400 text-sm mt-0.5">{boards.length} aktif board</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <span className="text-lg leading-none">+</span>
            Yeni Board
          </button>
        </div>

        {/* Yeni board formu */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-purple-100 shadow-lg shadow-purple-50 p-6 mb-8">
            <h3 className="font-semibold text-gray-700 mb-4">Yeni Board Oluştur</h3>
            <form onSubmit={handleCreate} className="flex gap-3 items-end">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Board Adı *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Q2 Sprint 5 Retro"
                  className="border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-400 transition-colors bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sprint Adı</label>
                <input
                  value={sprintName}
                  onChange={e => setSprintName(e.target.value)}
                  placeholder="Sprint 5"
                  className="border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-400 transition-colors bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-600 border-2 border-gray-100 rounded-xl transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="text-white text-sm font-semibold px-6 py-2.5 rounded-xl disabled:opacity-50 transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  {loading ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Board listesi */}
        {boards.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-500 mb-1">Henüz board yok</h3>
            <p className="text-gray-400 text-sm">İlk retrospektif boardunu oluştur</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {boards.map(board => (
              <div
                key={board.id}
                onClick={() => navigate(`/board/${board.id}`)}
                className="bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer hover:shadow-xl hover:shadow-purple-100 hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden"
              >
                {/* Dekor çizgi */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }} />

                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: 'linear-gradient(135deg, #f3f0ff, #ede9fe)' }}>
                    📋
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(board.id) }}
                    className="w-7 h-7 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 flex items-center justify-center transition-all text-lg leading-none"
                  >
                    ×
                  </button>
                </div>

                <h3 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors mb-1">
                  {board.name}
                </h3>

                {board.sprintName && (
                  <span className="text-xs font-medium text-purple-500 bg-purple-50 px-2.5 py-1 rounded-full">
                    {board.sprintName}
                  </span>
                )}

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    {board.cards.length} kart
                  </span>
                  <span className="text-xs text-gray-400">
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
