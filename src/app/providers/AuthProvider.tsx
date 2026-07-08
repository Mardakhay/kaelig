import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@shared/api/supabaseClient'
import { authService, AuthApiError, type AuthUser, type Profile } from '@entities/user'
import { useLibraryStore } from '@entities/game'

export interface AuthContextValue {
  user: AuthUser | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<{ needsEmailConfirmation: boolean }>
  signOut: () => Promise<void>
  error: string | null
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hydrateLibrary = useLibraryStore(state => state.hydrate)
  const resetLibrary = useLibraryStore(state => state.reset)

  useEffect(() => {
    let active = true

    async function loadProfile(userId: string) {
      try {
        const loadedProfile = await authService.getProfile(userId)
        if (active) setProfile(loadedProfile)
      } catch (err) {
        console.error('Failed to load profile:', err)
      }
    }

    async function init() {
      const session = await authService.getSession()
      if (!active) return

      setUser(session?.user ?? null)
      if (session?.user) {
        void loadProfile(session.user.id)
        void hydrateLibrary(session.user.id)
      }
      setIsLoading(false)
    }

    void init()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return

      setUser(session?.user ?? null)

      if (session?.user) {
        void loadProfile(session.user.id)
        void hydrateLibrary(session.user.id)
      } else {
        setProfile(null)
        resetLibrary()
      }
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [hydrateLibrary, resetLibrary])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      await authService.signIn({ email, password })
    } catch (err) {
      const message = err instanceof AuthApiError ? err.message : 'Unable to sign in. Please try again.'
      setError(message)
      throw err
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    setError(null)
    try {
      const session = await authService.signUp({ email, password, username })
      return { needsEmailConfirmation: !session }
    } catch (err) {
      const message = err instanceof AuthApiError ? err.message : 'Unable to create account. Please try again.'
      setError(message)
      throw err
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    try {
      await authService.signOut()
    } catch (err) {
      const message = err instanceof AuthApiError ? err.message : 'Unable to sign out. Please try again.'
      setError(message)
      throw err
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: Boolean(user),
        signIn,
        signUp,
        signOut,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
