import { useEffect, useState } from 'react'
import api from '../../api'

interface Discipline {
  id: string
  name: string
  description?: string
  teacherId?: string
  createdAt?: string
}

export default function StudentDisciplinas() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [enrolling, setEnrolling]     = useState<string | null>(null)
  const [enrolled, setEnrolled]       = useState<Set<string>>(new Set())
  const [loading, setLoading]         = useState(true)
  const [toast, setToast]             = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  useEffect(() => {
    api.get('/v1/disciplines')
      .then((r) => setDisciplines(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const enroll = async (id: string) => {
    setEnrolling(id)
    try {
      await api.post('/v1/students/enroll', { disciplineId: id })
      setEnrolled((prev) => new Set(prev).add(id))
      showToast('Matrícula realizada com sucesso! 🎉', 'ok')
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao matricular.', 'err')
    } finally {
      setEnrolling(null)
    }
  }

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-white">Disciplinas disponíveis</h1>
        <p className="text-slate-muted text-sm mt-1">Escolha as disciplinas para se matricular</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-muted">
          <div className="w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          Carregando disciplinas...
        </div>
      ) : disciplines.length === 0 ? (
        <div className="text-center py-20 text-slate-muted">
          <div className="text-5xl mb-4">📚</div>
          <p>Nenhuma disciplina disponível no momento.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {disciplines.map((d) => (
            <div
              key={d.id}
              className="bg-ink-900 border border-ink-700 rounded-xl p-5 flex flex-col gap-4 hover:border-ink-600 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-lg bg-gold-500/15 border border-gold-500/25 flex items-center justify-center text-lg flex-shrink-0">
                  📖
                </div>
                {enrolled.has(d.id) && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25">
                    Matriculado
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm">{d.name}</h3>
                {d.description && (
                  <p className="text-slate-muted text-xs mt-1 leading-relaxed line-clamp-2">
                    {d.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => enroll(d.id)}
                disabled={enrolled.has(d.id) || enrolling === d.id}
                className={`mt-auto w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  enrolled.has(d.id)
                    ? 'bg-ink-700 text-slate-muted cursor-default'
                    : 'bg-gold-500 hover:bg-gold-400 text-ink-950 disabled:opacity-60'
                }`}
              >
                {enrolling === d.id ? 'Matriculando...' : enrolled.has(d.id) ? '✓ Matriculado' : 'Matricular-se'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl border text-sm shadow-xl transition-all duration-300 ${
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
