import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { AchievementModel } from '@/models/Achievement'
import { UserModel } from '@/models/User'
import { getUserPracticeTotals } from '@/lib/learning-paths/gamification'
import { UserPathProgressModel } from '@/models/UserPathProgress'
import { InterviewSessionModel } from '@/models/InterviewSession'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()
    const userId = session.user.id
    const [user, achievements, totals, pathProgress, recentScores] = await Promise.all([
      UserModel.findById(userId).lean(),
      AchievementModel.find({ userId }).sort({ unlockedAt: -1 }).lean(),
      getUserPracticeTotals(userId),
      UserPathProgressModel.find({ userId }).lean(),
      InterviewSessionModel.find({ userId, status: 'completed' })
        .sort({ updatedAt: -1 })
        .limit(20)
        .select('answers questions updatedAt')
        .lean(),
    ])

    const g = user?.gamification || {}
    const pathXp = pathProgress.reduce((sum, p) => sum + (p.xpEarned || 0), 0)
    const completionAvg =
      pathProgress.length === 0
        ? 0
        : Math.round(
            pathProgress.reduce((sum, p) => {
              const total = Math.max(1, (p.completedStageIds || []).length)
              return sum + total
            }, 0) / pathProgress.length,
          )

    const scoreTrend = recentScores.map((s) => {
      const total = Array.isArray(s.questions) ? s.questions.length : 0
      const answered = (s.answers || []).filter(
        (a) => typeof a.answer === 'string' && a.answer.trim(),
      ).length
      return total ? Math.round((answered / total) * 100) : 0
    })

    const confidence =
      scoreTrend.length === 0
        ? null
        : Math.round(scoreTrend.reduce((a, b) => a + b, 0) / scoreTrend.length)

    return NextResponse.json({
      gamification: {
        xp: (g.xp || 0) + pathXp,
        currentStreak: g.currentStreak || 0,
        longestStreak: g.longestStreak || 0,
        lastPracticeDate: g.lastPracticeDate || null,
        interviewsCompleted: Math.max(g.interviewsCompleted || 0, totals.interviewsCompleted),
        questionsAnswered: Math.max(g.questionsAnswered || 0, totals.questionsAnswered),
      },
      analytics: {
        interviewsCompleted: totals.interviewsCompleted,
        questionsAnswered: totals.questionsAnswered,
        timeSpentMinutes: totals.timeSpentMinutes,
        pathsEnrolled: pathProgress.length,
        pathsCompleted: pathProgress.filter((p) => p.status === 'completed').length,
        avgStagesCompleted: completionAvg,
        interviewConfidenceScore: confidence,
        feedbackTrend: scoreTrend.reverse(),
      },
      achievements: achievements.map((a) => ({
        id: String(a._id),
        key: a.key,
        title: a.title,
        description: a.description,
        unlockedAt: a.unlockedAt,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to load analytics' },
      { status: 500 },
    )
  }
}
