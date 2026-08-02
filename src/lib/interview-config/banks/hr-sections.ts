/** Screening HR sections (static). Keys are stored; labels shown in UI. */
export const HR_SECTIONS = [
  { key: 'introduction', label: 'Introduction', examples: ['Tell me about yourself', 'Career summary'] },
  { key: 'motivation', label: 'Motivation', examples: ['Why this company?', 'Why this role?', 'Career goals'] },
  { key: 'background', label: 'Background', examples: ['Education', 'Projects', 'Internships', 'Experience'] },
  { key: 'availability', label: 'Availability', examples: ['Joining date', 'Notice period', 'Relocation'] },
  { key: 'salary', label: 'Salary', examples: ['Salary expectations'] },
  { key: 'work_preferences', label: 'Work Preferences', examples: ['Remote', 'Hybrid', 'Onsite'] },
  { key: 'strengths_weaknesses', label: 'Strengths & Weaknesses', examples: [] },
  { key: 'general_hr', label: 'General HR Questions', examples: [] },
] as const

export type HrSectionKey = (typeof HR_SECTIONS)[number]['key']

export const HR_SECTION_KEYS = HR_SECTIONS.map((s) => s.key)

export const HR_SECTION_SET = new Set<string>(HR_SECTION_KEYS)

export function hrSectionLabel(key: string): string {
  return HR_SECTIONS.find((s) => s.key === key)?.label ?? key
}
