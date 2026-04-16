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

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-600">RetroBoard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">Merhaba, {fullName}</span>
          <button onClick={logout} className="text-sm text-slate-400 hover:text-red-500 transition">
            Çıkış
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Boardlarım</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + Yeni Board
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm p-5 mb-6 flex gap-3 items-end">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-slate-500">Board Adı</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Q2 Sprint 3 Retro"
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-slate-500">Sprint Adı</label>
              <input
                value={sprintName}
                onChange={e => setSprintName(e.target.value)}
                placeholder="Sprint 3"
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
            >
              Oluştur
            </button>
          </form>
        )}

        {boards.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-4xl mb-3">📋</p>
            <p>Henüz bir board yok. İlk boardunu oluştur!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map(board => (
              <div
                key={board.id}
                className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition group"
                onClick={() => navigate(`/board/${board.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition">
                      {board.name}
                    </h3>
                    {board.sprintName && (
                      <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {board.sprintName}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(board.id) }}
                    className="text-slate-300 hover:text-red-400 transition text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  {board.cards.length} kart · {new Date(board.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
