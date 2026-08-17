import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { MotionProvider } from '@/components/providers/MotionProvider'
import { ToastProvider } from '@/components/ui/toast'
import { authOptions } from '@/lib/auth'

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://hirequest.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'HireQuest – AI Interview Prep & IT Certifications',
    template: '%s | HireQuest',
  },
  description:
    'AI-powered interview preparation and IT certification guide. Practice coding, system design, behavioural & HR interviews with real-time AI feedback. Browse 70+ certifications from AWS, Google, Microsoft, CompTIA, ISC2 and more.',
  keywords: [
    'interview preparation', 'AI mock interview', 'coding interview practice',
    'system design interview', 'behavioural interview', 'technical interview',
    'IT certifications', 'free certifications', 'AWS certification', 'Google certification',
    'Microsoft Azure certification', 'CompTIA Security+', 'Kubernetes certification',
    'Terraform certification', 'HackerRank certificate', 'software engineer interview',
    'data science interview', 'DevOps interview prep', 'career development',
  ],
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'HireQuest – AI Interview Prep & IT Certifications',
    description:
      'AI-powered interview preparation and IT certification guide for software engineers, data scientists, and DevOps engineers.',
    type: 'website',
    url: BASE_URL,
    siteName: 'HireQuest',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HireQuest – AI Interview Prep & IT Certifications',
    description: 'Practice AI-powered mock interviews and browse 70+ IT certifications.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1 },
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning data-theme="dark" data-scroll-behavior="smooth">
      <head>
        {/* Performance: preconnect to font origin */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <SessionProvider session={session}>
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
