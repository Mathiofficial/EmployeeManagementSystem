import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import { authClient } from '@/lib/auth-client'
import { completeRegistration } from '@/server/registration.functions'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      })

      if (result.error) {
        setError(result.error.message || 'Unable to create account.')
        return
      }

      await completeRegistration({
        data: {
          phone: phone.trim() || undefined,
        },
      })

      await navigate({ to: '/dashboard' })
    } catch (err) {
      console.error('Registration failed:', err)
      setError(
        'Account registration could not be completed. Please try again or contact the administrator.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative isolate flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-[var(--hero-a)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-[var(--hero-b)] blur-3xl"
      />

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_32px_100px_rgba(34,52,105,0.18)] md:grid-cols-[0.95fr_1.05fr]">
        <div className="brand-panel relative isolate flex min-h-64 flex-col justify-between overflow-hidden p-8 text-white sm:p-10 md:min-h-[38rem] md:p-12">
          <div className="flex items-center gap-3">
            <span className="brand-mark flex h-11 w-11 items-center justify-center rounded-2xl">
              <span className="text-xl font-bold">E</span>
            </span>
            <span className="text-sm font-semibold tracking-wide text-white/90">
              PEOPLE OPERATIONS
            </span>
          </div>

          <div className="relative z-10 py-8">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand-highlight)]">
              Join your workplace
            </p>
            <h1 className="max-w-sm text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Your work starts here.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-white/70">
              Create your account and manage your employee activities in one
              place.
            </p>
          </div>

          <div className="flex items-center gap-3 border-t border-white/15 pt-5">
            <span className="h-2 w-2 rounded-full bg-[var(--brand-highlight)]" />
            <p className="m-0 text-sm text-white/70">
              Employee Management System
            </p>
          </div>
        </div>

        <div className="flex items-center p-8 sm:p-12 md:p-14">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-7">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--kicker)]">
                Get started
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
                Create your account
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--sea-ink-soft)]">
                Enter your details to register.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-[var(--sea-ink)]"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-3 text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon-deep)] focus:ring-4 focus:ring-[var(--lagoon)]/15"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[var(--sea-ink)]"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-3 text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon-deep)] focus:ring-4 focus:ring-[var(--lagoon)]/15"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-[var(--sea-ink)]"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  autoComplete="tel"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-3 text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon-deep)] focus:ring-4 focus:ring-[var(--lagoon)]/15"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-3 text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon-deep)] focus:ring-4 focus:ring-[var(--lagoon)]/15"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-[var(--sea-ink)]"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-3 text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon-deep)] focus:ring-4 focus:ring-[var(--lagoon)]/15"
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
                className="brand-button flex w-full items-center justify-center rounded-xl px-5 py-3.5 font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--sea-ink-soft)]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="brand-text font-semibold hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
