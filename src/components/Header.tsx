import { LogOut, UserRound, User, LogIn } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import { authClient } from '@/lib/auth-client'

export default function Header() {
  const navigate = useNavigate()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { data: session, isPending } = authClient.useSession()

  const [loggingOut, setLoggingOut] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setProfileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!profileMenuOpen) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !profileMenuRef.current?.contains(event.target)
      ) {
        setProfileMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileMenuOpen])

  async function handleLogout() {
    setLoggingOut(true)
    setProfileMenuOpen(false)

    try {
      await authClient.signOut()
      await navigate({ to: '/' })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="flex w-full flex-wrap items-center gap-4 py-3 sm:py-4">
        {/* Left side: Brand */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-2">
          <h2 className="m-0 min-w-0 text-base font-semibold tracking-tight">
            <Link
              to="/"
              aria-label="Firstmeta Infrastructure Solutions Private Limited home"
              className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-xs leading-tight text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(53,75,150,0.12)] sm:gap-3 sm:px-4 sm:py-2 sm:text-sm"
            >
              <svg
                viewBox="0 0 64 64"
                aria-hidden="true"
                className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
              >
                <defs>
                  <linearGradient
                    id="firstmeta-accent"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0" stopColor="#f47b20" />
                    <stop offset="1" stopColor="#e94e1b" />
                  </linearGradient>
                  <linearGradient
                    id="firstmeta-cream"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0" stopColor="#fffdf3" />
                    <stop offset="1" stopColor="#e7dfc7" />
                  </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="31" fill="#171416" />
                <circle
                  cx="32"
                  cy="32"
                  r="27.5"
                  fill="none"
                  stroke="url(#firstmeta-cream)"
                  strokeWidth="1.5"
                  strokeDasharray="112 12 21 28"
                  strokeLinecap="round"
                  transform="rotate(-72 32 32)"
                />
                <path
                  d="M17 20h15l-4 4H13l4-4Zm0 10h15l-4 4H13l4-4Z"
                  fill="url(#firstmeta-accent)"
                />
                <path
                  d="M31 44V21l12 16 11-16v23h-4V29L43 41l-8-12v15h-4Z"
                  fill="url(#firstmeta-cream)"
                />
              </svg>
              <span className="min-w-0 break-words">
                Firstmeta Infrastructure Solutions Private Limited
              </span>
            </Link>
          </h2>
        </div>

        {/* Right side: Navigation, theme, and profile */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link
              to="/"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Home
            </Link>

            <Link
              to="/about"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              About
            </Link>

            <Link
              to="/help"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Help
            </Link>
          </div>

          <ThemeToggle />

          {!isPending && (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                title="Profile options"
                aria-label="Profile options"
                aria-expanded={profileMenuOpen}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] shadow-sm transition hover:bg-[var(--line)]"
              >
                <UserRound size={20} />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-12 z-50 min-w-44 rounded-xl border border-[var(--chip-line)] bg-[var(--header-bg)] p-1.5 shadow-lg backdrop-blur-lg">
                  {session ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--sea-ink)] no-underline transition hover:bg-[var(--line)]"
                      >
                        <User size={16} />
                        Profile
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--sea-ink)] transition hover:bg-[var(--line)] disabled:opacity-50"
                      >
                        <LogOut size={16} />
                        {loggingOut ? 'Logging out...' : 'Logout'}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--sea-ink)] no-underline transition hover:bg-[var(--line)]"
                      >
                        <LogIn size={16} />
                        Login
                      </Link>

                      <Link
                        to="/signup"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--sea-ink)] no-underline transition hover:bg-[var(--line)]"
                      >
                        <UserRound size={16} />
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
