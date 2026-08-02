export const PATH_CATEGORIES = [
  'technology',
  'role',
  'company',
  'skills',
  'dsa',
  'system_design',
  'project',
  'resume',
] as const

export type PathCategory = (typeof PATH_CATEGORIES)[number]

export const PATH_CATEGORY_LABELS: Record<PathCategory, string> = {
  technology: 'Technology',
  role: 'Role',
  company: 'Company',
  skills: 'Skills',
  dsa: 'DSA',
  system_design: 'System Design',
  project: 'Project',
  resume: 'Resume',
}

export const PATH_DIFFICULTY_LABELS = ['Beginner', 'Intermediate', 'Advanced'] as const
export type PathDifficultyLabel = (typeof PATH_DIFFICULTY_LABELS)[number]

/** Browse hubs for the Categories page (maps to subcategory + optional tags). */
export const PATH_SUBCATEGORIES = [
  { key: 'languages', label: 'Programming Languages', category: 'technology' as PathCategory },
  { key: 'frontend', label: 'Frontend', category: 'technology' as PathCategory },
  { key: 'backend', label: 'Backend', category: 'technology' as PathCategory },
  { key: 'databases', label: 'Databases', category: 'technology' as PathCategory },
  { key: 'cs_fundamentals', label: 'Computer Science', category: 'technology' as PathCategory },
  { key: 'system_design', label: 'System Design', category: 'system_design' as PathCategory },
  { key: 'ai_ml', label: 'AI / ML', category: 'technology' as PathCategory },
  { key: 'cloud', label: 'Cloud', category: 'technology' as PathCategory },
  { key: 'devops', label: 'DevOps', category: 'technology' as PathCategory },
  { key: 'testing', label: 'Testing', category: 'technology' as PathCategory },
  { key: 'mobile', label: 'Mobile', category: 'technology' as PathCategory },
  { key: 'cybersecurity', label: 'Cybersecurity', category: 'technology' as PathCategory },
  { key: 'game_dev', label: 'Game Development', category: 'technology' as PathCategory },
  { key: 'behavioral', label: 'Behavioral', category: 'skills' as PathCategory },
  { key: 'role_based', label: 'Role-Based', category: 'role' as PathCategory },
  { key: 'pakistan', label: 'Top 30 Companies IT (Pakistan)', category: 'company' as PathCategory, tag: 'pakistan' },
  { key: 'dsa', label: 'DSA', category: 'dsa' as PathCategory },
  { key: 'project', label: 'Project Discussion', category: 'project' as PathCategory },
] as const

export type PathSubcategoryKey = (typeof PATH_SUBCATEGORIES)[number]['key']

export const STAGE_LEVELS = [1, 2, 3, 4, 5, 6] as const
export type StageLevel = (typeof STAGE_LEVELS)[number]

export const STAGE_LEVEL_LABELS: Record<StageLevel, string> = {
  1: 'Foundations',
  2: 'Core Concepts',
  3: 'Intermediate Interviews',
  4: 'Advanced Questions',
  5: 'Senior Scenarios',
  6: 'Mock Interview',
}

export function isPathCategory(value: string): value is PathCategory {
  return (PATH_CATEGORIES as readonly string[]).includes(value)
}

export function normalizeStageLevel(value: unknown): StageLevel | null {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(n) || n < 1 || n > 6) return null
  return n as StageLevel
}

export function visibilityQuery(userId: string) {
  return {
    $or: [{ ownerUserId: null }, { ownerUserId: userId }, { ownerUserId: { $exists: false } }],
  }
}
