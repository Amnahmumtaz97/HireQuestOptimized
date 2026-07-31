import Link from 'next/link'

const footerLinks = [
  { label: 'Product', href: '/product' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/features' },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden pt-14 pb-10">
      <div className="footer-glow" aria-hidden />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18), transparent 70%)',
          filter: 'blur(70px)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.16), transparent 70%)',
          filter: 'blur(60px)',
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between pb-9"
          style={{
            borderBottom: '1px solid transparent',
            borderImage:
              'linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--border) 80%, transparent) 50%, transparent 100%) 1',
          }}
        >
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="hq-marketing-logo-mark !h-[26px] !min-w-[30px] !w-auto px-1 !text-[10px]">
              HQ
            </span>
            <span className="text-[19px] font-extrabold tracking-[-0.02em] text-foreground">
              HireQuest
            </span>
          </Link>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="inline-flex min-h-10 items-center py-2 text-[14.5px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {['𝕏', 'in', 'gh'].map((label) => (
              <a
                key={label}
                href="#"
                className="grid h-10 w-10 place-items-center rounded-[9px] border border-border text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-[var(--secondary)] hover:text-foreground"
                aria-label={label}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 text-[13.5px] text-muted-foreground">
          <span>© {new Date().getFullYear()} HireQuest. All rights reserved.</span>
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/privacy" className="inline-flex min-h-10 items-center py-2 transition-colors hover:text-foreground">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="inline-flex min-h-10 items-center py-2 transition-colors hover:text-foreground">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
