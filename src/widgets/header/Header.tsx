import { useState, useEffect } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Menu, X, Gamepad2, LogOut } from 'lucide-react'
import { cn } from '@shared/lib/cn'
import { Button } from '@shared/ui/button'
import { NAV_LINKS } from '@widgets/layout/navLinks'
import { useAuth } from '@shared/hooks'
import { UserMenu } from './UserMenu'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated, user, profile, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleMobileSignOut() {
    setIsSigningOut(true)
    try {
      await signOut()
    } finally {
      setIsSigningOut(false)
    }
  }

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo — hidden on lg+ because sidebar shows it */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80 lg:hidden">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight text-foreground">Kaelig</span>
        </Link>

        {/* Spacer so right actions stay right on lg+ when logo is hidden */}
        <div className="hidden lg:block" />

        {/* Tablet nav (md only, sidebar handles lg+) */}
        <nav className="hidden items-center gap-1 md:flex lg:hidden">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                location.pathname === to
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions — md+ */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <Link
                to="/auth"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger — hidden on md+ */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile drawer — full-width below header, mobile only */}
      {menuOpen && (
        <div className="border-t border-border bg-card md:hidden">
          <nav className="flex flex-col gap-1 p-4">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  location.pathname === to
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 border-t border-border p-4">
            {isAuthenticated ? (
              <>
                <div className="px-1 pb-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {profile?.username ?? user?.email?.split('@')[0]}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleMobileSignOut}
                  disabled={isSigningOut}
                  className="flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium text-error transition-colors hover:bg-error/10 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {isSigningOut ? 'Signing out…' : 'Sign out'}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth"
                  className="flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
