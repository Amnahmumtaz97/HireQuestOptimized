import { useEffect, useMemo, useState } from 'react'
import type { InterviewConfig } from '@/components/app/dashboard/types'

export type InterviewConfigState = {
  configs: InterviewConfig[]
  isLoadingConfig: boolean
  configError: string
  selectedIndustry: InterviewConfig | null
}

export function useInterviewConfig(industryKey: string): InterviewConfigState {
  const [configs, setConfigs] = useState<InterviewConfig[]>([])
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [configError, setConfigError] = useState('')

  useEffect(() => {
    let isMounted = true
    async function loadConfig(): Promise<void> {
      setIsLoadingConfig(true)
      setConfigError('')
      try {
        const response = await fetch('/api/interview-config')
        const data = await response.json()
        if (!response.ok) {
          if (isMounted) setConfigError((data.message ?? 'Failed to load interview options') as string)
          return
        }
        if (isMounted) setConfigs((data.configs ?? []) as InterviewConfig[])
      } catch {
        if (isMounted) setConfigError('Failed to load interview options')
      } finally {
        if (isMounted) setIsLoadingConfig(false)
      }
    }
    void loadConfig()
    return () => {
      isMounted = false
    }
  }, [])

  const selectedIndustry = useMemo(
    () => configs.find((c) => c.industryKey === industryKey) ?? null,
    [configs, industryKey],
  )

  return { configs, isLoadingConfig, configError, selectedIndustry }
}

