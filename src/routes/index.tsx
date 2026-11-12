import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { getCurrentAppUser } from '@/lib/auth.functions'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const appUser = await getCurrentAppUser()

    if (appUser) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: WelcomePage,
})

function WelcomePage() {
  return (
    <main className="relative isolate flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-[var(--hero-a)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-[var(--hero-b)] blur-3xl"
      />

      <section className="relative w-full max-w-4xl rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] px-6 py-16 text-center shadow-[0_32px_100px_rgba(34,52,105,0.14)] sm:px-12 sm:py-24">
        <div className="brand-mark mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-bold shadow-lg">
          E
        </div>

        <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[var(--kicker)]">
          People Operations
        </p>

        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Welcome to Employee Management System
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[var(--sea-ink-soft)] sm:text-lg">
          Manage employee information, departments, attendance and leave
          activities in one simple and organized platform.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/login"
            className="brand-button rounded-xl px-8 py-3 font-semibold no-underline transition"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="rounded-xl border border-[var(--chip-line)] px-8 py-3 font-semibold text-[var(--sea-ink)] no-underline transition hover:bg-[var(--line)]"
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 text-sm font-medium text-[var(--sea-ink-soft)] sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] p-4">
            Employees
          </div>
          <div className="rounded-xl border border-[var(--line)] p-4">
            Attendance
          </div>
          <div className="rounded-xl border border-[var(--line)] p-4">
            Leave Management
          </div>
        </div>
      </section>
    </main>
  )
}
