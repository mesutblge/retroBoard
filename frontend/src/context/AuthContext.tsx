import { createContext, useContext, useState, type ReactNode } from 'react'

type Role = 'ADMIN' | 'USER'

interface AuthContextType {
  token: string | null
  fullName: string | null
  email: string | null
  role: Role | null
  isAdmin: boolean
  setAuth: (token: string, email: string, fullName: string, role: Role) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [email, setEmail] = useState<string | null>(localStorage.getItem('email'))
  const [fullName, setFullName] = useState<string | null>(localStorage.getItem('fullName'))
  const [role, setRole] = useState<Role | null>(localStorage.getItem('role') as Role | null)

  const setAuth = (t: string, e: string, fn: string, r: Role) => {
    localStorage.setItem('token', t)
    localStorage.setItem('email', e)
    localStorage.setItem('fullName', fn)
    localStorage.setItem('role', r)
    setToken(t); setEmail(e); setFullName(fn); setRole(r)
  }

  const logout = () => {
    localStorage.clear()
    setToken(null); setEmail(null); setFullName(null); setRole(null)
  }

  return (
    <AuthContext.Provider value={{ token, email, fullName, role, isAdmin: role === 'ADMIN', setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
