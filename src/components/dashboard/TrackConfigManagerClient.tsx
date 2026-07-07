'use client'

import dynamic from 'next/dynamic'

const TrackConfigManager = dynamic(
  () =>
    import('@/components/dashboard/TrackConfigManager').then((module) => module.TrackConfigManager),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[320px] items-center justify-center p-8 text-sm text-muted-foreground">
        Loading track configuration...
      </div>
    ),
  },
)

export function TrackConfigManagerClient() {
  return <TrackConfigManager />
}
