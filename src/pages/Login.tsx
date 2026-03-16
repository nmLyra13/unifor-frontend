import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn, signInGoogle, role, profileReady } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab]         = useState<'entrar' | 'cadastrar'>('entrar')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const redirect = (r: string | null, ready: boolean) => {
    if (!ready) { navigate('/setup'); return }
    if (r === 'admin')     navigate('/admin/usuarios')
    else if (r === 'professor') navigate('/professor/disciplinas')
    else navigate('/aluno/disciplinas')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      redirect(role, profileReady)
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signInGoogle()
      redirect(role, profileReady)
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex font-body">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-ink-900 p-16 border-r border-ink-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-600/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gold-500/5 blur-3xl pointer-events-none" />

        <div>
          <span className="font-display text-4xl font-semibold text-white">
            Uni<span className="text-gold-400">Project</span>
          </span>
          <p className="text-slate-muted text-sm mt-2 tracking-widest uppercase font-body">
            Sistema Universitário
          </p>
        </div>

        <div>
          <blockquote className="font-display text-3xl italic text-white/80 leading-relaxed">
            "A educação é a arma mais poderosa que você pode usar para mudar o mundo."
          </blockquote>
          <p className="mt-4 text-slate-muted text-sm">— Nelson Mandela</p>
        </div>

        <div className="flex gap-6 text-sm text-slate-muted">
          <span>📚 Disciplinas</span>
          <span>👥 Alunos</span>
          <span>🎓 Professores</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <span className="font-display text-3xl text-white">
              Uni<span className="text-gold-400">Project</span>
            </span>
          </div>

          <h2 className="font-display text-3xl font-semibold text-white mb-1">
            {tab === 'entrar' ? 'Bem-vindo de volta' : 'Criar conta'}
          </h2>
          <p className="text-slate-muted text-sm mb-8">
            {tab === 'entrar' ? 'Acesse o portal universitário' : 'Registre-se para começar'}
          </p>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-ink-800 rounded-lg mb-8">
            {(['entrar', 'cadastrar'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-2 text-sm rounded-md transition-all duration-200 ${
                  tab === t
                    ? 'bg-gold-500 text-ink-950 font-semibold'
                    : 'text-slate-muted hover:text-white'
                }`}
              >
                {t === 'entrar' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-ink-600 bg-ink-800 text-white text-sm hover:border-gold-500/50 hover:bg-ink-700 transition-all duration-200 mb-6 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-ink-700" />
            <span className="text-xs text-slate-muted">ou</span>
            <div className="flex-1 h-px bg-ink-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-muted mb-1.5 tracking-wide uppercase">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="voce@email.com"
                className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-600 text-white text-sm placeholder-ink-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-muted mb-1.5 tracking-wide uppercase">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-ink-600 text-white text-sm placeholder-ink-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-all"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Aguarde...' : tab === 'entrar' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function friendlyError(code: string): string {
  const map: Record<string, string> = {
    'auth/invalid-credential':     'E-mail ou senha incorretos.',
    'auth/user-not-found':         'Usuário não encontrado.',
    'auth/wrong-password':         'Senha incorreta.',
    'auth/email-already-in-use':   'Este e-mail já está em uso.',
    'auth/weak-password':          'A senha deve ter pelo menos 6 caracteres.',
    'auth/popup-closed-by-user':   'Login cancelado.',
    'auth/network-request-failed': 'Erro de rede. Verifique sua conexão.',
  }
  return map[code] || 'Ocorreu um erro. Tente novamente.'
}
