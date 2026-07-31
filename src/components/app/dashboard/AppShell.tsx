'use client'

import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar'
import { SidebarNav } from '@/components/app/dashboard/SidebarNav'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

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

  return (
    <main className="hq-app min-h-screen bg-[var(--background)] transition-colors duration-200">
      <div
        className={[
          'grid min-h-screen grid-cols-1',
          shellGridCols,
          'transition-[grid-template-columns] duration-300 ease-out',
        ].join(' ')}
      >
        <div className="hidden min-h-full md:block">
          <SidebarNav collapsed={sidebarCollapsed} onToggleCollapsed={toggleCollapsed} />
        </div>

        <section className="min-w-0">
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

          <div className="min-w-0 p-3 sm:p-6 lg:p-8">{children}</div>
        </section>
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="h-dvh overflow-y-auto overscroll-contain">
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
