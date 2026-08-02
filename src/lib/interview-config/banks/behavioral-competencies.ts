/** Behavioral interview competency bank (static). */
export const BEHAVIORAL_COMPETENCIES = [
  'Teamwork',
  'Communication',
  'Leadership',
  'Conflict Resolution',
  'Problem Solving',
  'Adaptability',
  'Time Management',
  'Decision Making',
  'Accountability',
  'Customer Focus',
  'Ownership',
  'Initiative',
  'Creativity',
  'Learning Mindset',
  'Collaboration',
] as const

export type BehavioralCompetency = (typeof BEHAVIORAL_COMPETENCIES)[number]

export const BEHAVIORAL_COMPETENCY_SET = new Set<string>(BEHAVIORAL_COMPETENCIES)
