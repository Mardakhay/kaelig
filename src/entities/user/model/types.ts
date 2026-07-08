import type { Session, User } from '@supabase/supabase-js'

export type AuthUser = User
export type AuthSession = Session

export interface Profile {
  id: string
  username: string
  avatarUrl: string | null
  createdAt: string
}

export interface SignUpInput {
  email: string
  password: string
  username: string
}

export interface SignInInput {
  email: string
  password: string
}
