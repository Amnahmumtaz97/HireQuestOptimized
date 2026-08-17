'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type FC, type MouseEvent } from 'react'
import {
  LayoutDashboard,
  LineChart,
  User,
  CreditCard,
  Settings,
  Plus,
  ChevronsLeft,
  ChevronDown,
  Route,
  Library,
  Tag,
  ListFilter,
  FileText,
  Award,
  Bookmark,
  Crown,
  ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type SidebarSubItem = {
  href: string
  label: string
  icon?: LucideIcon
}

export type SidebarNavItem = {
  href: string
  label: string
  icon: LucideIcon
  subItems?: SidebarSubItem[]
}

type SidebarGroup = {
  label: string
  /** When true, the section heading is a dropdown that reveals its items */
  collapsible?: boolean
  items: SidebarNavItem[]
}

const ctaItem = { href: '/app/new-interview', label: 'New Interview', icon: Plus }

const sidebarGroups: SidebarGroup[] = [
  {
    label: 'Prepare',
    items: [
      { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Track',
    items: [
      { href: '/app/interviews', label: 'My Interviews', icon: ListFilter },
      { href: '/app/results', label: 'Results', icon: FileText },
      { href: '/app/analytics', label: 'Analytics', icon: LineChart },
      { href: '/app/bookmarks', label: 'Bookmarks', icon: Bookmark },
    ],
  },
  {
    label: 'Learning Paths',
    collapsible: true,
    items: [
      { href: '/app/learning-paths', label: 'Overview', icon: Route },
      { href: '/app/learning-paths/categories', label: 'Categories', icon: Tag },
      { href: '/app/learning-paths/catalog', label: 'Full Catalog', icon: Library },
      { href: '/app/learning-paths/certifications', label: 'Certifications', icon: Award },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/app/profile', label: 'Profile', icon: User },
      { href: '/app/billing', label: 'Billing', icon: CreditCard },
      { href: '/app/settings', label: 'Settings', icon: Settings },
    ],
  },
]

function isGroupActive(pathname: string, item: SidebarNavItem): boolean {
  if (pathname === item.href) return true
  if (item.subItems?.some((s) => pathname === s.href || pathname.startsWith(s.href + '/'))) return true
  if (item.href === '/app/learning-paths' && pathname === '/app/learning-paths') return true
  if (item.href === '/app/learning-paths/categories' && pathname.startsWith('/app/learning-paths/categories')) return true
  if (item.href === '/app/learning-paths/certifications' && pathname.startsWith('/app/learning-paths/certifications')) return true
  if (item.href === '/app/interviews' && pathname.startsWith('/app/interviews') && !pathname.endsWith('/results')) return true
  if (item.href === '/app/billing' && (pathname.startsWith('/app/subscription') || pathname.startsWith('/app/invoices'))) return true
  if (item.href === '/app/results' && ((pathname.startsWith('/app/interviews/') && pathname.endsWith('/results')) || pathname === '/app/results')) return true
  return false
}

function isSubActive(pathname: string, sub: SidebarSubItem): boolean {
  if (sub.href === '/app/interviews') return (
    pathname === '/app/interviews' || (pathname.startsWith('/app/interviews/') && !pathname.endsWith('/results'))
  )
  if (sub.href === '/app/results') return (
    (pathname.startsWith('/app/interviews/') && pathname.endsWith('/results')) || pathname === '/app/results'
  )
  if (sub.href === '/app/learning-paths') return pathname === '/app/learning-paths'
  if (sub.href === '/app/learning-paths/categories') return pathname.startsWith('/app/learning-paths/categories')
  if (sub.href === '/app/learning-paths/catalog') return pathname === '/app/learning-paths/catalog'
  if (sub.href === '/app/learning-paths/certifications') return pathname.startsWith('/app/learning-paths/certifications')
  if (sub.href === '/app/new-interview') return pathname.startsWith('/app/new-interview')
  return pathname === sub.href || pathname.startsWith(sub.href + '/')
}

function isSectionActive(pathname: string, group: SidebarGroup): boolean {
  return group.items.some((item) => isGroupActive(pathname, item) || isSubActive(pathname, item))
}

export type SidebarNavProps = {
  collapsed: boolean
  onToggleCollapsed: () => void
  onNavigate?: () => void
  variant?: 'desktop' | 'mobile'
}

function defaultOpenKeys(pathname: string): string[] {
  return sidebarGroups
    .filter((group) => group.collapsible && isSectionActive(pathname, group))
    .map((group) => group.label)
}

export const SidebarNav: FC<SidebarNavProps> = ({
  collapsed,
  onToggleCollapsed,
  onNavigate,
  variant = 'desktop',
}) => {
  const pathname = usePathname() ?? ''
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const keys = new Set(defaultOpenKeys(pathname))
    keys.add('Learning Paths')
    return [...keys]
  })

  // Keep the active section open when the route changes
  useEffect(() => {
    const active = defaultOpenKeys(pathname)
    if (active.length === 0) return
    setOpenKeys((prev) => {
      const next = new Set(prev)
      for (const key of active) next.add(key)
      return [...next]
    })
  }, [pathname])

  function toggleGroup(href: string) {
    setOpenKeys((prev) =>
      prev.includes(href) ? prev.filter((k) => k !== href) : [...prev, href],
    )
  }

  function handleSidebarDoubleClick(e: MouseEvent<HTMLElement>) {
    if (variant !== 'desktop') return
    const target = e.target as HTMLElement | null
    if (target?.closest('a, button, input, textarea, select, [role="menuitem"]')) return
    onToggleCollapsed()
  }

  return (
    <aside
      className="hq-app-sidebar relative flex h-full w-full flex-col overflow-hidden"
      data-lenis-prevent
      onDoubleClick={handleSidebarDoubleClick}
    >
      <TooltipProvider delayDuration={160}>
        <div className={['flex h-full min-h-0 flex-col p-3', collapsed ? 'items-center' : ''].join(' ')}>

          {/* ── Brand + collapse ── */}
          <div
            className={[
              'flex shrink-0 w-full items-center justify-between gap-2 px-1 pb-3 pt-1',
              collapsed ? 'justify-center' : '',
            ].join(' ')}
          >
            {!collapsed ? (
              <Link
                href="/"
                className="flex min-w-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/40"
              >
                <span className="hq-app-sidebar-mark inline-flex h-8 min-w-[2rem] items-center justify-center rounded-[8px] px-1 text-[10px] font-extrabold tracking-[-0.04em]">
                  HQ
                </span>
                <div className="min-w-0 leading-tight">
                  <div className="hq-app-sidebar-brand truncate text-[13px] font-semibold">HireQuest</div>
                  <div className="hq-app-sidebar-sub truncate text-[10px]">AI Interview Studio</div>
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
                      'hq-app-sidebar-icon-btn inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      collapsed ? 'mt-0.5' : '',
                    ].join(' ')}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  >
                    <ChevronsLeft
                      className={['h-3.5 w-3.5 transition-transform', collapsed ? 'rotate-180' : ''].join(' ')}
                      aria-hidden
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{collapsed ? 'Expand' : 'Collapse'}</TooltipContent>
              </Tooltip>
            ) : null}
          </div>

          {/* ── New Interview (always at top) ── */}
          {collapsed ? (
            <div className="flex w-full shrink-0 flex-col items-center pb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={ctaItem.href}
                    onClick={() => onNavigate?.()}
                    className="hq-app-sidebar-cta--icon"
                    aria-label={ctaItem.label}
                  >
                    <Plus className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{ctaItem.label}</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="w-full shrink-0 px-0.5 pb-3">
              <Link
                href={ctaItem.href}
                onClick={() => onNavigate?.()}
                className="hq-app-sidebar-cta"
              >
                <span className="hq-app-sidebar-cta-icon inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md">
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span>{ctaItem.label}</span>
              </Link>
            </div>
          )}

          {/* ── Navigation ── */}
          {collapsed ? (
            /* Collapsed: icons only */
            <div className="hq-app-sidebar-scroll flex w-full min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto pt-1">
              {sidebarGroups.flatMap((g) => g.items).map((item) => {
                const Icon = item.icon
                const isActive = isGroupActive(pathname, item)
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        onClick={() => onNavigate?.()}
                        className={[
                          'group relative inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/35',
                          isActive
                            ? 'hq-app-sidebar-link hq-app-sidebar-link--active'
                            : 'hq-app-sidebar-link',
                        ].join(' ')}
                        aria-label={item.label}
                      >
                        <span
                          className={[
                            'hq-app-sidebar-link-icon relative inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                            isActive ? 'is-active' : '',
                          ].filter(Boolean).join(' ')}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          ) : (
            /* Expanded: grouped nav */
            <nav className="hq-app-sidebar-scroll flex min-h-0 w-full flex-1 flex-col gap-3 overflow-y-auto pr-0.5" aria-label="App navigation">
              {sidebarGroups.map((group) => {
                const isOpen = !group.collapsible || openKeys.includes(group.label)

                return (
                  <div key={group.label}>
                    {group.collapsible ? (
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.label)}
                        aria-expanded={isOpen}
                        className="hq-sidebar-section-label mb-1 flex w-full items-center justify-between gap-2 px-2 text-[9px] font-bold uppercase tracking-[0.14em]"
                      >
                        <span>{group.label}</span>
                        <ChevronDown
                          className={[
                            'h-3 w-3 shrink-0 opacity-70 transition-transform duration-200',
                            isOpen ? 'rotate-0' : '-rotate-90',
                          ].join(' ')}
                          aria-hidden
                        />
                      </button>
                    ) : (
                      <div className="hq-sidebar-section-label mb-1 px-2 text-[9px] font-bold uppercase tracking-[0.14em]">
                        {group.label}
                      </div>
                    )}

                    <div
                      className={
                        group.collapsible
                          ? ['grid transition-all duration-200 ease-in-out', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'].join(' ')
                          : ''
                      }
                    >
                      <div className={group.collapsible ? 'overflow-hidden' : ''}>
                        <div className="space-y-px">
                          {group.items.map((item) => {
                            const Icon = item.icon
                            const groupActive = isGroupActive(pathname, item) || isSubActive(pathname, item)

                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => onNavigate?.()}
                                className={[
                                  'group relative flex w-full min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-semibold transition-colors',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/35',
                                  groupActive
                                    ? 'hq-app-sidebar-link hq-app-sidebar-link--active'
                                    : 'hq-app-sidebar-link',
                                ].join(' ')}
                              >
                                <span
                                  className={[
                                    'hq-app-sidebar-link-icon relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                                    groupActive ? 'is-active' : '',
                                  ].filter(Boolean).join(' ')}
                                  aria-hidden
                                >
                                  <Icon className="h-4 w-4" />
                                </span>
                                <span className="relative min-w-0 truncate">{item.label}</span>
                                {groupActive ? (
                                  <span className="hq-sidebar-sub-dot ml-auto h-1.5 w-1.5 shrink-0 rounded-full" />
                                ) : null}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </nav>
          )}

          {collapsed ? (
            <div className="mt-auto flex w-full shrink-0 flex-col items-center pt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/app/billing"
                    onClick={() => onNavigate?.()}
                    className="hq-app-sidebar-upgrade--icon"
                    aria-label="Upgrade to Pro"
                  >
                    <Crown className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Upgrade to Pro</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="mt-auto w-full shrink-0 px-0.5 pt-3">
              <Link
                href="/app/billing"
                onClick={() => onNavigate?.()}
                className="hq-app-sidebar-upgrade"
              >
                <span className="hq-app-sidebar-upgrade-icon">
                  <Crown className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold leading-tight">Upgrade to Pro</span>
                  <span className="block text-[11px] font-medium opacity-70">Unlock all features</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
              </Link>
            </div>
          )}
        </div>
      </TooltipProvider>
    </aside>
  )
}
