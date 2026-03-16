import { useEffect, useState } from 'react'
import api from '../../api'

interface Student {
  id: string
  name: string
}

interface Discipline {
  id: string
  name: string
}

type ModalMode = 'grade' | 'create' | null

export default function TeacherAlunos() {
  const [students, setStudents]       = useState<Student[]>([])
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [loading, setLoading]         = useState(true)
  const [modal, setModal]             = useState<ModalMode>(null)
  const [saving, setSaving]           = useState(false)
  const [toast, setToast]             = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const [gradeForm, setGradeForm]   = useState({ studentId: '', disciplineId: '', grade: '' })
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' })

  const load = () => {
    Promise.all([
      api.get('/v1/teachers/students'),
      api.get('/v1/disciplines'),
    ])
      .then(([s, d]) => {
        setStudents(s.data)
        setDisciplines(d.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleLancarNota = async () => {
    const grade = parseFloat(gradeForm.grade)
    if (!gradeForm.studentId || !gradeForm.disciplineId || isNaN(grade)) return
    setSaving(true)
    try {
      await api.post('/v1/teachers/grades', {
        studentId: gradeForm.studentId,
        disciplineId: gradeForm.disciplineId,
        grade,
      })
      showToast('Nota lançada com sucesso! ✅', 'ok')
      setModal(null)
      setGradeForm({ studentId: '', disciplineId: '', grade: '' })
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao lançar nota.', 'err')
    } finally {
      setSaving(false)
    }
  }

  const handleCadastrarAluno = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) return
    setSaving(true)
    try {
      await api.post('/v1/admin/users', {
        name:     createForm.name,
        email:    createForm.email,
        password: createForm.password,
        role:     'aluno',
      })
      showToast(`Aluno ${createForm.name} cadastrado com sucesso!`, 'ok')
      setModal(null)
      setCreateForm({ name: '', email: '', password: '' })
      load()
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao cadastrar aluno.', 'err')
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
          <h1 className="font-display text-3xl font-semibold text-white">Base de alunos</h1>
          <p className="text-slate-muted text-sm mt-1">Cadastre alunos e lance notas finais</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={() => setModal('create')}
            className="px-4 py-2.5 rounded-xl border border-gold-500/40 text-gold-400 hover:bg-gold-500/10 font-semibold text-sm transition-all whitespace-nowrap"
          >
            + Cadastrar aluno
          </button>
          <button
            onClick={() => setModal('grade')}
            className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold text-sm transition-all whitespace-nowrap"
          >
            + Lançar nota
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-muted">
          <div className="w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          Carregando alunos...
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 text-slate-muted">
          <div className="text-5xl mb-4">👥</div>
          <p>Nenhum aluno cadastrado ainda.</p>
          <button
            onClick={() => setModal('create')}
            className="mt-4 px-4 py-2 rounded-xl bg-gold-500/15 text-gold-400 border border-gold-500/30 text-sm hover:bg-gold-500/25 transition-all"
          >
            Cadastrar primeiro aluno
          </button>
        </div>
      ) : (
        <div className="bg-ink-900 border border-ink-700 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-700">
            <span className="text-sm text-slate-muted">{students.length} aluno(s) cadastrado(s)</span>
          </div>
          <ul className="divide-y divide-ink-800">
            {students.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-5 py-4 hover:bg-ink-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gold-500/15 border border-gold-500/25 flex items-center justify-center text-sm font-semibold text-gold-400">
                    {s.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-ink-500 font-mono">{s.id.slice(0, 12)}…</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setGradeForm((f) => ({ ...f, studentId: s.id }))
                    setModal('grade')
                  }}
                  className="px-3 py-1.5 rounded-lg border border-ink-600 text-xs text-slate-muted hover:border-gold-500/40 hover:text-gold-400 transition-all"
                >
                  Lançar nota
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal: Lançar Nota */}
      {modal === 'grade' && (
        <ModalWrap title="Lançar nota" onClose={() => setModal(null)}>
          <Field label="Aluno *">
            <SelectInput
              value={gradeForm.studentId}
              onChange={(v) => setGradeForm({ ...gradeForm, studentId: v })}
              options={students.map((s) => ({ value: s.id, label: s.name }))}
              placeholder="Selecione um aluno…"
            />
          </Field>
          <Field label="Disciplina *">
            <SelectInput
              value={gradeForm.disciplineId}
              onChange={(v) => setGradeForm({ ...gradeForm, disciplineId: v })}
              options={disciplines.map((d) => ({ value: d.id, label: d.name }))}
              placeholder="Selecione uma disciplina…"
            />
          </Field>
          <Field label="Nota final (0–10) *">
            <TextInput
              type="number"
              value={gradeForm.grade}
              onChange={(v) => setGradeForm({ ...gradeForm, grade: v })}
              placeholder="Ex: 8.5"
            />
          </Field>

          {gradeForm.grade !== '' && !isNaN(parseFloat(gradeForm.grade)) && (
            <div className={`px-4 py-2.5 rounded-lg text-sm text-center border ${
              parseFloat(gradeForm.grade) >= 7
                ? 'bg-green-500/10 border-green-500/25 text-green-400'
                : parseFloat(gradeForm.grade) >= 5
                ? 'bg-yellow-500/10 border-yellow-500/25 text-yellow-400'
                : 'bg-red-500/10 border-red-500/25 text-red-400'
            }`}>
              {parseFloat(gradeForm.grade) >= 7 ? '✅ Aprovado' : parseFloat(gradeForm.grade) >= 5 ? '⚠️ Recuperação' : '❌ Reprovado'}
            </div>
          )}

          <Actions
            onCancel={() => setModal(null)}
            onConfirm={handleLancarNota}
            saving={saving}
            disabled={!gradeForm.studentId || !gradeForm.disciplineId || gradeForm.grade === ''}
            label="Confirmar"
          />
        </ModalWrap>
      )}

      {/* Modal: Cadastrar Aluno */}
      {modal === 'create' && (
        <ModalWrap title="Cadastrar novo aluno" onClose={() => setModal(null)}>
          <Field label="Nome completo *">
            <TextInput
              value={createForm.name}
              onChange={(v) => setCreateForm({ ...createForm, name: v })}
              placeholder="Ex: João da Silva"
            />
          </Field>
          <Field label="E-mail *">
            <TextInput
              type="email"
              value={createForm.email}
              onChange={(v) => setCreateForm({ ...createForm, email: v })}
              placeholder="aluno@email.com"
            />
          </Field>
          <Field label="Senha inicial *">
            <TextInput
              type="password"
              value={createForm.password}
              onChange={(v) => setCreateForm({ ...createForm, password: v })}
              placeholder="Mín. 6 caracteres"
            />
          </Field>
          <p className="text-xs text-slate-muted">O aluno poderá alterar a senha no primeiro acesso.</p>
          <Actions
            onCancel={() => setModal(null)}
            onConfirm={handleCadastrarAluno}
            saving={saving}
            disabled={!createForm.name || !createForm.email || createForm.password.length < 6}
            label="Cadastrar aluno"
          />
        </ModalWrap>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl border text-sm shadow-xl max-w-sm ${
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

function ModalWrap({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-ink-900 border border-ink-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-muted hover:text-white">✕</button>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-muted mb-1.5 tracking-wide uppercase">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-600 text-white text-sm placeholder-ink-500 focus:outline-none focus:border-gold-500/60 transition-all"
    />
  )
}

function SelectInput({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-600 text-white text-sm focus:outline-none focus:border-gold-500/60 transition-all"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function Actions({ onCancel, onConfirm, saving, disabled, label }: { onCancel: () => void; onConfirm: () => void; saving: boolean; disabled: boolean; label: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-ink-600 text-slate-muted hover:text-white text-sm transition-all">
        Cancelar
      </button>
      <button onClick={onConfirm} disabled={saving || disabled} className="flex-1 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold text-sm transition-all disabled:opacity-50">
        {saving ? 'Salvando...' : label}
      </button>
    </div>
  )
}
