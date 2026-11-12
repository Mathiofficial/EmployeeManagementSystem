import { MapPin, Phone } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer mt-20 px-4 pb-8 pt-10 text-[var(--sea-ink-soft)]">
      <div className="page-wrap">
        <div className="grid gap-8 pb-8 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="mb-2 text-sm font-bold text-[var(--sea-ink)]">
              Firstmeta Infrastructure Solutions Private Limited
            </p>
            <p className="m-0 max-w-sm text-sm leading-6">
              Employee management made simple, organized, and accessible.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--sea-ink)]">
              Call us
            </h2>
            <p className="m-0 flex items-center gap-2 text-sm">
              <Phone
                aria-hidden="true"
                className="shrink-0 text-[var(--accent-text)]"
                size={16}
              />
              Phone number to be added
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--sea-ink)]">
              Visit us
            </h2>
            <p className="m-0 flex items-start gap-2 text-sm leading-6">
              <MapPin
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-[var(--accent-text)]"
                size={16}
              />
              Company address to be added
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--line)] pt-5 text-center sm:text-left">
          <p className="m-0 text-xs">
            &copy; {year} Firstmeta Infrastructure Solutions Private Limited.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
