import { createContext, useContext, useState, type ReactNode } from 'react'

interface AuthContextType {
  token: string | null
  fullName: string | null
  email: string | null
  setAuth: (token: string, email: string, fullName: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [email, setEmail] = useState<string | null>(localStorage.getItem('email'))
  const [fullName, setFullName] = useState<string | null>(localStorage.getItem('fullName'))

  const setAuth = (t: string, e: string, fn: string) => {
    localStorage.setItem('token', t)
    localStorage.setItem('email', e)
    localStorage.setItem('fullName', fn)
    setToken(t)
    setEmail(e)
    setFullName(fn)
  }

  const logout = () => {
    localStorage.clear()
    setToken(null)
    setEmail(null)
    setFullName(null)
  }

  return (
    <AuthContext.Provider value={{ token, email, fullName, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
