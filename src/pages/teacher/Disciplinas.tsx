import { useEffect, useState } from 'react'
import api from '../../api'

interface Discipline {
  id: string
  name: string
  description?: string
  teacherId?: string
  createdAt?: string
}

export default function TeacherDisciplinas() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [loading, setLoading]         = useState(true)
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState({ name: '', description: '' })
  const [saving, setSaving]           = useState(false)
  const [toast, setToast]             = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const load = () => {
    setLoading(true)
    api.get('/v1/disciplines')
      .then((r) => setDisciplines(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await api.post('/v1/disciplines', form)
      showToast('Disciplina criada com sucesso!', 'ok')
      setShowModal(false)
      setForm({ name: '', description: '' })
      load()
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao criar disciplina.', 'err')
    } finally {
      setSaving(false)
    }
  }

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white">Minhas disciplinas</h1>
          <p className="text-slate-muted text-sm mt-1">Gerencie as disciplinas que você leciona</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold text-sm transition-all whitespace-nowrap"
        >
          + Nova disciplina
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-muted">
          <div className="w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          Carregando...
        </div>
      ) : disciplines.length === 0 ? (
        <div className="text-center py-20 text-slate-muted">
          <div className="text-5xl mb-4">📖</div>
          <p>Você ainda não criou nenhuma disciplina.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {disciplines.map((d) => (
            <div key={d.id} className="bg-ink-900 border border-ink-700 rounded-xl p-5 hover:border-ink-600 transition-all">
              <div className="w-10 h-10 rounded-lg bg-gold-500/15 border border-gold-500/25 flex items-center justify-center text-lg mb-4">
                📖
              </div>
              <h3 className="text-white font-semibold text-sm">{d.name}</h3>
              {d.description && (
                <p className="text-slate-muted text-xs mt-1 leading-relaxed line-clamp-2">{d.description}</p>
              )}
              <p className="text-xs text-ink-500 mt-3">
                ID: <span className="font-mono text-ink-400">{d.id.slice(0, 8)}…</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-ink-900 border border-ink-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-white">Nova disciplina</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-muted hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-muted mb-1.5 tracking-wide uppercase">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Cálculo Diferencial"
                  className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-600 text-white text-sm placeholder-ink-500 focus:outline-none focus:border-gold-500/60 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-muted mb-1.5 tracking-wide uppercase">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descreva a ementa da disciplina..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-600 text-white text-sm placeholder-ink-500 focus:outline-none focus:border-gold-500/60 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-ink-600 text-slate-muted hover:text-white hover:border-ink-500 text-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold text-sm transition-all disabled:opacity-50"
              >
                {saving ? 'Criando...' : 'Criar disciplina'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl border text-sm shadow-xl ${
          toast.type === 'ok'
            ? 'bg-green-900/80 border-green-500/40 text-green-300'
            : 'bg-red-900/80 border-red-500/40 text-red-300'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
