import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '@shared/hooks'
import { Avatar, AvatarFallback } from '@shared/ui/avatar'
import { cn } from '@shared/lib/cn'

function getInitials(value: string) {
  return value.slice(0, 2).toUpperCase()
}

export function UserMenu() {
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const displayName = profile?.username ?? user?.email?.split('@')[0] ?? 'Account'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await signOut()
    } finally {
      setIsSigningOut(false)
      setOpen(false)
    }
  }

  if (!user) return null

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Avatar className="h-9 w-9 border border-border">
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-card shadow-lg'
          )}
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="p-1">
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <UserIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Profile
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-error transition-colors hover:bg-error/10 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
