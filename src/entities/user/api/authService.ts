import { supabase } from '@shared/api/supabaseClient'
import type { AuthSession, Profile, SignInInput, SignUpInput } from '../model/types'

export class AuthApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthApiError'
  }
}

function mapAuthError(error: { message: string } | null): never | void {
  if (!error) return

  const message = error.message.toLowerCase()

  if (message.includes('already registered') || message.includes('already exists')) {
    throw new AuthApiError('An account with this email already exists. Try signing in instead.')
  }
  if (message.includes('invalid login credentials')) {
    throw new AuthApiError('Incorrect email or password. Please try again.')
  }
  if (message.includes('password should be at least')) {
    throw new AuthApiError('Password must be at least 6 characters long.')
  }
  if (message.includes('email not confirmed')) {
    throw new AuthApiError('Please confirm your email address before signing in.')
  }

  throw new AuthApiError(error.message)
}

export const authService = {
  async signUp({ email, password, username }: SignUpInput): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    })

    mapAuthError(error)
    if (!data.session) {
      throw new AuthApiError('Unable to create account. Please try again.')
    }
    return data.session
  },

  async signIn({ email, password }: SignInInput): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    mapAuthError(error)
    if (!data.session) {
      throw new AuthApiError('Unable to sign in. Please try again.')
    }
    return data.session
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    mapAuthError(error)
  },

  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await supabase.auth.getSession()
    mapAuthError(error)
    return data.session
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, created_at')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      throw new AuthApiError(error.message)
    }
    if (!data) return null

    return {
      id: data.id,
      username: data.username,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
    }
  },
}
