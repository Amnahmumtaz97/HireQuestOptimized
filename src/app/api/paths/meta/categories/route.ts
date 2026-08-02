import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { LearningPathModel } from '@/models/LearningPath'
import { PATH_SUBCATEGORIES, visibilityQuery } from '@/lib/learning-paths/constants'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const base = visibilityQuery(session.user.id)

    const groups = await Promise.all(
      PATH_SUBCATEGORIES.map(async (sub) => {
        const query: Record<string, unknown> = { ...base }
        if ('tag' in sub && sub.tag) {
          query.category = sub.category
          query.tags = sub.tag
        } else if (sub.category === 'system_design' || sub.category === 'dsa' || sub.category === 'project') {
          query.category = sub.category
        } else {
          query.$or = [{ subcategory: sub.key }, { tags: sub.key }]
          if (sub.category) {
            // Prefer matching category when set, but allow tag-only matches within visibility
            query.category = sub.category
            query.$or = [{ subcategory: sub.key }, { tags: sub.key }]
          }
        }
        const count = await LearningPathModel.countDocuments(query)
        return {
          key: sub.key,
          label: sub.label,
          category: sub.category,
          tag: 'tag' in sub ? sub.tag : null,
          count,
        }
      }),
    )

    return NextResponse.json({ categories: groups })
  } catch {
    return NextResponse.json(
      { message: 'Failed to load path categories' },
      { status: 500 },
    )
  }
}
