import { Suspense } from 'react'
import { NewInterviewPageClient } from '@/components/app/interview/NewInterviewPageClient'
import { BounceLoader } from '@/components/ui/bounce-loader'

export const metadata = {
  title: 'New Interview — HireQuest',
}

export default function NewInterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <BounceLoader label="Loading" />
        </div>
      }
    >
      <NewInterviewPageClient />
    </Suspense>
  )
}
