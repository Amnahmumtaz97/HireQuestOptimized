import { NextResponse } from 'next/server'
import { loadInterviewCatalogDepartments } from '@/lib/interview-catalog/load'

export async function GET() {
  try {
    const departments = await loadInterviewCatalogDepartments()
    return NextResponse.json({
      departments,
      /** @deprecated Use `departments`. Kept for older admin tooling. */
      configs: departments.map((department) => ({
        industryKey: department.key,
        industryLabel: department.label,
        roleCategories: department.specializations.map((specialization) => ({
          key: specialization.key,
          label: specialization.label,
          interviewTypes: ['Technical', 'Behavioral'],
          technicalTopics: specialization.technicalTopics,
          behavioralTopics: specialization.behavioralTopics,
          technicalQuestionRatio: specialization.technicalQuestionRatio,
          durationEnabled: specialization.durationEnabled,
          durations: specialization.durations,
        })),
        isActive: true,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to fetch interview config',
      },
      { status: 500 },
    )
  }
}
