import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId } from 'mongoose'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewSessionModel } from '@/models/InterviewSession'
import { generateInterviewQuestions } from '@/lib/interview-questions/generate'
import {
  normalizeSpecializationRefs,
  resolveTopicsForInterview,
} from '@/lib/interview-catalog'
import { loadInterviewCatalogDepartments } from '@/lib/interview-catalog/load'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid interview id' }, { status: 400 })
  }

  try {
    const url = new URL(request.url)
    void url

    await connectToDatabase()
    const doc = await InterviewSessionModel.findOne({
      _id: id,
      userId: session.user.id,
    }).lean()

    if (!doc) {
      return NextResponse.json({ message: 'Interview not found' }, { status: 404 })
    }

    const departments = await loadInterviewCatalogDepartments()
    const departmentKeys =
      doc.departmentKeys?.length
        ? doc.departmentKeys
        : doc.industryKeys?.length
          ? doc.industryKeys
          : doc.departmentKey
            ? [doc.departmentKey]
            : doc.industryKey
              ? [doc.industryKey]
              : []

    const specializationRefs = normalizeSpecializationRefs(departments, {
      departmentKeys,
      selectAllDepartments: Boolean(doc.selectAllDepartments ?? doc.selectAllIndustries),
      specializationRefs: doc.specializationRefs,
      roleRefs: doc.roleRefs,
      specializationKeys: doc.specializationKeys,
      roleCategoryKeys: doc.roleCategoryKeys,
      specializationKey: doc.specializationKey,
      roleCategoryKey: doc.roleCategoryKey,
    })

    const resolved = resolveTopicsForInterview(departments, {
      selectAllDepartments: Boolean(doc.selectAllDepartments ?? doc.selectAllIndustries),
      departmentKeys,
      interviewType: doc.interviewType,
      interviewTypes: doc.interviewTypes,
      selectAllSpecializations: Boolean(doc.selectAllSpecializations ?? doc.selectAllRoleCategories),
      specializationRefs,
      selectAllTopics: Boolean(doc.selectAllTopics),
      topics: doc.topics ?? [],
    })

    const result = await generateInterviewQuestions({
      industryKey: doc.industryKey,
      industryKeys: resolved.departmentKeys,
      industryLabels: resolved.departmentLabels,
      roleCategoryKey: doc.roleCategoryKey,
      roleCategoryKeys: resolved.specializationKeys,
      roleCategoryLabels: resolved.specializationLabels,
      interviewType: doc.interviewType,
      interviewTypes: doc.interviewTypes,
      topics: resolved.topics,
      difficulty: doc.difficulty,
      totalQuestions: doc.totalQuestions,
      technicalQuestionRatio: doc.technicalQuestionRatio,
    })

    const updated = await InterviewSessionModel.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        $set: {
          questions: result.questions,
          questionSource: result.source,
        },
      },
      { returnDocument: 'after' },
    ).lean()

    if (!updated) {
      return NextResponse.json({ message: 'Failed to update interview' }, { status: 500 })
    }

    return NextResponse.json({
      session: updated,
      source: result.source,
      warnings: result.warnings,
    })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to generate questions' },
      { status: 500 },
    )
  }
}
