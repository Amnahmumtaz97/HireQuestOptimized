'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CreateInterviewWizard } from '@/components/app/UserDashboard'
import { PathInterviewCreate } from '@/components/app/interview/PathInterviewCreate'
import type { LearningStage, UserPathProgress } from '@/components/app/learning-paths/types'

export function NewInterviewPageClient() {
  const sp = useSearchParams()
  const mode = sp.get('mode')
  const pathId = sp.get('pathId')
  const stageId = sp.get('stageId')
  const remediationId = sp.get('remediationId')
  const focusResume = mode === 'resume' || sp.get('focus') === 'resume'

  const [stagePrefill, setStagePrefill] = useState<LearningStage | null>(null)
  const [pathTitle, setPathTitle] = useState<string | null>(null)
  const [loadingStage, setLoadingStage] = useState(Boolean(pathId && stageId && mode === 'path'))

  useEffect(() => {
    if (mode !== 'path' || !pathId || !stageId) {
      setStagePrefill(null)
      setPathTitle(null)
      setLoadingStage(false)
      return
    }
    let cancelled = false
    async function load() {
      setLoadingStage(true)
      try {
        const res = await fetch(`/api/paths/${pathId}`)
        const data = await res.json()
        if (!res.ok || cancelled) return
        setPathTitle(data.path?.title ?? null)
        let stage = (data.path?.stages as LearningStage[] | undefined)?.find(
          (s) => s.id === stageId,
        )
        const progress = data.progress as UserPathProgress | null
        const rem =
          remediationId &&
          progress?.remediationQueue?.find((r) => r.id === remediationId)
        if (stage && rem) {
          stage = {
            ...stage,
            title: rem.title,
            suggestedTopics: rem.topics,
            departmentKey: rem.departmentKey || stage.departmentKey,
            specializationKeys: rem.specializationKeys || stage.specializationKeys,
            interviewType: rem.interviewType || stage.interviewType,
            difficulty: rem.difficulty || stage.difficulty,
            totalQuestions: rem.totalQuestions || stage.totalQuestions,
            technicalQuestionRatio:
              rem.technicalQuestionRatio ?? stage.technicalQuestionRatio,
          }
        }
        setStagePrefill(stage ?? null)
      } catch {
        if (!cancelled) {
          setStagePrefill(null)
          setPathTitle(null)
        }
      } finally {
        if (!cancelled) setLoadingStage(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [mode, pathId, stageId, remediationId])

  if (mode === 'path') {
    if (loadingStage) return null
    if (!pathId || !stageId || !stagePrefill) {
      return (
        <p className="text-sm text-red-400">
          Path stage could not be loaded. Open the stage again from your learning path.
        </p>
      )
    }
    return (
      <PathInterviewCreate
        pathId={pathId}
        stageId={stageId}
        pathTitle={pathTitle}
        stage={stagePrefill}
        pathRemediationId={remediationId}
      />
    )
  }

  return (
    <CreateInterviewWizard
      entryMode={focusResume ? 'resume' : 'manual'}
      learningPathId={pathId}
      learningStageId={stageId}
      stagePrefill={stagePrefill}
      focusResumeSection={focusResume}
    />
  )
}

