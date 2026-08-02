import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { MotionProvider } from '@/components/providers/MotionProvider'
import { ToastProvider } from '@/components/ui/toast'

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
    <html lang="en" suppressHydrationWarning data-theme="dark" data-scroll-behavior="smooth">
      <head>
        {/* Performance: preconnect to font origin */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <SessionProvider>
              <MotionProvider>
                {children}
              </MotionProvider>
            </SessionProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
