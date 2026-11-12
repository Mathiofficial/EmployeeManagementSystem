import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">About</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Firstmeta Infrastructure Solutions Private Limited
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          Firstmeta Infrastructure Solutions Private Limited is focused on
          delivering dependable infrastructure solutions through thoughtful
          planning, practical expertise, and a commitment to quality. We believe
          strong outcomes start with strong teams, clear communication, and
          reliable execution. Our employee management platform supports that
          commitment by bringing people, departments, attendance, and leave
          management together in one organized workspace.
        </p>
      </section>
    </main>
  )
}
