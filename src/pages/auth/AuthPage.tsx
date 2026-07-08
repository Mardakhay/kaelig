import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, Gamepad2, TriangleAlert } from 'lucide-react'
import { useAuth } from '@shared/hooks'
import { AuthApiError } from '@entities/user'
import { Card, CardContent } from '@shared/ui/card'
import { Input } from '@shared/ui/input'
import { Button } from '@shared/ui/button'
import { Loader } from '@shared/ui/loader'
import { cn } from '@shared/lib/cn'

type Mode = 'signin' | 'signup'

const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(24, 'Username must be 24 characters or fewer')
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type SignInValues = z.infer<typeof signInSchema>
type SignUpValues = z.infer<typeof signUpSchema>

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      void navigate({ to: '/library' })
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Gamepad2 className="h-7 w-7 text-primary" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">
              {mode === 'signin' ? 'Sign in to Kaelig' : 'Create your account'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'signin'
                ? 'Track your library and pick up where you left off.'
                : 'Start building your personal game library.'}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signin'}
                onClick={() => setMode('signin')}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  mode === 'signin'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signup'}
                onClick={() => setMode('signup')}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  mode === 'signup'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Create account
              </button>
            </div>

            {mode === 'signin' ? (
              <SignInForm onSwitchToSignUp={() => setMode('signup')} />
            ) : (
              <SignUpForm onSwitchToSignIn={() => setMode('signin')} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FormError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
    >
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-error">{message}</p>
}

function PasswordInput({
  id,
  visible,
  onToggle,
  ...props
}: {
  id: string
  visible: boolean
  onToggle: () => void
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Input id={id} type={visible ? 'text' : 'password'} className="pr-10" {...props} />
      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const { signIn } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  })

  async function onSubmit(values: SignInValues) {
    setFormError(null)
    try {
      await signIn(values.email, values.password)
    } catch (err) {
      setFormError(err instanceof AuthApiError ? err.message : 'Unable to sign in. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError && <FormError message={formError} />}

      <div>
        <label htmlFor="signin-email" className="mb-1.5 block text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register('email')}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <label htmlFor="signin-password" className="mb-1.5 block text-sm font-medium text-foreground">
          Password
        </label>
        <PasswordInput
          id="signin-password"
          autoComplete="current-password"
          placeholder="••••••••"
          visible={showPassword}
          onToggle={() => setShowPassword(v => !v)}
          {...register('password')}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader size="xs" variant="white" />}
        Sign in
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-medium text-primary hover:underline"
        >
          Create one
        </button>
      </p>
    </form>
  )
}

function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const { signUp } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  })

  async function onSubmit(values: SignUpValues) {
    setFormError(null)
    try {
      await signUp(values.email, values.password, values.username)
      // AuthProvider's session listener picks up the new session and
      // AuthPage redirects to /library automatically.
    } catch (err) {
      setFormError(err instanceof AuthApiError ? err.message : 'Unable to create account. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError && <FormError message={formError} />}

      <div>
        <label htmlFor="signup-username" className="mb-1.5 block text-sm font-medium text-foreground">
          Username
        </label>
        <Input
          id="signup-username"
          type="text"
          autoComplete="username"
          placeholder="gamer_tag"
          {...register('username')}
        />
        <FieldError message={errors.username?.message} />
      </div>

      <div>
        <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register('email')}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-foreground">
          Password
        </label>
        <PasswordInput
          id="signup-password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          visible={showPassword}
          onToggle={() => setShowPassword(v => !v)}
          {...register('password')}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <div>
        <label htmlFor="signup-confirm-password" className="mb-1.5 block text-sm font-medium text-foreground">
          Confirm password
        </label>
        <PasswordInput
          id="signup-confirm-password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          visible={showConfirmPassword}
          onToggle={() => setShowConfirmPassword(v => !v)}
          {...register('confirmPassword')}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader size="xs" variant="white" />}
        Create account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  )
}
