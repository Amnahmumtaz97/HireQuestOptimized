import { AchievementModel, ACHIEVEMENT_DEFS } from '@/models/Achievement'
import { UserModel } from '@/models/User'
import { InterviewSessionModel } from '@/models/InterviewSession'

function utcDateString(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

function yesterdayUtc(d = new Date()) {
  const x = new Date(d)
  x.setUTCDate(x.getUTCDate() - 1)
  return x.toISOString().slice(0, 10)
}

export async function awardInterviewGamification(input: {
  userId: string
  score?: number | null
  questionsAnswered?: number
  skillsStage?: boolean
}): Promise<{ unlockedKeys: string[] }> {
  const user = await UserModel.findById(input.userId)
  if (!user) return { unlockedKeys: [] }

  const g = user.gamification || {
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    interviewsCompleted: 0,
    questionsAnswered: 0,
  }

  const today = utcDateString()
  const last = g.lastPracticeDate || null
  let currentStreak = g.currentStreak || 0
  if (last === today) {
    // already practiced today
  } else if (last === yesterdayUtc()) {
    currentStreak += 1
  } else {
    currentStreak = 1
  }
  const longestStreak = Math.max(g.longestStreak || 0, currentStreak)

  const xpGain =
    25 +
    Math.round(Math.max(0, Math.min(100, input.score ?? 50)) / 4) +
    Math.min(20, input.questionsAnswered ?? 0)

  g.xp = (g.xp || 0) + xpGain
  g.currentStreak = currentStreak
  g.longestStreak = longestStreak
  g.lastPracticeDate = today
  g.interviewsCompleted = (g.interviewsCompleted || 0) + 1
  g.questionsAnswered =
    (g.questionsAnswered || 0) + Math.max(0, input.questionsAnswered ?? 0)
  user.gamification = g
  await user.save()

  const unlockedKeys: string[] = []
  const existing = await AchievementModel.find({ userId: input.userId }).lean()
  const have = new Set(existing.map((a) => a.key))

  for (const def of ACHIEVEMENT_DEFS) {
    if (have.has(def.key)) continue
    let ok = false
    if (def.metric === 'interviews') ok = (g.interviewsCompleted || 0) >= def.threshold
    if (def.metric === 'questions') ok = (g.questionsAnswered || 0) >= def.threshold
    if (def.metric === 'streak') ok = (g.currentStreak || 0) >= def.threshold
    if (def.metric === 'perfect') ok = (input.score ?? 0) >= 100
    if (def.metric === 'skills_stage') ok = Boolean(input.skillsStage)
    if (!ok) continue
    try {
      await AchievementModel.create({
        userId: input.userId,
        key: def.key,
        title: def.title,
        description: def.description,
        unlockedAt: new Date(),
      })
      unlockedKeys.push(def.key)
    } catch {
      /* duplicate race */
    }
  }

  return { unlockedKeys }
}

export async function getUserPracticeTotals(userId: string) {
  const sessions = await InterviewSessionModel.find({
    userId,
    status: 'completed',
  })
    .select('answers questions createdAt durationMinutes interviewStartedAt completedAt')
    .lean()

  let questionsAnswered = 0
  let timeSpentMinutes = 0
  for (const s of sessions) {
    const answers = (s.answers || []) as Array<{ answer?: string }>
    questionsAnswered += answers.filter((a) => (a.answer || '').trim()).length
    const started = s.interviewStartedAt ? new Date(s.interviewStartedAt).getTime() : null
    const ended = (s as { completedAt?: Date }).completedAt
      ? new Date((s as { completedAt?: Date }).completedAt!).getTime()
      : null
    if (started && ended && ended > started) {
      timeSpentMinutes += Math.round((ended - started) / 60000)
    } else if (typeof s.durationMinutes === 'number') {
      timeSpentMinutes += s.durationMinutes
    }
  }

  return {
    interviewsCompleted: sessions.length,
    questionsAnswered,
    timeSpentMinutes,
  }
}
