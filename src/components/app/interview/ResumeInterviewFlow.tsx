'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ResumeUpload } from '@/components/app/ResumeUpload'
import { ConfigureInterviewScreen } from '@/components/app/interview/ConfigureInterviewScreen'
import { BounceLoader } from '@/components/ui/bounce-loader'
import type { ResumeParseResult } from '@/lib/resume/schema'
import type { InterviewSetupConfig } from '@/lib/interview-config/setup-types'
import { buildSetupFromResume } from '@/lib/interview-config/from-resume'
import type { LearningStage } from '@/components/app/learning-paths/types'

type ResumeInterviewFlowProps = {
  pathId?: string | null
  stageId?: string | null
  stagePrefill?: LearningStage | null
  requireResume?: boolean
  entryMode?: 'resume' | 'path'
  pathRemediationId?: string | null
}

/**
 * Resume flow: upload → parse → Configure Your Interview → generate.
 * Does NOT generate questions immediately after parse.
 */
export function ResumeInterviewFlow({
  pathId = null,
  stageId = null,
  stagePrefill = null,
  requireResume = true,
  entryMode = 'resume',
  pathRemediationId = null,
}: ResumeInterviewFlowProps) {
  const [step, setStep] = useState<'upload' | 'configure'>('upload')
  const [resume, setResume] = useState<ResumeParseResult | null>(null)
  const [setup, setSetup] = useState<InterviewSetupConfig | null>(null)

  // Path mode without resume: still show configure with stage-suggested topics if any
  const startPathWithoutResume = () => {
    const topics = stagePrefill?.suggestedTopics?.filter(Boolean) || []
    const initial: InterviewSetupConfig = {
      targetRole: null,
      currentRole: null,
      yearsExperience: null,
      seniorityLevel: null,
      domain: stagePrefill?.departmentKey || null,
      education: null,
      degree: null,
      university: null,
      graduationYear: null,
      certifications: [],
      resumeRawText: null,
      programmingLanguages: [],
      frameworks: [],
      libraries: [],
      databases: [],
      cloudPlatforms: [],
      devOpsTools: [],
      operatingSystems: [],
      concepts: [],
      softSkills: [],
      extractedSkills: [],
      companies: [],
      internships: [],
      projects: [],
      achievements: [],
      categories: [],
      topics,
      difficulty: (stagePrefill?.difficulty as InterviewSetupConfig['difficulty']) || null,
      interviewRoundType:
        stagePrefill?.type === 'mock_interview' ? 'technical_screen' : 'technical_screen',
      targetCompanyType: null,
      preferredQuestionFormat: null,
      interviewDuration: 30,
      numberOfQuestions: stagePrefill?.totalQuestions || 12,
      language: 'English',
      focusAreas: [],
      excludedTopics: [],
      resumeParsedFields: topics.length ? ['topics'] : [],
      manuallyFilledFields: [],
    }
    setSetup(initial)
    setStep('configure')
  }

  const onParsed = (parsed: ResumeParseResult) => {
    setResume(parsed)
    setSetup(buildSetupFromResume(parsed))
    setStep('configure')
  }

  if (step === 'configure' && setup) {
    return (
      <ConfigureInterviewScreen
        initial={setup}
        pathId={pathId}
        stageId={stageId}
        pathRemediationId={pathRemediationId}
        onBack={() => {
          setStep('upload')
          setSetup(null)
        }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/app/new-interview"
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-xs text-muted-foreground hover:bg-input/30"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {entryMode === 'path' ? 'Path interview' : 'From resume'}
          </h1>
          <p className="text-xs text-muted-foreground">
            Upload a resume to auto-fill configuration. You will review topics before any questions
            are generated.
          </p>
        </div>
      </div>

      {stagePrefill ? (
        <div className="rounded-xl border border-border bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
          Stage: <span className="font-medium text-foreground">{stagePrefill.title}</span>
        </div>
      ) : null}

      <ResumeUpload
        value={resume}
        onParsed={onParsed}
        onClear={() => {
          setResume(null)
          setSetup(null)
        }}
      />

      {!requireResume ? (
        <button
          type="button"
          onClick={startPathWithoutResume}
          className="hq-btn-outline h-11 w-full rounded-2xl text-sm font-semibold"
        >
          Skip resume — configure manually
        </button>
      ) : null}

      {!resume && requireResume ? (
        <p className="text-center text-xs text-muted-foreground">
          Parsing extracts skills and suggests taxonomy topics. Generation happens only after you
          confirm on the next screen.
        </p>
      ) : null}
    </div>
  )
}
