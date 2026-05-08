import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewConfigModel } from '@/models/InterviewConfig'

export async function GET() {
  try {
    await connectToDatabase()

    const configs = await InterviewConfigModel.find({ isActive: true })
      .sort({ industryLabel: 1 })
      .select({
        industryKey: 1,
        industryLabel: 1,
        roleCategories: 1,
        isActive: 1,
      })
      .lean()

    return NextResponse.json({ configs })
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
