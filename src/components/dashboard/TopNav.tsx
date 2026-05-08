"use client"

import { useState } from 'react'
import { Bell, Search, ChevronDown, SunMoon } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export function TopNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-lg font-semibold">Dashboard</div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="relative w-full max-w-lg">
            <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground"><Search className="h-4 w-4" /></span>
            <input aria-label="Search" placeholder="Search interviews, results..." className="w-full rounded-full border border-border bg-input/60 py-2 pl-10 pr-4 text-sm text-foreground focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-input/30">
            <Bell className="h-4 w-4" />
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-input/30">
            <SunMoon className="h-4 w-4" />
          </button>

          <div className="relative">
            <button onClick={() => setOpen((s) => !s)} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
              <Image src="/avatar-placeholder.png" alt="avatar" width={28} height={28} className="rounded-full" />
              <span className="hidden sm:inline text-sm">Hi Test User</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {open && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-2 w-48 rounded-lg bg-card p-2 shadow-lg">
                <a className="block px-3 py-2 text-sm text-foreground">Account Settings</a>
                <a className="block px-3 py-2 text-sm text-foreground">Logout</a>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopNav
