import type { DepartmentConfig } from '@/lib/interview-catalog/types'
import { CODING_CATEGORIES } from '@/lib/interview-config/banks/coding-categories'
import { BEHAVIORAL_COMPETENCIES } from '@/lib/interview-config/banks/behavioral-competencies'
import { HR_SECTIONS } from '@/lib/interview-config/banks/hr-sections'
import { SYSTEM_DESIGN_TOPICS } from '@/lib/interview-config/banks/system-design-topics'
import type { InterviewTypeKey } from '@/lib/interview-config/interview-types'

export type QuestionBankKind = Extract<
  InterviewTypeKey,
  'technical' | 'coding' | 'behavioral' | 'hr' | 'system_design'
>

export type QuestionBankItem = {
  id: string
  kind: QuestionBankKind
  label: string
  value: string
  source: string
}

export function questionBankItemId(kind: QuestionBankKind, value: string): string {
  return `${kind}:${value}`
}

export function parseQuestionBankId(id: string): { kind: string; value: string } | null {
  const idx = id.indexOf(':')
  if (idx <= 0) return null
  return { kind: id.slice(0, idx), value: id.slice(idx + 1) }
}

export function practiceHrefForBankItem(item: QuestionBankItem): string {
  const params = new URLSearchParams({
    type: item.kind,
    topic: item.value,
  })
  return `/app/new-interview?${params.toString()}`
}

export function buildQuestionBank(departments: DepartmentConfig[]): QuestionBankItem[] {
  const seen = new Set<string>()
  const items: QuestionBankItem[] = []

  function add(kind: QuestionBankKind, label: string, value: string, source: string) {
    const id = questionBankItemId(kind, value)
    if (seen.has(id)) return
    seen.add(id)
    items.push({ id, kind, label, value, source })
  }

  for (const department of departments) {
    for (const spec of department.specializations) {
      const source = `${department.label} · ${spec.label}`
      for (const topic of spec.technicalTopics ?? []) add('technical', topic, topic, source)
      for (const topic of spec.behavioralTopics ?? []) add('behavioral', topic, topic, source)
      for (const topic of spec.hrTopics ?? []) add('hr', topic, topic, source)
    }
  }

  for (const topic of CODING_CATEGORIES) add('coding', topic, topic, 'Coding bank')
  for (const topic of BEHAVIORAL_COMPETENCIES) add('behavioral', topic, topic, 'Behavioral bank')
  for (const section of HR_SECTIONS) add('hr', section.label, section.key, 'HR bank')
  for (const topic of SYSTEM_DESIGN_TOPICS) add('system_design', topic, topic, 'System design bank')

  items.sort((a, b) => a.label.localeCompare(b.label) || a.kind.localeCompare(b.kind))
  return items
}
