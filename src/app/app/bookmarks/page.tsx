import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import { BookmarksHubPage } from '@/components/app/bookmarks/BookmarksHubPage'

export const metadata = {
  title: 'Bookmarks — HireQuest',
}

export default function BookmarksRoute() {
  return (
    <>
      <DashboardPageHeader
        title="Bookmarks"
        description="Credentials, paths, and topics you saved for later."
        titleHighlight="accent"
        variant="dashboard"
      />
      <BookmarksHubPage />
    </>
  )
}
