export type SpecializationConfig = {
  key: string
  label: string
  interviewTypes?: string[]
  technicalTopics: string[]
  behavioralTopics: string[]
  hrTopics?: string[]
  technicalQuestionRatio: number
  durationEnabled: boolean
  durations: number[]
}

export type DepartmentConfig = {
  key: string
  label: string
  specializations: SpecializationConfig[]
}

export type InterviewCatalog = {
  departments: DepartmentConfig[]
}
