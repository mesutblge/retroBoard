import { createContext, useContext, useState, type ReactNode } from 'react'

type Role = 'ADMIN' | 'USER'

interface AuthContextType {
  token: string | null
  fullName: string | null
  email: string | null
  role: Role | null
  companyId: number | null
  companyName: string | null
  inviteCode: string | null
  isAdmin: boolean
  setAuth: (token: string, email: string, fullName: string, role: Role, companyId: number, companyName: string, inviteCode: string | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [email, setEmail] = useState<string | null>(localStorage.getItem('email'))
  const [fullName, setFullName] = useState<string | null>(localStorage.getItem('fullName'))
  const [role, setRole] = useState<Role | null>(localStorage.getItem('role') as Role | null)
  const [companyId, setCompanyId] = useState<number | null>(Number(localStorage.getItem('companyId')) || null)
  const [companyName, setCompanyName] = useState<string | null>(localStorage.getItem('companyName'))
  const [inviteCode, setInviteCode] = useState<string | null>(localStorage.getItem('inviteCode'))

  const setAuth = (t: string, e: string, fn: string, r: Role, cId: number, cName: string, ic: string | null) => {
    localStorage.setItem('token', t)
    localStorage.setItem('email', e)
    localStorage.setItem('fullName', fn)
    localStorage.setItem('role', r)
    localStorage.setItem('companyId', String(cId))
    localStorage.setItem('companyName', cName)
    if (ic) localStorage.setItem('inviteCode', ic)
    else localStorage.removeItem('inviteCode')
    setToken(t); setEmail(e); setFullName(fn); setRole(r)
    setCompanyId(cId); setCompanyName(cName); setInviteCode(ic)
  }

  const logout = () => {
    localStorage.clear()
    setToken(null); setEmail(null); setFullName(null); setRole(null)
    setCompanyId(null); setCompanyName(null); setInviteCode(null)
  }

  return (
    <AuthContext.Provider value={{
      token, email, fullName, role,
      companyId, companyName, inviteCode,
      isAdmin: role === 'ADMIN',
      setAuth, logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
