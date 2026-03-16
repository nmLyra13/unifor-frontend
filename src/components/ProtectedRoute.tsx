import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  children: React.ReactNode
  allowedRoles?: ('aluno' | 'professor' | 'admin')[]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, role, loading, profileReady } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!profileReady) return <Navigate to="/setup" replace />
  if (allowedRoles && role && !allowedRoles.includes(role as any)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
