'use client'

import type { ReactNode } from 'react'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar'
import { SidebarNav } from '@/components/app/dashboard/SidebarNav'
import { PageGuidanceToasts } from '@/components/app/guidance/PageGuidanceToasts'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const isInterviewWorkspace =
    Boolean(pathname?.match(/^\/app\/interviews\/[^/]+$/)) &&
    !pathname?.endsWith('/results')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('hirequest.sidebar.collapsed')
      if (saved === '1') setSidebarCollapsed(true)
    } catch {
      // ignore
    }
  }, [])

  const setCollapsed = useCallback((next: boolean) => {
    setSidebarCollapsed(next)
    try {
      window.localStorage.setItem('hirequest.sidebar.collapsed', next ? '1' : '0')
    } catch {
      // ignore
    }
  }, [])

  const toggleCollapsed = useCallback(() => setCollapsed(!sidebarCollapsed), [setCollapsed, sidebarCollapsed])

  const shellGridCols = useMemo(() => {
    if (sidebarCollapsed) return 'md:grid-cols-[72px_1fr]'
    return 'md:grid-cols-[260px_1fr] lg:grid-cols-[272px_1fr]'
  }, [sidebarCollapsed])

  if (isInterviewWorkspace) {
    return (
      <main className="hq-app hq-interview-app-shell min-h-dvh bg-[var(--background)] transition-colors duration-200">
        <Suspense fallback={null}>
          <PageGuidanceToasts />
        </Suspense>
        {children}
      </main>
    )
  }

  return (
    <main className="hq-app min-h-dvh bg-[var(--background)] transition-colors duration-200">
      <Suspense fallback={null}>
        <PageGuidanceToasts />
      </Suspense>
      <div
        className={[
          'grid grid-cols-1',
          shellGridCols,
          'transition-[grid-template-columns] duration-300 ease-out',
        ].join(' ')}
        style={{ minHeight: '100dvh' }}
      >
        {/* Spacer column — reserves the grid slot so content is properly offset */}
        <div className="hidden md:block" aria-hidden />

        {/* Docked sidebar — flush to the left edge, full viewport height */}
        <div
          className={[
            'hq-app-sidebar-col z-30 hidden md:fixed md:inset-y-0 md:left-0 md:block',
            sidebarCollapsed ? 'w-[72px]' : 'w-[260px] lg:w-[272px]',
            'transition-[width] duration-300 ease-out',
          ].join(' ')}
          data-lenis-prevent
        >
          <SidebarNav collapsed={sidebarCollapsed} onToggleCollapsed={toggleCollapsed} />
        </div>

        <section className="flex min-w-0 flex-col">
          <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
            <div className="px-3 py-2 sm:px-4 sm:py-2.5">
              <DashboardNavbar
                onMobileNavOpen={() => setMobileSidebarOpen(true)}
                onToggleSidebarCollapse={toggleCollapsed}
                sidebarCollapsed={sidebarCollapsed}
                variant="in-shell"
              />
            </div>
            <div className="px-3 sm:px-4">
              <OfflineBanner />
            </div>
          </div>

          <div
            className={[
              'mx-auto min-w-0 w-full flex-1',
              isInterviewWorkspace
                ? 'max-w-none p-2 sm:p-4 lg:p-5'
                : 'max-w-[1600px] p-3 sm:p-6 lg:p-8',
            ].join(' ')}
          >
            {children}
          </div>
        </section>
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="h-dvh w-[min(92vw,272px)] gap-0 border-0 bg-transparent p-0 shadow-none">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto overscroll-contain">
            <SidebarNav
              collapsed={false}
              onToggleCollapsed={() => undefined}
              onNavigate={() => setMobileSidebarOpen(false)}
              variant="mobile"
            />
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}
