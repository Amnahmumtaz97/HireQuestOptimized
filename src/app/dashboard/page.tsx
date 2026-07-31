export const metadata = {
  title: 'Admin Dashboard — HireQuest',
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen px-4 pb-10 pt-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="glass-strong border-glass-strong relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-mesh opacity-20" aria-hidden />
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-25" aria-hidden />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-glass bg-input/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Admin
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Admin Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Manage interview configuration, review platform status, and tune question generation settings.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <a
                href="/dashboard/track-config"
                className="dashboard-card p-6 hover-lift block"
              >
                <div className="text-sm font-semibold text-foreground">Track Config</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Edit industries, roles, topics, ratios and durations.
                </div>
                <div className="mt-4 text-xs text-primary-glow">Open manager →</div>
              </a>

              <a
                href="/app/settings?tab=account"
                className="dashboard-card p-6 hover-lift block"
              >
                <div className="text-sm font-semibold text-foreground">Settings</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Update profile details and security preferences.
                </div>
                <div className="mt-4 text-xs text-primary-glow">Open settings →</div>
              </a>

              <div className="dashboard-card p-6">
                <div className="text-sm font-semibold text-foreground">System status</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Builds are healthy. API routes are available. PWA is enabled.
                </div>
                <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.75)]" aria-hidden />
                  Online
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
