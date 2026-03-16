import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ReactNode, useState } from 'react'

const roleMenus = {
  aluno: [
    { to: '/aluno/disciplinas', icon: '📚', label: 'Disciplinas' },
    { to: '/aluno/boletim',     icon: '📊', label: 'Boletim'     },
  ],
  professor: [
    { to: '/professor/disciplinas', icon: '📖', label: 'Minhas Disciplinas' },
    { to: '/professor/alunos',      icon: '👥', label: 'Alunos'             },
    { to: '/professor/relatorios',  icon: '📋', label: 'Relatórios'         },
  ],
  admin: [
    { to: '/admin/usuarios',    icon: '👤', label: 'Usuários'    },
    { to: '/admin/disciplinas', icon: '🏫', label: 'Disciplinas' },
  ],
}

const roleLabel: Record<string, string> = {
  aluno:     'Aluno',
  professor: 'Professor',
  admin:     'Administrador',
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const menu = role ? roleMenus[role as keyof typeof roleMenus] ?? [] : []

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-ink-950 font-body text-white">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-ink-900 border-r border-ink-700
        flex flex-col transition-transform duration-300
        ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo */}
        <div className="px-6 pt-8 pb-6 border-b border-ink-700">
          <span className="font-display text-2xl font-semibold text-white">
            Uni<span className="text-gold-400">Project</span>
          </span>
          <p className="text-xs text-slate-muted mt-1 font-body tracking-widest uppercase">
            Sistema Universitário
          </p>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-ink-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
              <span className="text-gold-400 text-sm font-semibold">
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.displayName || user?.email}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-400 border border-gold-500/25">
                {role ? roleLabel[role] : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-ink-700'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-6">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <span>🚪</span> Sair
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-ink-900 border-b border-ink-700">
          <span className="font-display text-xl text-white">
            Uni<span className="text-gold-400">Project</span>
          </span>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-gray-400 hover:text-white"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
