import { useEffect, useState } from 'react'
import api from '../../api'

interface Discipline {
  id: string
  name: string
  description?: string
  teacherId?: string
  createdAt?: string
}

type ModalMode = 'create' | 'edit' | 'delete' | null

export default function AdminDisciplinas() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [loading, setLoading]         = useState(true)
  const [modal, setModal]             = useState<ModalMode>(null)
  const [selected, setSelected]       = useState<Discipline | null>(null)
  const [saving, setSaving]           = useState(false)
  const [toast, setToast]             = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const [createForm, setCreateForm] = useState({ name: '', description: '', teacherId: '' })
  const [editForm, setEditForm]     = useState({ name: '', description: '', teacherId: '' })

  const load = () => {
    setLoading(true)
    api.get('/v1/disciplines')
      .then((r) => setDisciplines(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const openEdit = (d: Discipline) => {
    setSelected(d)
    setEditForm({ name: d.name, description: d.description || '', teacherId: d.teacherId || '' })
    setModal('edit')
  }

  const openDelete = (d: Discipline) => {
    setSelected(d)
    setModal('delete')
  }

  const handleCreate = async () => {
    if (!createForm.name || !createForm.teacherId) return
    setSaving(true)
    try {
      await api.post('/v1/admin/disciplines', createForm)
      showToast('Disciplina criada com sucesso!', 'ok')
      setModal(null)
      setCreateForm({ name: '', description: '', teacherId: '' })
      load()
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao criar disciplina.', 'err')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!selected || !editForm.name) return
    setSaving(true)
    try {
      await api.put(`/v1/admin/disciplines/${selected.id}`, editForm)
      showToast('Disciplina atualizada!', 'ok')
      setModal(null)
      load()
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao atualizar.', 'err')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await api.delete(`/v1/admin/disciplines/${selected.id}`)
      showToast('Disciplina deletada com sucesso.', 'ok')
      setModal(null)
      setSelected(null)
      load()
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao deletar.', 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white">Gestão de disciplinas</h1>
          <p className="text-slate-muted text-sm mt-1">Crie, edite e remova disciplinas do sistema</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold text-sm transition-all whitespace-nowrap"
        >
          + Nova disciplina
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-muted">
          <div className="w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          Carregando disciplinas...
        </div>
      ) : disciplines.length === 0 ? (
        <div className="text-center py-20 text-slate-muted">
          <div className="text-5xl mb-4">🏫</div>
          <p>Nenhuma disciplina cadastrada.</p>
        </div>
      ) : (
        <div className="bg-ink-900 border border-ink-700 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-ink-700">
            <span className="text-sm text-slate-muted">{disciplines.length} disciplina(s)</span>
          </div>
          <ul className="divide-y divide-ink-800">
            {disciplines.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-ink-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gold-500/15 border border-gold-500/25 flex items-center justify-center text-sm flex-shrink-0">
                    📖
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{d.name}</p>
                    {d.description && (
                      <p className="text-xs text-slate-muted truncate">{d.description}</p>
                    )}
                    {d.teacherId && (
                      <p className="text-xs text-ink-500 font-mono mt-0.5">Professor: {d.teacherId.slice(0, 10)}…</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(d)}
                    className="px-3 py-1.5 rounded-lg border border-ink-600 text-xs text-slate-muted hover:border-blue-500/40 hover:text-blue-400 transition-all"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => openDelete(d)}
                    className="px-3 py-1.5 rounded-lg border border-ink-600 text-xs text-slate-muted hover:border-red-500/40 hover:text-red-400 transition-all"
                  >
                    Deletar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal: Criar */}
      {modal === 'create' && (
        <ModalWrapper title="Nova disciplina" onClose={() => setModal(null)}>
          <FormField label="Nome *">
            <TextInput value={createForm.name} onChange={(v) => setCreateForm({ ...createForm, name: v })} placeholder="Ex: Engenharia de Software" />
          </FormField>
          <FormField label="Descrição">
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="Descreva a ementa..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-600 text-white text-sm placeholder-ink-500 focus:outline-none focus:border-gold-500/60 transition-all resize-none"
            />
          </FormField>
          <FormField label="UID do Professor *">
            <TextInput value={createForm.teacherId} onChange={(v) => setCreateForm({ ...createForm, teacherId: v })} placeholder="UID do Firebase" mono />
          </FormField>
          <ModalActions
            onCancel={() => setModal(null)}
            onConfirm={handleCreate}
            saving={saving}
            disabled={!createForm.name || !createForm.teacherId}
            confirmLabel="Criar disciplina"
          />
        </ModalWrapper>
      )}

      {/* Modal: Editar */}
      {modal === 'edit' && selected && (
        <ModalWrapper title={`Editar: ${selected.name}`} onClose={() => setModal(null)}>
          <FormField label="Nome *">
            <TextInput value={editForm.name} onChange={(v) => setEditForm({ ...editForm, name: v })} placeholder="Nome da disciplina" />
          </FormField>
          <FormField label="Descrição">
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-600 text-white text-sm placeholder-ink-500 focus:outline-none focus:border-gold-500/60 transition-all resize-none"
            />
          </FormField>
          <FormField label="UID do Professor">
            <TextInput value={editForm.teacherId} onChange={(v) => setEditForm({ ...editForm, teacherId: v })} placeholder="UID do professor" mono />
          </FormField>
          <ModalActions
            onCancel={() => setModal(null)}
            onConfirm={handleEdit}
            saving={saving}
            disabled={!editForm.name}
            confirmLabel="Salvar alterações"
            confirmColor="bg-blue-500 hover:bg-blue-400 text-white"
          />
        </ModalWrapper>
      )}

      {/* Modal: Deletar */}
      {modal === 'delete' && selected && (
        <ModalWrapper title="Deletar disciplina" onClose={() => setModal(null)}>
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
            ⚠️ Tem certeza que deseja deletar permanentemente <strong className="text-red-300">"{selected.name}"</strong>? Esta ação não pode ser desfeita.
          </div>
          <ModalActions
            onCancel={() => setModal(null)}
            onConfirm={handleDelete}
            saving={saving}
            disabled={false}
            confirmLabel="Confirmar exclusão"
            confirmColor="bg-red-500 hover:bg-red-400 text-white"
          />
        </ModalWrapper>
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

function ModalWrapper({ title, onClose, children }: any) {
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

function FormField({ label, children }: any) {
  return (
    <div>
      <label className="block text-xs text-slate-muted mb-1.5 tracking-wide uppercase">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text', mono = false }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; mono?: boolean }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-600 text-white text-sm placeholder-ink-500 focus:outline-none focus:border-gold-500/60 transition-all ${mono ? 'font-mono' : ''}`}
    />
  )
}

function ModalActions({ onCancel, onConfirm, saving, disabled, confirmLabel, confirmColor = 'bg-gold-500 hover:bg-gold-400 text-ink-950' }: any) {
  return (
    <div className="flex gap-3 pt-2">
      <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-ink-600 text-slate-muted hover:text-white hover:border-ink-500 text-sm transition-all">
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        disabled={saving || disabled}
        className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${confirmColor}`}
      >
        {saving ? 'Salvando...' : confirmLabel}
      </button>
    </div>
  )
}
