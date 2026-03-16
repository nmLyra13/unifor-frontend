import { useState } from 'react'
import api from '../../api'

interface UserForm {
  email: string
  password: string
  name: string
  role: 'aluno' | 'professor' | 'admin'
}

interface UpdateForm {
  uid: string
  name: string
  email: string
  role: 'aluno' | 'professor' | 'admin'
}

const ROLE_LABELS: Record<string, string> = {
  aluno: 'Aluno',
  professor: 'Professor',
  admin: 'Administrador',
}

const ROLE_COLORS: Record<string, string> = {
  aluno:     'bg-blue-500/15 text-blue-400 border-blue-500/25',
  professor: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  admin:     'bg-gold-500/15 text-gold-400 border-gold-500/25',
}

type ModalMode = 'create' | 'update' | 'delete' | null

export default function AdminUsuarios() {
  const [modal, setModal]       = useState<ModalMode>(null)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const [createForm, setCreateForm] = useState<UserForm>({
    email: '', password: '', name: '', role: 'aluno'
  })

  const [updateForm, setUpdateForm] = useState<UpdateForm>({
    uid: '', name: '', email: '', role: 'aluno'
  })

  const [deleteUid, setDeleteUid] = useState('')
  const [lastCreated, setLastCreated] = useState<any>(null)

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleCreate = async () => {
    if (!createForm.email || !createForm.name) return
    setSaving(true)
    try {
      const res = await api.post('/v1/admin/users', createForm)
      setLastCreated(res.data)
      showToast(`Usuário ${createForm.email} criado como ${ROLE_LABELS[createForm.role]}!`, 'ok')
      setModal(null)
      setCreateForm({ email: '', password: '', name: '', role: 'aluno' })
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao criar usuário.', 'err')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!updateForm.uid || !updateForm.name) return
    setSaving(true)
    try {
      await api.put('/v1/admin/users', updateForm)
      showToast(`Usuário atualizado com papel de ${ROLE_LABELS[updateForm.role]}!`, 'ok')
      setModal(null)
      setUpdateForm({ uid: '', name: '', email: '', role: 'aluno' })
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao atualizar usuário.', 'err')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteUid.trim()) return
    setSaving(true)
    try {
      await api.delete(`/v1/admin/users/${deleteUid}`)
      showToast('Registro do usuário deletado com sucesso.', 'ok')
      setModal(null)
      setDeleteUid('')
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao deletar usuário.', 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-white">Gestão de usuários</h1>
        <p className="text-slate-muted text-sm mt-1">Crie, atualize e remova usuários do sistema</p>
      </div>

      {/* Action cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <ActionCard
          icon="➕"
          title="Criar usuário"
          desc="Registra um novo usuário (aluno, professor ou admin) com ou sem senha."
          btnLabel="Criar"
          btnColor="bg-gold-500 hover:bg-gold-400 text-ink-950"
          onClick={() => setModal('create')}
        />
        <ActionCard
          icon="✏️"
          title="Atualizar usuário"
          desc="Altere o nome, e-mail ou papel (role) de um usuário existente pelo UID."
          btnLabel="Atualizar"
          btnColor="bg-blue-500/80 hover:bg-blue-500 text-white"
          onClick={() => setModal('update')}
        />
        <ActionCard
          icon="🗑️"
          title="Remover usuário"
          desc="Deleta os dados do usuário no Firestore pelo UID (não remove o Auth)."
          btnLabel="Remover"
          btnColor="bg-red-500/70 hover:bg-red-500 text-white"
          onClick={() => setModal('delete')}
        />
      </div>

      {/* Last created info */}
      {lastCreated && (
        <div className="bg-ink-900 border border-ink-700 rounded-xl p-5">
          <p className="text-xs text-slate-muted mb-3 tracking-wide uppercase">Último usuário criado / atualizado</p>
          <div className="flex flex-wrap gap-4">
            <Info label="UID" value={lastCreated.uid} mono />
            <Info label="E-mail" value={lastCreated.email} />
            <Info label="Role">
              <span className={`text-xs px-2.5 py-1 rounded-full border ${ROLE_COLORS[lastCreated.role]}`}>
                {ROLE_LABELS[lastCreated.role]}
              </span>
            </Info>
          </div>
        </div>
      )}

      {/* Modal: Criar */}
      {modal === 'create' && (
        <Modal title="Criar usuário" onClose={() => setModal(null)}>
          <Field label="Nome *">
            <Input value={createForm.name} onChange={(v) => setCreateForm({ ...createForm, name: v })} placeholder="Nome completo" />
          </Field>
          <Field label="E-mail *">
            <Input type="email" value={createForm.email} onChange={(v) => setCreateForm({ ...createForm, email: v })} placeholder="email@exemplo.com" />
          </Field>
          <Field label="Senha (opcional — apenas para criar no Firebase Auth)">
            <Input type="password" value={createForm.password} onChange={(v) => setCreateForm({ ...createForm, password: v })} placeholder="Min. 6 caracteres" />
          </Field>
          <Field label="Papel">
            <RoleSelect value={createForm.role} onChange={(v) => setCreateForm({ ...createForm, role: v as any })} />
          </Field>
          <ModalActions
            onCancel={() => setModal(null)}
            onConfirm={handleCreate}
            saving={saving}
            disabled={!createForm.email || !createForm.name}
            confirmLabel="Criar usuário"
          />
        </Modal>
      )}

      {/* Modal: Atualizar */}
      {modal === 'update' && (
        <Modal title="Atualizar usuário" onClose={() => setModal(null)}>
          <Field label="UID do usuário *">
            <Input value={updateForm.uid} onChange={(v) => setUpdateForm({ ...updateForm, uid: v })} placeholder="Ex: xyz123abc" mono />
          </Field>
          <Field label="Nome *">
            <Input value={updateForm.name} onChange={(v) => setUpdateForm({ ...updateForm, name: v })} placeholder="Nome completo" />
          </Field>
          <Field label="E-mail (opcional)">
            <Input type="email" value={updateForm.email} onChange={(v) => setUpdateForm({ ...updateForm, email: v })} placeholder="email@exemplo.com" />
          </Field>
          <Field label="Papel">
            <RoleSelect value={updateForm.role} onChange={(v) => setUpdateForm({ ...updateForm, role: v as any })} />
          </Field>
          <ModalActions
            onCancel={() => setModal(null)}
            onConfirm={handleUpdate}
            saving={saving}
            disabled={!updateForm.uid || !updateForm.name}
            confirmLabel="Salvar alterações"
            confirmColor="bg-blue-500 hover:bg-blue-400"
          />
        </Modal>
      )}

      {/* Modal: Deletar */}
      {modal === 'delete' && (
        <Modal title="Remover usuário" onClose={() => setModal(null)}>
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-sm mb-4">
            ⚠️ Esta ação remove os dados do Firestore. O acesso via Firebase Auth permanece.
          </div>
          <Field label="UID do usuário *">
            <Input value={deleteUid} onChange={setDeleteUid} placeholder="Ex: xyz123abc" mono />
          </Field>
          <ModalActions
            onCancel={() => setModal(null)}
            onConfirm={handleDelete}
            saving={saving}
            disabled={!deleteUid.trim()}
            confirmLabel="Confirmar remoção"
            confirmColor="bg-red-500 hover:bg-red-400"
          />
        </Modal>
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

// ── Sub-components ──────────────────────────────────────────────────────────

function ActionCard({ icon, title, desc, btnLabel, btnColor, onClick }: any) {
  return (
    <div className="bg-ink-900 border border-ink-700 rounded-xl p-5 flex flex-col gap-4">
      <div className="text-2xl">{icon}</div>
      <div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <p className="text-slate-muted text-xs mt-1 leading-relaxed">{desc}</p>
      </div>
      <button
        onClick={onClick}
        className={`mt-auto w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${btnColor}`}
      >
        {btnLabel}
      </button>
    </div>
  )
}

function Modal({ title, onClose, children }: any) {
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

function Field({ label, children }: any) {
  return (
    <div>
      <label className="block text-xs text-slate-muted mb-1.5 tracking-wide uppercase">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', mono = false }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; mono?: boolean }) {
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

function RoleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-600 text-white text-sm focus:outline-none focus:border-gold-500/60 transition-all"
    >
      <option value="aluno">Aluno</option>
      <option value="professor">Professor</option>
      <option value="admin">Administrador</option>
    </select>
  )
}

function ModalActions({ onCancel, onConfirm, saving, disabled, confirmLabel, confirmColor = 'bg-gold-500 hover:bg-gold-400 text-ink-950' }: any) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        onClick={onCancel}
        className="flex-1 py-2.5 rounded-xl border border-ink-600 text-slate-muted hover:text-white hover:border-ink-500 text-sm transition-all"
      >
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        disabled={saving || disabled}
        className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${confirmColor}`}
      >
        {saving ? 'Processando...' : confirmLabel}
      </button>
    </div>
  )
}

function Info({ label, value, mono = false, children }: any) {
  return (
    <div>
      <p className="text-xs text-slate-muted mb-1">{label}</p>
      {children ?? (
        <p className={`text-sm text-white ${mono ? 'font-mono text-xs bg-ink-800 px-2 py-1 rounded' : ''}`}>{value}</p>
      )}
    </div>
  )
}
