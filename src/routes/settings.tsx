import { useEffect, useState } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import {
  ArrowUpRight,
  CircleHelp,
  Monitor,
  Moon,
  Palette,
  Sun,
  UserRound,
} from 'lucide-react'

import { getCurrentAppUser } from '@/lib/auth.functions'
import { applyThemeMode, getStoredThemeMode } from '@/lib/theme'
import type { ThemeMode } from '@/lib/theme'

export const Route = createFileRoute('/settings')({
  beforeLoad: async () => {
    const appUser = await getCurrentAppUser()

    if (!appUser) {
      throw redirect({ to: '/login' })
    }

    if (appUser.role !== 'ADMIN') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: SettingsPage,
})

const themeOptions: {
  value: ThemeMode
  label: string
  description: string
  icon: typeof Sun
}[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'A bright, clear workspace',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'A comfortable low-light view',
    icon: Moon,
  },
  {
    value: 'auto',
    label: 'System',
    description: 'Follow your device preference',
    icon: Monitor,
  },
]

function SettingsPage() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto')

  useEffect(() => {
    setThemeMode(getStoredThemeMode())
  }, [])

  function handleThemeChange(mode: ThemeMode) {
    setThemeMode(mode)
    applyThemeMode(mode)
  }

  return (
    <main className="page-wrap settings-page space-y-6 px-4 py-8 sm:py-10">
      <header className="settings-hero island-shell rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="settings-hero-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white">
            <Palette aria-hidden="true" size={23} />
          </span>
          <div>
            <p className="island-kicker mb-1">Workspace preferences</p>
            <h1 className="m-0 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
              General Settings
            </h1>
            <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-[var(--sea-ink-soft)] sm:text-base">
              Personalize the appearance of your workspace and find useful
              account and support links.
            </p>
          </div>
        </div>
      </header>

      <section className="settings-card island-shell rounded-2xl p-5 sm:p-7">
        <div className="mb-6">
          <h2 className="m-0 text-xl font-bold text-[var(--sea-ink)]">
            Appearance
          </h2>
          <p className="mb-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
            Choose how the employee management system looks on this browser.
          </p>
        </div>

        <div
          aria-label="Theme preference"
          className="grid gap-3 md:grid-cols-3"
          role="group"
        >
          {themeOptions.map(({ value, label, description, icon: Icon }) => {
            const isSelected = themeMode === value

            return (
              <button
                key={value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleThemeChange(value)}
                className={`settings-theme-option flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? 'settings-theme-option-selected'
                    : 'border-[var(--chip-line)] bg-[var(--chip-bg)]'
                }`}
              >
                <span className="settings-option-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <Icon aria-hidden="true" size={19} />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-[var(--sea-ink)]">
                    {label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--sea-ink-soft)]">
                    {description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <p className="mb-0 mt-4 text-xs text-[var(--sea-ink-soft)]">
          Your appearance preference is saved in this browser.
        </p>
      </section>

      <section className="settings-card island-shell rounded-2xl p-5 sm:p-7">
        <div className="mb-5">
          <h2 className="m-0 text-xl font-bold text-[var(--sea-ink)]">
            Account & support
          </h2>
          <p className="mb-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
            Manage your personal information or get help with the system.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/profile"
            className="settings-quick-link group flex items-center justify-between gap-4 rounded-xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-4 no-underline"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="settings-option-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <UserRound aria-hidden="true" size={19} />
              </span>
              <span>
                <span className="block font-bold text-[var(--sea-ink)]">
                  My Profile
                </span>
                <span className="mt-1 block text-xs text-[var(--sea-ink-soft)]">
                  View account and personal details
                </span>
              </span>
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="shrink-0 text-[var(--sea-ink-soft)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              size={18}
            />
          </Link>

          <Link
            to="/help"
            className="settings-quick-link group flex items-center justify-between gap-4 rounded-xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-4 no-underline"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="settings-option-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <CircleHelp aria-hidden="true" size={19} />
              </span>
              <span>
                <span className="block font-bold text-[var(--sea-ink)]">
                  Help & Support
                </span>
                <span className="mt-1 block text-xs text-[var(--sea-ink-soft)]">
                  Ask a question or clarify a doubt
                </span>
              </span>
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="shrink-0 text-[var(--sea-ink-soft)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              size={18}
            />
          </Link>
        </div>
      </section>
    </main>
  )
}
