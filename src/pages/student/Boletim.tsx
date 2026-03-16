import { useEffect, useState } from 'react'
import api from '../../api'

interface Grade {
  id: string
  disciplineId: string
  grade: number
  createdAt?: string
}

function gradeColor(g: number) {
  if (g >= 7) return 'text-green-400'
  if (g >= 5) return 'text-yellow-400'
  return 'text-red-400'
}

function gradeStatus(g: number) {
  if (g >= 7) return { label: 'Aprovado', cls: 'bg-green-500/15 text-green-400 border-green-500/25' }
  if (g >= 5) return { label: 'Recuperação', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' }
  return { label: 'Reprovado', cls: 'bg-red-500/15 text-red-400 border-red-500/25' }
}

export default function StudentBoletim() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/v1/students/grades')
      .then((r) => setGrades(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const avg = grades.length
    ? (grades.reduce((s, g) => s + g.grade, 0) / grades.length).toFixed(1)
    : null

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-white">Boletim de notas</h1>
        <p className="text-slate-muted text-sm mt-1">Acompanhe seu desempenho acadêmico</p>
      </div>

      {/* Summary cards */}
      {!loading && grades.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon="📊" label="Média geral" value={avg!} highlight />
          <StatCard icon="✅" label="Aprovações" value={String(grades.filter((g) => g.grade >= 7).length)} />
          <StatCard icon="📚" label="Disciplinas" value={String(grades.length)} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 text-slate-muted">
          <div className="w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          Carregando boletim...
        </div>
      ) : grades.length === 0 ? (
        <div className="text-center py-20 text-slate-muted">
          <div className="text-5xl mb-4">📊</div>
          <p>Nenhuma nota lançada ainda.</p>
          <p className="text-xs mt-1">Matricule-se em disciplinas para receber notas.</p>
        </div>
      ) : (
        <div className="bg-ink-900 border border-ink-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-700">
                <th className="text-left px-5 py-3.5 text-xs text-slate-muted tracking-wide uppercase font-medium">Disciplina</th>
                <th className="text-center px-5 py-3.5 text-xs text-slate-muted tracking-wide uppercase font-medium">Nota</th>
                <th className="text-center px-5 py-3.5 text-xs text-slate-muted tracking-wide uppercase font-medium hidden sm:table-cell">Situação</th>
                <th className="text-right px-5 py-3.5 text-xs text-slate-muted tracking-wide uppercase font-medium hidden md:table-cell">Data</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => {
                const status = gradeStatus(g.grade)
                return (
                  <tr
                    key={g.id}
                    className={`border-b border-ink-800 last:border-0 hover:bg-ink-800/50 transition-colors ${
                      i % 2 === 0 ? '' : 'bg-ink-950/30'
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xs">
                          📖
                        </div>
                        <span className="text-white text-sm font-medium">{g.disciplineId}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-2xl font-display font-semibold ${gradeColor(g.grade)}`}>
                        {g.grade.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center hidden sm:table-cell">
                      <span className={`text-xs px-2.5 py-1 rounded-full border ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right hidden md:table-cell">
                      <span className="text-xs text-slate-muted">
                        {g.createdAt ? new Date(g.createdAt).toLocaleDateString('pt-BR') : '—'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? 'bg-gold-500/10 border-gold-500/30' : 'bg-ink-900 border-ink-700'}`}>
      <div className="text-xl mb-2">{icon}</div>
      <div className={`text-2xl font-display font-semibold ${highlight ? 'text-gold-400' : 'text-white'}`}>{value}</div>
      <div className="text-xs text-slate-muted mt-0.5">{label}</div>
    </div>
  )
}
