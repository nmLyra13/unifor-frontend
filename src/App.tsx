import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login         from './pages/Login'
import SetupProfile  from './pages/SetupProfile'

import StudentDisciplinas from './pages/student/Disciplinas'
import StudentBoletim     from './pages/student/Boletim'

import TeacherDisciplinas from './pages/teacher/Disciplinas'
import TeacherAlunos      from './pages/teacher/Alunos'
import TeacherRelatorios  from './pages/teacher/Relatorios'

import AdminUsuarios    from './pages/admin/Usuarios'
import AdminDisciplinas from './pages/admin/Disciplinas'

// Redireciona para o dashboard correto conforme o papel do usuário
function RoleRedirect() {
  const { role, profileReady, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profileReady) return <Navigate to="/setup" replace />

  if (role === 'admin')     return <Navigate to="/admin/usuarios"         replace />
  if (role === 'professor') return <Navigate to="/professor/disciplinas"  replace />
  return <Navigate to="/aluno/disciplinas" replace />
}

// Página 403
function Unauthorized() {
  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center font-body">
      <div className="text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="font-display text-3xl text-white mb-2">Acesso negado</h1>
        <p className="text-slate-muted">Você não tem permissão para acessar esta página.</p>
        <a href="/" className="mt-6 inline-block text-gold-400 text-sm hover:underline">← Voltar ao início</a>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<SetupProfile />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Redirecionamento inteligente */}
      <Route path="/" element={
        <ProtectedRoute>
          <RoleRedirect />
        </ProtectedRoute>
      } />

      {/* Aluno */}
      <Route path="/aluno/disciplinas" element={
        <ProtectedRoute allowedRoles={['aluno', 'admin']}>
          <Layout><StudentDisciplinas /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/aluno/boletim" element={
        <ProtectedRoute allowedRoles={['aluno', 'admin']}>
          <Layout><StudentBoletim /></Layout>
        </ProtectedRoute>
      } />

      {/* Professor */}
      <Route path="/professor/disciplinas" element={
        <ProtectedRoute allowedRoles={['professor', 'admin']}>
          <Layout><TeacherDisciplinas /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/professor/alunos" element={
        <ProtectedRoute allowedRoles={['professor', 'admin']}>
          <Layout><TeacherAlunos /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/professor/relatorios" element={
        <ProtectedRoute allowedRoles={['professor', 'admin']}>
          <Layout><TeacherRelatorios /></Layout>
        </ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin/usuarios" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><AdminUsuarios /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/disciplinas" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><AdminDisciplinas /></Layout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
