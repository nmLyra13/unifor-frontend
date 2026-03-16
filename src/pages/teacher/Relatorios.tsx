import { useEffect, useState } from 'react'
import api from '../../api'

interface Student    { id: string; name: string }
interface Discipline { id: string; name: string; description?: string; teacherId?: string }
interface Grade      { id: string; studentId: string; disciplineId: string; grade: number; createdAt?: string }
interface Enrollment { id: string; studentId: string; disciplineId: string; enrolledAt?: string }

type Tab = 'alunos' | 'disciplinas'

function gradeColor(g: number) {
  if (g >= 7) return 'text-green-400'
  if (g >= 5) return 'text-yellow-400'
  return 'text-red-400'
}
function gradeStatus(g: number): { label: string; cls: string } {
  if (g >= 7) return { label: 'Aprovado',    cls: 'bg-green-500/15 text-green-400 border-green-500/25' }
  if (g >= 5) return { label: 'Recuperação', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' }
  return         { label: 'Reprovado',   cls: 'bg-red-500/15 text-red-400 border-red-500/25' }
}

export default function Relatorios() {
  const [tab, setTab]               = useState<Tab>('alunos')
  const [students, setStudents]     = useState<Student[]>([])
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [grades, setGrades]         = useState<Grade[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    Promise.allSettled([
      api.get('/v1/teachers/students'),
      api.get('/v1/disciplines'),
      api.get('/v1/teachers/grades').catch(() => ({ data: [] })),
      api.get('/v1/teachers/enrollments').catch(() => ({ data: [] })),
    ]).then(([s, d, g, e]) => {
      if (s.status === 'fulfilled') setStudents(s.value.data || [])
      if (d.status === 'fulfilled') setDisciplines(d.value.data || [])
      if (g.status === 'fulfilled') setGrades((g.value as any).data || [])
      if (e.status === 'fulfilled') setEnrollments((e.value as any).data || [])
    }).finally(() => setLoading(false))
  }, [])

  // ── Relatório por aluno ───────────────────────────────────────────────────
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const gradesForStudent = (studentId: string) =>
    grades.filter((g) => g.studentId === studentId)

  const avgForStudent = (studentId: string) => {
    const gs = gradesForStudent(studentId)
    if (!gs.length) return null
    return (gs.reduce((s, g) => s + g.grade, 0) / gs.length).toFixed(1)
  }

  const disciplineNameById = (id: string) =>
    disciplines.find((d) => d.id === id)?.name || id.slice(0, 8) + '…'

  // ── Relatório por disciplina ──────────────────────────────────────────────
  const filteredDisciplines = disciplines.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  const enrollmentsForDiscipline = (disciplineId: string) =>
    enrollments.filter((e) => e.disciplineId === disciplineId)

  const gradesForDiscipline = (disciplineId: string) =>
    grades.filter((g) => g.disciplineId === disciplineId)

  const avgForDiscipline = (disciplineId: string) => {
    const gs = gradesForDiscipline(disciplineId)
    if (!gs.length) return null
    return (gs.reduce((s, g) => s + g.grade, 0) / gs.length).toFixed(1)
  }

  const studentNameById = (id: string) =>
    students.find((s) => s.id === id)?.name || id.slice(0, 8) + '…'

  const toggle = (id: string) => setExpandedId(expandedId === id ? null : id)

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-slate-muted mt-8">
        <div className="w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
        Carregando relatórios...
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-white">Relatórios</h1>
        <p className="text-slate-muted text-sm mt-1">Visão geral de desempenho por aluno e por disciplina</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-ink-800 rounded-xl mb-6 w-fit">
        {([['alunos', '👥', 'Por aluno'], ['disciplinas', '📖', 'Por disciplina']] as const).map(([key, icon, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setSearch(''); setExpandedId(null) }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              tab === key
                ? 'bg-gold-500 text-ink-950 font-semibold'
                : 'text-slate-muted hover:text-white'
            }`}
          >
            <span>{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* Busca */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setExpandedId(null) }}
          placeholder={tab === 'alunos' ? 'Buscar aluno…' : 'Buscar disciplina…'}
          className="w-full max-w-sm px-4 py-2.5 rounded-lg bg-ink-800 border border-ink-700 text-white text-sm placeholder-ink-500 focus:outline-none focus:border-gold-500/50 transition-all"
        />
      </div>

      {/* ══ ABA: POR ALUNO ══════════════════════════════════════════════════ */}
      {tab === 'alunos' && (
        <>
          {/* Resumo geral */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <SummaryCard icon="👥" label="Total de alunos"   value={String(students.length)} />
            <SummaryCard icon="📊" label="Notas lançadas"    value={String(grades.length)} />
            <SummaryCard icon="✅" label="Aprovados"
              value={String(grades.filter(g => g.grade >= 7).length)}
              highlight="green"
            />
            <SummaryCard icon="❌" label="Reprovados"
              value={String(grades.filter(g => g.grade < 5).length)}
              highlight="red"
            />
          </div>

          {filteredStudents.length === 0 ? (
            <Empty msg="Nenhum aluno encontrado." />
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((s) => {
                const studentGrades = gradesForStudent(s.id)
                const avg = avgForStudent(s.id)
                const open = expandedId === s.id

                return (
                  <div key={s.id} className="bg-ink-900 border border-ink-700 rounded-xl overflow-hidden">
                    {/* Cabeçalho do card */}
                    <button
                      onClick={() => toggle(s.id)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-ink-800/40 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gold-500/15 border border-gold-500/25 flex items-center justify-center text-sm font-semibold text-gold-400 flex-shrink-0">
                          {s.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{s.name}</p>
                          <p className="text-xs text-slate-muted">
                            {studentGrades.length} nota(s) lançada(s)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {avg !== null && (
                          <div className="text-right">
                            <p className={`font-display text-xl font-semibold ${gradeColor(parseFloat(avg))}`}>{avg}</p>
                            <p className="text-xs text-slate-muted">média</p>
                          </div>
                        )}
                        {studentGrades.length === 0 && (
                          <span className="text-xs text-ink-500">Sem notas</span>
                        )}
                        <span className={`text-slate-muted text-sm transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
                      </div>
                    </button>

                    {/* Notas expandidas */}
                    {open && (
                      <div className="border-t border-ink-700 px-5 py-4">
                        {studentGrades.length === 0 ? (
                          <p className="text-sm text-slate-muted italic">Nenhuma nota lançada para este aluno.</p>
                        ) : (
                          <table className="w-full">
                            <thead>
                              <tr className="text-left">
                                <th className="text-xs text-slate-muted pb-3 uppercase tracking-wide font-medium">Disciplina</th>
                                <th className="text-center text-xs text-slate-muted pb-3 uppercase tracking-wide font-medium">Nota</th>
                                <th className="text-center text-xs text-slate-muted pb-3 uppercase tracking-wide font-medium hidden sm:table-cell">Situação</th>
                                <th className="text-right text-xs text-slate-muted pb-3 uppercase tracking-wide font-medium hidden md:table-cell">Data</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-ink-800">
                              {studentGrades.map((g) => {
                                const status = gradeStatus(g.grade)
                                return (
                                  <tr key={g.id}>
                                    <td className="py-2.5 text-sm text-white">{disciplineNameById(g.disciplineId)}</td>
                                    <td className="py-2.5 text-center">
                                      <span className={`font-display text-lg font-semibold ${gradeColor(g.grade)}`}>{g.grade.toFixed(1)}</span>
                                    </td>
                                    <td className="py-2.5 text-center hidden sm:table-cell">
                                      <span className={`text-xs px-2.5 py-1 rounded-full border ${status.cls}`}>{status.label}</span>
                                    </td>
                                    <td className="py-2.5 text-right text-xs text-slate-muted hidden md:table-cell">
                                      {g.createdAt ? new Date(g.createdAt).toLocaleDateString('pt-BR') : '—'}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ══ ABA: POR DISCIPLINA ═════════════════════════════════════════════ */}
      {tab === 'disciplinas' && (
        <>
          {/* Resumo geral */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <SummaryCard icon="🏫" label="Total de disciplinas" value={String(disciplines.length)} />
            <SummaryCard icon="📋" label="Matrículas"           value={String(enrollments.length)} />
            <SummaryCard icon="📊" label="Notas lançadas"       value={String(grades.length)} />
          </div>

          {filteredDisciplines.length === 0 ? (
            <Empty msg="Nenhuma disciplina encontrada." />
          ) : (
            <div className="space-y-3">
              {filteredDisciplines.map((d) => {
                const discEnrollments = enrollmentsForDiscipline(d.id)
                const discGrades      = gradesForDiscipline(d.id)
                const avg             = avgForDiscipline(d.id)
                const open            = expandedId === d.id

                return (
                  <div key={d.id} className="bg-ink-900 border border-ink-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggle(d.id)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-ink-800/40 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gold-500/15 border border-gold-500/25 flex items-center justify-center text-lg flex-shrink-0">
                          📖
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{d.name}</p>
                          <p className="text-xs text-slate-muted">
                            {discEnrollments.length} matriculado(s) · {discGrades.length} nota(s)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {avg !== null && (
                          <div className="text-right">
                            <p className={`font-display text-xl font-semibold ${gradeColor(parseFloat(avg))}`}>{avg}</p>
                            <p className="text-xs text-slate-muted">média turma</p>
                          </div>
                        )}
                        <span className={`text-slate-muted text-sm transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
                      </div>
                    </button>

                    {open && (
                      <div className="border-t border-ink-700 px-5 py-4">
                        {discGrades.length === 0 ? (
                          <p className="text-sm text-slate-muted italic">Nenhuma nota lançada nesta disciplina.</p>
                        ) : (
                          <table className="w-full">
                            <thead>
                              <tr className="text-left">
                                <th className="text-xs text-slate-muted pb-3 uppercase tracking-wide font-medium">Aluno</th>
                                <th className="text-center text-xs text-slate-muted pb-3 uppercase tracking-wide font-medium">Nota</th>
                                <th className="text-center text-xs text-slate-muted pb-3 uppercase tracking-wide font-medium hidden sm:table-cell">Situação</th>
                                <th className="text-right text-xs text-slate-muted pb-3 uppercase tracking-wide font-medium hidden md:table-cell">Data</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-ink-800">
                              {discGrades.map((g) => {
                                const status = gradeStatus(g.grade)
                                return (
                                  <tr key={g.id}>
                                    <td className="py-2.5 text-sm text-white">{studentNameById(g.studentId)}</td>
                                    <td className="py-2.5 text-center">
                                      <span className={`font-display text-lg font-semibold ${gradeColor(g.grade)}`}>{g.grade.toFixed(1)}</span>
                                    </td>
                                    <td className="py-2.5 text-center hidden sm:table-cell">
                                      <span className={`text-xs px-2.5 py-1 rounded-full border ${status.cls}`}>{status.label}</span>
                                    </td>
                                    <td className="py-2.5 text-right text-xs text-slate-muted hidden md:table-cell">
                                      {g.createdAt ? new Date(g.createdAt).toLocaleDateString('pt-BR') : '—'}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SummaryCard({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: 'green' | 'red' }) {
  const valueColor = highlight === 'green' ? 'text-green-400' : highlight === 'red' ? 'text-red-400' : 'text-white'
  return (
    <div className="bg-ink-900 border border-ink-700 rounded-xl p-4">
      <div className="text-xl mb-2">{icon}</div>
      <div className={`text-2xl font-display font-semibold ${valueColor}`}>{value}</div>
      <div className="text-xs text-slate-muted mt-0.5">{label}</div>
    </div>
  )
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="text-center py-16 text-slate-muted">
      <div className="text-4xl mb-3">🔍</div>
      <p>{msg}</p>
    </div>
  )
}
