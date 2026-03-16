import {
  createContext, useContext, useEffect, useState, ReactNode
} from 'react'
import {
  onAuthStateChanged, User,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import api from '../api'

type Role = 'aluno' | 'professor' | 'admin' | null

interface AuthContextType {
  user: User | null
  role: Role
  loading: boolean
  profileReady: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInGoogle: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  saveProfile: (name: string, role: 'aluno' | 'professor') => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<User | null>(null)
  const [role, setRole]               = useState<Role>(null)
  const [loading, setLoading]         = useState(true)
  const [profileReady, setProfileReady] = useState(false)

  // Extrai role das custom claims do token
  const extractRole = async (u: User): Promise<Role> => {
    const result = await u.getIdTokenResult(true) // force refresh
    return (result.claims.role as Role) || null
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const r = await extractRole(u)
        setRole(r)
        setProfileReady(!!r)
      } else {
        setRole(null)
        setProfileReady(false)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signInGoogle = async () => {
    await signInWithPopup(auth, googleProvider)
  }

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const saveProfile = async (name: string, roleVal: 'aluno' | 'professor') => {
    const token = await user!.getIdToken()
    await api.post('/v1/auth/profile', { name, role: roleVal }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    // Força refresh das claims para pegar a role recém-definida
    const r = await extractRole(user!)
    setRole(r)
    setProfileReady(true)
  }

  return (
    <AuthContext.Provider value={{
      user, role, loading, profileReady,
      signIn, signInGoogle, signUp, signOut, saveProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
