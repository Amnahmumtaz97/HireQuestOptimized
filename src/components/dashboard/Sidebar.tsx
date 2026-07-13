"use client"

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PlusCircle,
  Grid,
  FileText,
  PieChart,
  DollarSign,
  User,
  Settings,
  Menu,
  ChevronLeft,
} from 'lucide-react'

const items = [
  { key: 'new', label: 'New Interview', href: '/app/new-interview', icon: PlusCircle },
  { key: 'dashboard', label: 'App Dashboard', href: '/app/dashboard', icon: Grid },
  { key: 'interviews', label: 'Interviews', href: '/app/interviews', icon: FileText },
  { key: 'results', label: 'Results', href: '/app/results', icon: PieChart },
  { key: 'invoices', label: 'Invoices', href: '/app/invoices', icon: DollarSign },
  { key: 'profile', label: 'Profile', href: '/app/profile', icon: User },
  { key: 'settings', label: 'Settings', href: '/app/settings', icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`relative z-20 flex flex-col ${collapsed ? 'w-20' : 'w-64'} transition-width duration-300`}>
      <div className="flex h-full min-h-screen flex-col gap-4 bg-transparent px-3 py-4">
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-primary to-primary-glow p-1 shadow-glow-strong">
              <div className="h-9 w-9 rounded-[10px] bg-[#071027] flex items-center justify-center text-white font-bold">HQ</div>
            </div>
            {!collapsed && <div className="text-lg font-semibold">HireQuest</div>}
          </div>
          <button
            aria-label="Toggle sidebar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-input/30"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <nav className="mt-3 flex flex-1 flex-col gap-2">
          {items.map((it) => {
            const Icon = it.icon
            return (
              <motion.div key={it.key} whileHover={{ scale: 1.02 }}>
                <Link
                  href={it.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent ${collapsed ? 'justify-center' : ''}`}
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/3 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  {!collapsed && <span className="truncate">{it.label}</span>}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        <div className="mt-auto px-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-white shadow-[0_10px_30px_-12px_rgba(79,110,247,0.6)]"
          >
            <span className="absolute -inset-1 rounded-2xl opacity-30 blur-lg" style={{ background: 'linear-gradient(90deg,#0031b0,#1e5af3)' }} />
            <PlusCircle className="z-10 h-5 w-5" />
            <span className="z-10 font-semibold">New Interview</span>
          </motion.button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
