'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MessageSquare,
  BarChart2,
  LineChart,
  User,
  CreditCard,
  Settings,
  Plus,
  ChevronsLeft,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FC } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type SidebarNavItem = {
  href: string
  label: string
  icon: LucideIcon
  primary?: boolean
}

export const sidebarNavItems: SidebarNavItem[] = [
  { href: '/app/new-interview', label: 'New Interview', icon: Plus, primary: true },
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/interviews', label: 'Interviews', icon: MessageSquare },
  { href: '/app/results', label: 'Results', icon: BarChart2 },
  { href: '/app/analytics', label: 'Analytics', icon: LineChart },
  { href: '/app/profile', label: 'Profile', icon: User },
  { href: '/app/billing', label: 'Billing', icon: CreditCard },
  { href: '/app/settings', label: 'Settings', icon: Settings },
]

function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true
  if (href === '/app/interviews' && pathname.startsWith('/app/interviews')) return true
  if (href === '/app/results' && pathname.startsWith('/app/interviews/') && pathname.endsWith('/results')) return true
  if (href === '/app/billing' && (pathname.startsWith('/app/subscription') || pathname.startsWith('/app/invoices'))) return true
  return false
}

export type SidebarNavProps = {
  collapsed: boolean
  onToggleCollapsed: () => void
  onNavigate?: () => void
  variant?: 'desktop' | 'mobile'
}

export const SidebarNav: FC<SidebarNavProps> = ({
  collapsed,
  onToggleCollapsed,
  onNavigate,
  variant = 'desktop',
}) => {
  const pathname = usePathname() ?? ''

  return (
    <aside className="hq-app-sidebar relative flex h-full min-h-full w-full flex-col">
      <TooltipProvider delayDuration={160}>
        <div className={['flex h-full flex-col p-3.5', collapsed ? 'items-center' : ''].join(' ')}>
          <div
            className={[
              'flex w-full items-center justify-between gap-2 px-1 pb-6 pt-1',
              collapsed ? 'justify-center' : '',
            ].join(' ')}
          >
            {!collapsed ? (
              <Link href="/" className="flex min-w-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                <span className="hq-app-sidebar-mark inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-[10px] px-1.5 text-[11px] font-extrabold tracking-[-0.04em]">
                  HQ
                </span>
                <div className="min-w-0 leading-tight">
                  <div className="hq-app-sidebar-brand truncate text-sm font-semibold transition-opacity hover:opacity-90">
                    HireQuest
                  </div>
                  <div className="hq-app-sidebar-sub truncate text-[11px]">AI Interview Studio</div>
                </div>
              </Link>
            ) : null}

            {variant === 'desktop' ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onToggleCollapsed}
                    className={[
                      'hq-app-sidebar-icon-btn inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      collapsed ? 'mt-0.5' : '',
                    ].join(' ')}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  >
                    <ChevronsLeft
                      className={['h-4 w-4 transition-transform', collapsed ? 'rotate-180' : ''].join(' ')}
                      aria-hidden
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{collapsed ? 'Expand' : 'Collapse'}</TooltipContent>
              </Tooltip>
            ) : null}
          </div>

          <div className="relative w-full space-y-2.5 pt-2">
            {sidebarNavItems.map((item) => {
              const isActive = isNavActive(pathname, item.href)
              const Icon = item.icon
              const baseClasses = [
                'group relative flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35',
                collapsed ? 'justify-center px-1.5' : '',
              ].join(' ')

                const selected = isActive && !item.primary

                const link = (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onNavigate?.()}
                    className={[
                      baseClasses,
                      item.primary
                        ? 'hq-app-sidebar-link hq-app-sidebar-link--primary mb-1.5'
                        : selected
                          ? 'hq-app-sidebar-link hq-app-sidebar-link--active'
                          : 'hq-app-sidebar-link',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'hq-app-sidebar-link-icon relative inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                        item.primary ? 'is-primary' : '',
                        selected ? 'is-active' : '',
                      ].filter(Boolean).join(' ')}
                      aria-hidden
                    >
                      <Icon className="h-5 w-5" />
                    </span>

                  {!collapsed ? <span className="relative min-w-0 truncate">{item.label}</span> : null}
                </Link>
              )

              if (!collapsed) return link

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            })}
          </div>

          {variant === 'desktop' && !collapsed ? (
            <div className="mt-auto w-full pt-6">
              <div className="hq-app-sidebar-tip rounded-xl p-3">
                <div className="hq-app-sidebar-tip-title text-xs font-semibold">Pro Tip</div>
                <div className="hq-app-sidebar-tip-body mt-1 text-[11px] leading-relaxed">
                  Be specific with your role and topics to get the most relevant questions.
                </div>
                <Link
                  href="/app/new-interview"
                  className="hq-app-sidebar-tip-btn mt-3 inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  View Best Practices
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </TooltipProvider>
    </aside>
  )
}
