'use client'

import { DotLottieReact } from '@lottiefiles/dotlottie-react'

type DashboardRobotLottieProps = {
  className?: string
  ariaLabel?: string
}

export function DashboardRobotLottie({
  className = '',
  ariaLabel = 'Animated robot assistant',
}: DashboardRobotLottieProps) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={[
        'pointer-events-none hidden shrink-0 sm:block',
        'h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32',
        className,
      ].join(' ')}
    >
      <DotLottieReact
        src="/Robot%20Automation%20Gif.lottie"
        loop
        autoplay
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
