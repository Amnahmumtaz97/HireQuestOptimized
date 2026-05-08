import type { Metadata } from 'next'
import { Fragment } from 'react'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ToastProvider } from '@/components/ui/toast'
import { NativeAppBridge } from '@/components/providers/NativeAppBridge'

export const metadata: Metadata = {
  title: 'HireQuest – Your Shortcut to Interview Success',
  description: 'AI-powered interview preparation made simple and effective. Practice with realistic mock interviews, get instant feedback, and land your dream role.',
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'HireQuest – Your Shortcut to Interview Success',
    description: 'AI-powered interview preparation made simple and effective.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Performance: preconnect to font origin */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Performance: prevent flash of wrong theme (must run before hydration) */}
        <Fragment dangerouslySetInnerHTML={{__html: '<script>(function(){try{var t=localStorage.getItem("hirequest.theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;}else if(window.matchMedia("(prefers-color-scheme: light)").matches){document.documentElement.dataset.theme="light";}}catch(e){}})();</script>'}} />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <SessionProvider>
              <NativeAppBridge />
              {children}
            </SessionProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
