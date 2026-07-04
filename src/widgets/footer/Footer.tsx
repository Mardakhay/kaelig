import { Link } from '@tanstack/react-router'
import { Gamepad2, Github } from 'lucide-react'

const year = new Date().getFullYear()

const footerLinks = [
  { to: '/' as const, label: 'Home' },
  { to: '/search' as const, label: 'Search' },
  { to: '/library' as const, label: 'Library' },
  { to: '/profile' as const, label: 'Profile' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Gamepad2 className="h-5 w-5 shrink-0 text-primary" />
            <span className="text-sm font-semibold text-foreground">Kaelig</span>
          </Link>

          {/* Footer nav */}
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer navigation">
            {footerLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Social + copyright */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Mardakhay/kaelig"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
            </a>
            <span className="text-xs text-muted-foreground">&copy; {year} Kaelig</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
