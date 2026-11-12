import { createFileRoute } from '@tanstack/react-router'
import { CircleHelp, Mail, MessageSquareText, Send } from 'lucide-react'

export const Route = createFileRoute('/help')({
  component: Help,
})

function Help() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const topic = String(formData.get('topic') ?? '').trim()
    const question = String(formData.get('question') ?? '').trim()
    const subject = `Employee Management System help: ${topic}`
    const body = [
      `Name: ${name}`,
      `Reply email: ${email}`,
      `Topic: ${topic}`,
      '',
      question,
    ].join('\n')

    window.location.href = `mailto:mathiyazhagan3112@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <main className="page-wrap help-page px-4 py-8 sm:py-12">
      <section className="island-shell help-shell overflow-hidden rounded-3xl">
        <div className="help-hero relative grid gap-8 px-6 py-8 text-white sm:px-10 sm:py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="relative z-10 max-w-2xl">
            <div className="help-icon mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10">
              <CircleHelp aria-hidden="true" size={25} />
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
              People-first support
            </p>
            <h1 className="display-title mb-3 text-4xl font-bold sm:text-5xl">
              Let’s find your answer.
            </h1>
            <p className="m-0 max-w-xl leading-7 text-white/85">
              Questions, clarifications, or a tricky workflow? Tell us what’s on
              your mind and we’ll help point you in the right direction.
            </p>
          </div>

          <a
            className="help-contact-card relative z-10 flex items-center gap-3 rounded-2xl border border-white/20 px-4 py-3 text-white no-underline sm:min-w-64"
            href="mailto:mathiyazhagan3112@gmail.com"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
              <Mail aria-hidden="true" size={19} />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-white/75">
                Write to support
              </span>
              <span className="block break-all text-sm font-bold">
                mathiyazhagan3112@gmail.com
              </span>
            </span>
          </a>
        </div>

        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:gap-10 lg:p-10">
          <div className="help-form-panel min-w-0 rounded-2xl p-1 sm:p-2">
            <div className="mb-6 flex items-center gap-3">
              <span className="help-message-icon inline-flex h-11 w-11 items-center justify-center rounded-xl text-white">
                <MessageSquareText aria-hidden="true" size={20} />
              </span>
              <div>
                <h2 className="m-0 text-xl font-bold text-[var(--sea-ink)]">
                  Send us your question
                </h2>
                <p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
                  Share a few details so we can understand your question.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-[var(--sea-ink)]">
                  Your name
                  <input
                    className="help-field mt-2 w-full rounded-xl border border-[var(--chip-line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)] outline-none transition focus:border-[var(--brand-solid)] focus:ring-2 focus:ring-[var(--brand-solid)]/20"
                    name="name"
                    autoComplete="name"
                    required
                  />
                </label>

                <label className="block text-sm font-semibold text-[var(--sea-ink)]">
                  Your email
                  <input
                    className="help-field mt-2 w-full rounded-xl border border-[var(--chip-line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)] outline-none transition focus:border-[var(--brand-solid)] focus:ring-2 focus:ring-[var(--brand-solid)]/20"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold text-[var(--sea-ink)]">
                What is your question about?
                <select
                  className="help-field mt-2 w-full rounded-xl border border-[var(--chip-line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)] outline-none transition focus:border-[var(--brand-solid)] focus:ring-2 focus:ring-[var(--brand-solid)]/20"
                  name="topic"
                  defaultValue="General question"
                >
                  <option>General question</option>
                  <option>Account and access</option>
                  <option>Employees and departments</option>
                  <option>Attendance</option>
                  <option>Leave requests</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-[var(--sea-ink)]">
                Your question or doubt
                <textarea
                  className="help-field mt-2 min-h-36 w-full resize-y rounded-xl border border-[var(--chip-line)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--sea-ink)] outline-none transition placeholder:text-[var(--sea-ink-soft)] focus:border-[var(--brand-solid)] focus:ring-2 focus:ring-[var(--brand-solid)]/20"
                  name="question"
                  placeholder="Describe what you need help with..."
                  required
                />
              </label>

              <button
                className="help-submit brand-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition"
                type="submit"
              >
                <Send aria-hidden="true" size={16} />
                Prepare email
              </button>
            </form>

            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--sea-ink-soft)]">
              <Mail aria-hidden="true" className="mt-0.5 shrink-0" size={15} />
              Your message is not sent by this website. Your default email app
              will open so you can review and send it.
            </p>
          </div>

          <aside className="help-answers rounded-2xl border border-[var(--chip-line)] p-5 sm:p-6">
            <div className="mb-5">
              <p className="island-kicker mb-2">Before you write</p>
              <h2 className="m-0 text-xl font-bold text-[var(--sea-ink)]">
                A few helpful tips
              </h2>
            </div>
            <div className="space-y-5">
              <div className="help-answer">
                <h3 className="mb-1 text-sm font-bold text-[var(--sea-ink)]">
                  Need access to a feature?
                </h3>
                <p className="m-0 text-sm leading-6 text-[var(--sea-ink-soft)]">
                  Access depends on your account role. Contact your system
                  administrator if a page or action is unavailable.
                </p>
              </div>
              <div className="help-answer">
                <h3 className="mb-1 text-sm font-bold text-[var(--sea-ink)]">
                  Have an attendance or leave question?
                </h3>
                <p className="m-0 text-sm leading-6 text-[var(--sea-ink-soft)]">
                  Include the relevant date and a brief description in your
                  message so the support team can better understand the issue.
                </p>
              </div>
              <div className="help-answer">
                <h3 className="mb-1 text-sm font-bold text-[var(--sea-ink)]">
                  What happens when you submit?
                </h3>
                <p className="m-0 text-sm leading-6 text-[var(--sea-ink-soft)]">
                  Your email app opens with your question addressed to the
                  support contact. Review the draft and press Send to contact
                  us.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
