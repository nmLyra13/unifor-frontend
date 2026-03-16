import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function SetupProfile() {
  const { user, saveProfile } = useAuth()
  const navigate = useNavigate()

  const [name, setName]     = useState(user?.displayName || '')
  const [role, setRole]     = useState<'aluno' | 'professor'>('aluno')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Por favor, informe seu nome.'); return }
    setLoading(true)
    setError('')
    try {
      await saveProfile(name.trim(), role)
      if (role === 'professor') navigate('/professor/disciplinas')
      else navigate('/aluno/disciplinas')
    } catch {
      setError('Erro ao salvar perfil. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-6 font-body">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <span className="font-display text-4xl font-semibold text-white">
            Uni<span className="text-gold-400">Project</span>
          </span>
          <p className="text-slate-muted text-sm mt-2">Configure seu perfil para continuar</p>
        </div>

        <div className="bg-ink-900 border border-ink-700 rounded-2xl p-8">
          <h2 className="font-display text-2xl font-semibold text-white mb-6">
            Quase lá! ✨
          </h2>

          <div className="mb-6">
            <label className="block text-xs text-slate-muted mb-1.5 tracking-wide uppercase">
              Seu nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Maria Fernanda Silva"
              className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-600 text-white text-sm placeholder-ink-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-all"
            />
          </div>

          <div className="mb-8">
            <label className="block text-xs text-slate-muted mb-3 tracking-wide uppercase">
              Você é...
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'aluno', icon: '🎓', label: 'Aluno', desc: 'Matricule-se em disciplinas e acompanhe suas notas' },
                { value: 'professor', icon: '📖', label: 'Professor', desc: 'Crie disciplinas e gerencie suas turmas' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRole(opt.value as any)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    role === opt.value
                      ? 'border-gold-500 bg-gold-500/10'
                      : 'border-ink-600 bg-ink-800 hover:border-ink-500'
                  }`}
                >
                  <div className="text-2xl mb-2">{opt.icon}</div>
                  <div className={`text-sm font-semibold mb-1 ${role === opt.value ? 'text-gold-400' : 'text-white'}`}>
                    {opt.label}
                  </div>
                  <p className="text-xs text-slate-muted leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold text-sm transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Concluir cadastro'}
          </button>
        </div>
      </div>
    </div>
  )
}
