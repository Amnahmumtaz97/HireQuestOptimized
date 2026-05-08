import { SlidingAuth } from '@/components/auth/SlidingAuth'

export const metadata = {
  title: 'Sign In / Sign Up — HireQuest',
  description: 'Sign in or create your HireQuest account to start AI-powered interview preparation.',
}

export default function AuthPage() {
  return <SlidingAuth />
}
