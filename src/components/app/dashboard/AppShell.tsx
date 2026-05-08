'use client'

import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar'
import { SidebarNav } from '@/components/app/dashboard/SidebarNav'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'

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
    if (sidebarCollapsed) return 'grid-cols-[84px,1fr] lg:grid-cols-[92px,1fr]'
    return 'grid-cols-[260px,1fr] lg:grid-cols-[288px,1fr]'
  }, [sidebarCollapsed])

  return (
    <main className="min-h-screen px-3 pb-10 pt-6 sm:px-6">
      <div className="mx-auto w-full max-w-[92rem]">
        <div className="hq-app relative overflow-hidden rounded-[1.85rem] border border-border glass-strong">
          <div className="pointer-events-none absolute inset-0 bg-mesh opacity-30" aria-hidden />
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-35" aria-hidden />

          <div className="relative flex flex-col">
            <div className="sticky top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
              <DashboardNavbar
                onMobileNavOpen={() => setMobileSidebarOpen(true)}
                onToggleSidebarCollapse={toggleCollapsed}
                sidebarCollapsed={sidebarCollapsed}
                variant="in-shell"
              />
            </div>

            <div
              className={[
                'relative grid min-h-[calc(100vh-96px)]',
                shellGridCols,
                'transition-[grid-template-columns] duration-300 ease-out',
              ].join(' ')}
            >
              <div className="hidden md:block">
                <div className="sticky top-[92px] h-[calc(100vh-120px)]">
                  <ScrollArea className="h-full">
                    <div className="p-3">
                      <SidebarNav collapsed={sidebarCollapsed} onToggleCollapsed={toggleCollapsed} />
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <section className="min-w-0">
                <div className="sticky top-[92px] z-30 px-5 sm:px-6 lg:px-8">
                  <OfflineBanner />
                </div>
                <div className="p-5 sm:p-6 lg:p-8">{children}</div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0">
          <SheetHeader className="border-b border-border/60">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="px-3 pb-5 pt-3">
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
