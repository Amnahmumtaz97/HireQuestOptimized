/**
 * Automated consistency checks for interview configuration SSoT.
 * Fail CI / local runs when option lists, labels, banks, or catalog hierarchy drift.
 */
import { describe, expect, it } from 'vitest'
import {
  INTERVIEW_TYPE_KEYS,
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_TYPE_UI_ORDER,
  STORED_INTERVIEW_TYPE_KEYS,
  DEFAULT_MIX_WEIGHTS,
  normalizeStoredInterviewType,
} from '@/lib/interview-config/interview-types'
import {
  DIFFICULTY_UI_OPTIONS,
  SESSION_DIFFICULTIES,
  SETUP_DIFFICULTIES,
  normalizeSessionDifficulty,
} from '@/lib/interview-config/difficulty'
import {
  QUESTION_COUNT_MAX,
  QUESTION_COUNT_MIN,
  QUESTION_COUNT_PRESETS,
  isValidQuestionCount,
} from '@/lib/interview-config/question-counts'
import {
  DURATION_MAX,
  DURATION_MIN,
  DURATION_OPTIONS_DEFAULT,
  isValidDurationMinutes,
} from '@/lib/interview-config/durations'
import { SENIORITY_LEVELS } from '@/lib/interview-config/experience'
import { CODING_CATEGORIES } from '@/lib/interview-config/banks/coding-categories'
import { BEHAVIORAL_COMPETENCIES } from '@/lib/interview-config/banks/behavioral-competencies'
import { HR_SECTIONS, HR_SECTION_KEYS } from '@/lib/interview-config/banks/hr-sections'
import { SYSTEM_DESIGN_TOPICS } from '@/lib/interview-config/banks/system-design-topics'
import { PRACTICE_INTERVIEW_TYPES } from '@/lib/interview-config/type-config'
import { DEFAULT_INTERVIEW_TYPES } from '@/lib/interview-catalog/hr-topics'
import { INTERVIEW_CATALOG_DEPARTMENTS } from '@/lib/interview-catalog/departments-data'
import { CODING_PROBLEM_BANK } from '@/lib/interview-questions/coding-templates'
import { SYSTEM_DESIGN_PROBLEM_BANK } from '@/lib/interview-questions/system-design-templates'
import { assertConfirmedTopics, InterviewConfigError } from '@/lib/interview-config/assert-selection'

describe('interview type SSoT', () => {
  it('UI order matches canonical keys and has no duplicates', () => {
    expect(INTERVIEW_TYPE_UI_ORDER).toEqual([...INTERVIEW_TYPE_KEYS])
    expect(new Set(INTERVIEW_TYPE_UI_ORDER).size).toBe(INTERVIEW_TYPE_UI_ORDER.length)
  })

  it('every key has a stable label (Screening HR, not HR / Human Resources drift)', () => {
    expect(INTERVIEW_TYPE_LABELS.hr).toBe('Screening HR')
    expect(INTERVIEW_TYPE_LABELS.behavioral).toBe('Behavioral')
    expect(INTERVIEW_TYPE_LABELS.mixed).toBe('Mixed')
    expect(INTERVIEW_TYPE_LABELS.both).toBe('Mixed')
    for (const key of STORED_INTERVIEW_TYPE_KEYS) {
      expect(INTERVIEW_TYPE_LABELS[key].length).toBeGreaterThan(0)
    }
  })

  it('normalizes legacy both → mixed', () => {
    expect(normalizeStoredInterviewType('both')).toBe('mixed')
    expect(normalizeStoredInterviewType('Mixed')).toBe('mixed')
  })

  it('type-config PRACTICE_INTERVIEW_TYPES matches stored keys', () => {
    expect([...PRACTICE_INTERVIEW_TYPES].sort()).toEqual([...STORED_INTERVIEW_TYPE_KEYS].sort())
  })

  it('admin DEFAULT_INTERVIEW_TYPES labels come from SSoT', () => {
    expect(DEFAULT_INTERVIEW_TYPES).toContain(INTERVIEW_TYPE_LABELS.technical)
    expect(DEFAULT_INTERVIEW_TYPES).toContain(INTERVIEW_TYPE_LABELS.hr)
    expect(DEFAULT_INTERVIEW_TYPES).toContain(INTERVIEW_TYPE_LABELS.coding)
    expect(DEFAULT_INTERVIEW_TYPES).toContain(INTERVIEW_TYPE_LABELS.system_design)
  })

  it('default mix weights sum to 100', () => {
    const sum = Object.values(DEFAULT_MIX_WEIGHTS).reduce((a, b) => a + b, 0)
    expect(sum).toBe(100)
  })
})

describe('difficulty / counts / durations', () => {
  it('UI difficulties match session difficulties in order', () => {
    expect(DIFFICULTY_UI_OPTIONS.map((o) => o.key)).toEqual([...SESSION_DIFFICULTIES])
  })

  it('Mixed maps to Adaptive', () => {
    expect(normalizeSessionDifficulty('Mixed')).toBe('Adaptive')
    expect(SETUP_DIFFICULTIES).toContain('Adaptive')
    expect(SETUP_DIFFICULTIES).toContain('Mixed')
  })

  it('question count presets are valid', () => {
    for (const p of QUESTION_COUNT_PRESETS) {
      expect(isValidQuestionCount(p.value)).toBe(true)
    }
    expect(isValidQuestionCount(QUESTION_COUNT_MIN - 1)).toBe(false)
    expect(isValidQuestionCount(QUESTION_COUNT_MAX + 1)).toBe(false)
  })

  it('default durations are valid', () => {
    for (const d of DURATION_OPTIONS_DEFAULT) {
      expect(isValidDurationMinutes(d)).toBe(true)
    }
    expect(isValidDurationMinutes(DURATION_MIN - 1)).toBe(false)
    expect(isValidDurationMinutes(DURATION_MAX + 1)).toBe(false)
  })

  it('seniority levels are canonical', () => {
    expect([...SENIORITY_LEVELS]).toEqual(['junior', 'mid', 'senior'])
  })
})

describe('static banks', () => {
  it('coding categories have no duplicates', () => {
    expect(new Set(CODING_CATEGORIES).size).toBe(CODING_CATEGORIES.length)
  })

  it('behavioral competencies have no duplicates', () => {
    expect(new Set(BEHAVIORAL_COMPETENCIES).size).toBe(BEHAVIORAL_COMPETENCIES.length)
  })

  it('HR section keys are unique and match HR_SECTIONS', () => {
    expect(HR_SECTION_KEYS).toEqual(HR_SECTIONS.map((s) => s.key))
    expect(new Set(HR_SECTION_KEYS).size).toBe(HR_SECTION_KEYS.length)
  })

  it('system design topics have no duplicates', () => {
    expect(new Set(SYSTEM_DESIGN_TOPICS).size).toBe(SYSTEM_DESIGN_TOPICS.length)
  })

  it('coding problem bank has unique functionNames', () => {
    const names = CODING_PROBLEM_BANK.map((p) => p.functionName)
    expect(new Set(names).size).toBe(names.length)
  })

  it('coding problem topics exist in coding categories', () => {
    const cat = new Set<string>(CODING_CATEGORIES)
    for (const p of CODING_PROBLEM_BANK) {
      expect(cat.has(p.topic)).toBe(true)
    }
  })

  it('system design problem bank has unique ids', () => {
    const ids = SYSTEM_DESIGN_PROBLEM_BANK.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('system design bank covers every SYSTEM_DESIGN_TOPIC', () => {
    const covered = new Set(SYSTEM_DESIGN_PROBLEM_BANK.map((p) => p.topic))
    for (const topic of SYSTEM_DESIGN_TOPICS) {
      expect(covered.has(topic)).toBe(true)
    }
  })

  it('system design problem topics exist in SYSTEM_DESIGN_TOPICS', () => {
    const bank = new Set<string>(SYSTEM_DESIGN_TOPICS)
    for (const p of SYSTEM_DESIGN_PROBLEM_BANK) {
      expect(bank.has(p.topic)).toBe(true)
    }
  })
})

describe('catalog hierarchy (seed data)', () => {
  it('every specialization belongs to one department with unique keys', () => {
    const deptKeys = new Set<string>()
    for (const dept of INTERVIEW_CATALOG_DEPARTMENTS) {
      expect(dept.key).toBeTruthy()
      expect(deptKeys.has(dept.key)).toBe(false)
      deptKeys.add(dept.key)

      const specKeys = new Set<string>()
      for (const spec of dept.specializations || []) {
        expect(spec.key).toBeTruthy()
        expect(specKeys.has(spec.key)).toBe(false)
        specKeys.add(spec.key)
        expect(Array.isArray(spec.technicalTopics)).toBe(true)
        expect(new Set(spec.technicalTopics).size).toBe(spec.technicalTopics.length)
        // Topics must not be empty for technical practice
        expect(spec.technicalTopics.length).toBeGreaterThan(0)
      }
    }
  })

  it('no orphan empty departments', () => {
    for (const dept of INTERVIEW_CATALOG_DEPARTMENTS) {
      expect((dept.specializations || []).length).toBeGreaterThan(0)
    }
  })
})

describe('prompt / generation guards', () => {
  it('assertConfirmedTopics throws instead of inventing topics', () => {
    expect(() => assertConfirmedTopics([])).toThrow(InterviewConfigError)
    expect(() => assertConfirmedTopics(null)).toThrow(InterviewConfigError)
    expect(assertConfirmedTopics(['Arrays', '  Graphs  '])).toEqual(['Arrays', 'Graphs'])
  })
})

describe('Pakistan Top 30 computer-tech paths', () => {
  it('defines exactly 30 companies with unique slugs', async () => {
    const { PAKISTAN_TECH_TOP_30 } = await import(
      '@/lib/learning-paths/pakistan-tech-companies'
    )
    expect(PAKISTAN_TECH_TOP_30).toHaveLength(30)
    const slugs = PAKISTAN_TECH_TOP_30.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(30)
  })

  it('each pack builds HR + coding + technical + design + behavioral + mock', async () => {
    const { PAKISTAN_TECH_TOP_30 } = await import(
      '@/lib/learning-paths/pakistan-tech-companies'
    )
    const { buildPakistanCompanyStages } = await import(
      '@/lib/learning-paths/build-pakistan-company-path'
    )
    for (const pack of PAKISTAN_TECH_TOP_30) {
      const stages = buildPakistanCompanyStages(pack)
      const types = stages.map((s) => s.interviewType).filter(Boolean)
      expect(types).toContain('hr')
      expect(types).toContain('coding')
      expect(types).toContain('technical')
      expect(types).toContain('behavioral')
      expect(types).toContain('mixed')
      expect(types.some((t) => t === 'system_design' || t === 'technical')).toBe(true)
      for (const s of stages) {
        if (s.type === 'practice' || s.type === 'mock_interview') {
          expect((s.suggestedTopics || []).length).toBeGreaterThan(0)
        }
      }
    }
  })
})
