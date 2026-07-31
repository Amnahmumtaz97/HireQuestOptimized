import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Account Settings — HireQuest',
}

export default function AccountSettingsPage() {
  redirect('/app/settings?tab=account')
}
