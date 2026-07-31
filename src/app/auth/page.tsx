import { SlidingAuth } from '@/components/auth/SlidingAuth'
import { getEnabledOAuthProviders } from '@/lib/oauth-config'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Sign In / Sign Up — HireQuest',
  description: 'Sign in or create your HireQuest account to start AI-powered interview preparation.',
}

export default function AuthPage() {
  const oauth = getEnabledOAuthProviders()
  return <SlidingAuth oauth={oauth} />
}
