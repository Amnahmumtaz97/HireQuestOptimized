/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        mono: ['Manrope', 'sans-serif'],
      },
      spacing: {
        13: '3.25rem',
      },
      colors: {
        'hq-purple': 'var(--hq-purple)',
        'hq-blue': 'var(--hq-blue)',
        'hq-cyan': 'var(--hq-cyan)',
        'hq-green': 'var(--hq-green)',
        'hq-amber': 'var(--hq-amber)',
        'hq-red': 'var(--hq-red)',
        'hq-dark': 'var(--hq-dark)',
        'hq-darker': 'var(--hq-darker)',
        'hq-card': 'var(--hq-card)',
        'hq-surface': 'var(--hq-stat-surface)',
        'hq-surface-light': 'var(--hq-row-elevated)',
        'hq-border': 'var(--hq-border)',
        'hq-stat-surface': 'var(--hq-stat-surface)',
        'hq-row-elevated': 'var(--hq-row-elevated)',
        'hq-text-dim': 'var(--hq-text-dim)',
        'hq-text-faint': 'var(--hq-text-faint)',
        'hq-display-blue': 'var(--hq-display-blue)',
        'hq-accent2': 'var(--hq-accent2)',
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.6s ease-out both',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 8s linear infinite',
        orbit: 'orbit 18s linear infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'bar-wave': 'bar-wave 1.2s ease-in-out infinite',
        'brain-glow': 'brain-glow 3s ease-in-out infinite',
        'live-pulse': 'live-pulse 2s ease-in-out infinite',
        'testimonials-marquee': 'testimonials-marquee 50s linear infinite',
        'neon-glow': 'neon-glow 2s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'glow-border': 'glow-border 3s ease-in-out infinite',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow:
              '0 0 30px -5px color-mix(in oklab, var(--primary) 50%, transparent), 0 0 60px -10px color-mix(in oklab, var(--primary-glow) 35%, transparent)',
          },
          '50%': {
            boxShadow:
              '0 0 50px -5px color-mix(in oklab, var(--primary) 70%, transparent), 0 0 90px -10px color-mix(in oklab, var(--primary-glow) 55%, transparent)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(80px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(80px) rotate(-360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        'bar-wave': {
          '0%, 100%': { height: '30%' },
          '50%': { height: '100%' },
        },
        'brain-glow': {
          '0%, 100%': {
            boxShadow: '0 0 40px rgba(59,130,246,0.4), 0 0 80px rgba(34,211,238,0.15)',
          },
          '50%': {
            boxShadow: '0 0 60px rgba(59,130,246,0.6), 0 0 120px rgba(34,211,238,0.25)',
          },
        },
        'live-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'testimonials-marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'neon-glow': {
          '0%, 100%': { 
            textShadow: '0 0 10px rgba(124, 58, 237, 0.5), 0 0 20px rgba(79, 110, 247, 0.3)',
          },
          '50%': { 
            textShadow: '0 0 20px rgba(124, 58, 237, 0.8), 0 0 40px rgba(79, 110, 247, 0.5)',
          },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'glow-border': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3), inset 0 0 20px rgba(124, 58, 237, 0.1)',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(124, 58, 237, 0.6), inset 0 0 30px rgba(124, 58, 237, 0.2)',
          },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
