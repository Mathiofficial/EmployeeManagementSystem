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
    <main className="landing-page relative isolate flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden="true"
        className="landing-glow landing-glow-one pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="landing-glow landing-glow-two pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full blur-3xl"
      />

      <section className="landing-hero relative w-full max-w-5xl overflow-hidden rounded-[2rem] border px-6 py-16 text-center sm:px-12 sm:py-24">
        <div aria-hidden="true" className="landing-orbit landing-orbit-one" />
        <div aria-hidden="true" className="landing-orbit landing-orbit-two" />

        <div className="landing-content relative z-10 mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-white/80">
            Firstmeta Infrastructure Solutions
          </p>

          <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
            A better way to work together
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
            A clear, organized workspace designed to help your team stay
            connected and move forward with confidence.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/login"
              className="landing-primary-action rounded-xl px-8 py-3 font-semibold no-underline transition"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="landing-secondary-action rounded-xl px-8 py-3 font-semibold no-underline transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
