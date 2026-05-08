'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Moon, Brain } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinks = ['Home', 'Features', 'Pricing', 'Contact']

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-4 right-4 z-50"
    >
      <div
        className={`navbar-glass rounded-2xl px-6 py-3 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'shadow-2xl' : ''
        }`}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2.5 cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Brain size={18} className="text-white" strokeWidth={2} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Hire<span className="text-blue-400">Quest</span>
          </span>
        </motion.div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <motion.a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors duration-200 relative group"
              whileHover={{ y: -1 }}
            >
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-400 group-hover:w-full transition-all duration-300" />
            </motion.a>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDark(!isDark)}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Moon size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(59,130,246,0.5)' }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary text-white text-sm font-semibold px-5 py-2 rounded-full"
          >
            Login
          </motion.button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 ml-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className={`w-5 h-0.5 bg-slate-300 transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-5 h-0.5 bg-slate-300 transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-0.5 bg-slate-300 transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="navbar-glass mt-2 rounded-2xl px-6 py-4 md:hidden flex flex-col gap-4"
        >
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link}
            </a>
          ))}
        </motion.div>
      )}
    </motion.nav>
  )
}
