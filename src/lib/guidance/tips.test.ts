import { describe, expect, it } from 'vitest'
import { GUIDANCE_TIPS, interviewSessionGuidance } from './tips'

describe('interviewSessionGuidance', () => {
  const base = {
    loading: false,
    hasSession: true,
    completed: false,
    hasQuestion: true,
    coding: false,
    voiceOnly: false,
  }

  it('stays quiet while loading, missing, or already finished', () => {
    expect(interviewSessionGuidance({ ...base, loading: true })).toBeNull()
    expect(interviewSessionGuidance({ ...base, hasSession: false })).toBeNull()
    expect(interviewSessionGuidance({ ...base, completed: true })).toBeNull()
  })

  it('asks to generate when the session has no questions yet', () => {
    expect(interviewSessionGuidance({ ...base, hasQuestion: false })).toEqual({
      key: 'interview-generate',
      message: GUIDANCE_TIPS['interview-generate'],
    })
  })

  it('uses the editor toast for coding questions', () => {
    const tip = interviewSessionGuidance({ ...base, coding: true, voiceOnly: true })
    expect(tip?.key).toBe('interview-coding')
    expect(tip?.message).toMatch(/editor/)
    expect(tip?.message).not.toMatch(/Type your answer/)
  })

  it('does not tell Soft Skills voice-only interviews to type', () => {
    const tip = interviewSessionGuidance({ ...base, voiceOnly: true })
    expect(tip?.key).toBe('interview-spoken')
    expect(tip?.message).toMatch(/voice-only/)
    expect(tip?.message).toMatch(/mic/)
    expect(tip?.message).not.toMatch(/Type your answer/)
  })

  it('lets technical and system design type or speak', () => {
    const tip = interviewSessionGuidance(base)
    expect(tip?.key).toBe('interview-session')
    expect(tip?.message).toMatch(/Type your answer/)
    expect(tip?.message).toMatch(/mic/)
  })
})
