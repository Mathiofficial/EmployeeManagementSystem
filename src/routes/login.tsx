import { useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck2,
  UsersRound,
} from 'lucide-react'

import { signIn } from '@/lib/auth-client'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message || 'Invalid email or password.')
        return
      }

      await navigate({ to: '/' })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative isolate flex min-h-[calc(100vh-12rem)] items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-36 top-0 h-96 w-96 rounded-full bg-[var(--hero-a)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-0 h-[30rem] w-[30rem] rounded-full bg-[var(--hero-b)] blur-3xl"
      />

      <section className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_30px_90px_rgba(34,52,105,0.18)] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="brand-panel relative isolate flex min-h-[36rem] flex-col justify-between overflow-hidden p-8 text-white sm:p-12 lg:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 -top-28 -z-10 h-[28rem] w-[28rem] rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-8 -z-10 h-80 w-80 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-24 -z-10 h-96 w-96 rounded-full bg-[var(--hero-a)] blur-3xl"
          />

          <div className="flex items-center gap-3">
            <span className="brand-mark flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg shadow-black/15">
              <UsersRound size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <div>
              <p className="m-0 text-sm font-bold tracking-wide">PEOPLE DESK</p>
              <p className="m-0 mt-0.5 text-xs text-white/55">
                TEAM OPERATIONS
              </p>
            </div>
          </div>

          <div className="relative z-10 py-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand-highlight)]">
              Your team, in sync
            </p>
            <h1 className="max-w-lg text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl">
              Make room for
              <br />
              <span className="font-serif italic text-[var(--brand-highlight)]">
                great work.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/65">
              A clearer view of your people and the work that keeps your
              organization moving.
            </p>

            <div className="mt-9 max-w-md rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/10 backdrop-blur-sm sm:p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="m-0 text-xs font-medium text-white/55">
                    TEAM OVERVIEW
                  </p>
                  <p className="m-0 mt-1 text-sm font-semibold">
                    Your workforce at a glance
                  </p>
                </div>
                <span className="rounded-full border border-[var(--brand-highlight)]/20 bg-[var(--brand-highlight)]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-highlight)]">
                  LIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="brand-panel-card rounded-xl border border-white/10 p-3.5">
                  <div className="flex items-center justify-between">
                    <UsersRound
                      size={17}
                      className="text-[var(--brand-highlight)]"
                      aria-hidden="true"
                    />
                    <span className="text-[10px] font-medium text-white/45">
                      PEOPLE
                    </span>
                  </div>
                  <p className="mb-0 mt-3 text-xl font-bold">Your team</p>
                  <p className="m-0 mt-1 text-xs text-white/50">
                    Connected in one place
                  </p>
                </div>
                <div className="brand-panel-card rounded-xl border border-white/10 p-3.5">
                  <div className="flex items-center justify-between">
                    <CalendarCheck2
                      size={17}
                      className="text-[var(--brand-highlight)]"
                      aria-hidden="true"
                    />
                    <span className="text-[10px] font-medium text-white/45">
                      TODAY
                    </span>
                  </div>
                  <p className="mb-0 mt-3 text-xl font-bold">On track</p>
                  <p className="m-0 mt-1 text-xs text-white/50">
                    Attendance at a glance
                  </p>
                </div>
              </div>
              <div className="brand-panel-card mt-3 flex items-center gap-3 rounded-xl border border-white/10 px-3.5 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-highlight)]/10 text-[var(--brand-highlight)]">
                  <BriefcaseBusiness size={16} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex justify-between text-[11px]">
                    <span className="font-medium text-white/80">
                      Departments
                    </span>
                    <span className="text-white/45">Organized</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[var(--brand-solid)] to-[var(--brand-highlight)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-highlight)]" />
            Built for the people behind the work
          </div>
        </div>

        <div className="flex items-center p-8 sm:p-12 lg:p-14">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-9">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--kicker)]">
                Welcome back
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
                Sign in to your account
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--sea-ink-soft)]">
                Enter your work credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[var(--sea-ink)]"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-3.5 text-[var(--sea-ink)] outline-none transition placeholder:text-[var(--sea-ink-soft)]/70 focus:border-[var(--lagoon-deep)] focus:ring-4 focus:ring-[var(--lagoon)]/15"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[var(--sea-ink)]"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-3.5 text-[var(--sea-ink)] outline-none transition placeholder:text-[var(--sea-ink-soft)]/70 focus:border-[var(--lagoon-deep)] focus:ring-4 focus:ring-[var(--lagoon)]/15"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="brand-button group flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lagoon-deep)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign in'}
                {!loading && (
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                )}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-[var(--sea-ink-soft)]">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="brand-text font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
