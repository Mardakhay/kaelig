import { Gamepad2 } from 'lucide-react'

export function AuthPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Gamepad2 className="h-8 w-8 text-primary" />
      </div>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-foreground">Sign in to Kaelig</h1>
        <p className="text-sm text-muted-foreground">Authentication coming soon.</p>
      </div>
    </div>
  )
}
