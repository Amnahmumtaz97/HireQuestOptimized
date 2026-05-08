'use client'

import { motion } from 'framer-motion'
import { Brain, Briefcase, GitFork, X } from 'lucide-react'

const footerLinks = {
  PRODUCT: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  COMPANY: ['About', 'Blog', 'Careers', 'Contact'],
  RESOURCES: ['Docs', 'Guides', 'Support', 'Community'],
}

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-800/60">
      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div
          className="rounded-2xl p-8 md:p-10"
          style={{
            background: 'rgba(7, 15, 30, 0.8)',
            border: '1px solid rgba(26,45,74,0.5)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
            {/* Brand column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Brain size={16} className="text-white" />
                </div>
                <span className="text-white font-bold text-lg">
                  Hire<span className="text-blue-400">Quest</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                AI-powered interview preparation that helps you practice smarter, get sharper feedback, and land the role.
              </p>
              {/* Social links */}
              <div className="flex items-center gap-3">
                {[
                  { icon: <X size={15} />, href: '#' },
                  { icon: <GitFork size={15} />, href: '#' },
                  { icon: <Briefcase size={15} />, href: '#' },
                ].map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    whileHover={{ scale: 1.15, backgroundColor: 'rgba(59,130,246,0.2)', borderColor: 'rgba(59,130,246,0.5)' }}
                    className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <h4 className="text-slate-300 text-xs font-bold tracking-widest uppercase mb-5">{section}</h4>
                <ul className="flex flex-col gap-3">
                  {links.map((link) => (
                    <li key={link}>
                      <motion.a
                        href="#"
                        whileHover={{ x: 3 }}
                        className="text-slate-400 hover:text-white text-sm transition-colors duration-200 inline-block"
                      >
                        {link}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">© 2026 HireQuest. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {['Privacy', 'Terms', 'Security'].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  whileHover={{ color: '#e2e8f0' }}
                  className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-200"
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
