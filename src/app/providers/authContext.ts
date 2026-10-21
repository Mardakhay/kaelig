import { createContext } from 'react'
import type { AuthUser, Profile } from '@entities/user'

export interface AuthContextValue {
  user: AuthUser | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  error: string | null
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
