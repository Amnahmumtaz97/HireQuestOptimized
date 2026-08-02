export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard'
/** Alias used by coding templates and generation. */
export type Difficulty = QuestionDifficulty

export function difficultyForQuestionIndex(
  sessionDifficulty: 'Easy' | 'Medium' | 'Hard' | 'Adaptive',
  index: number,
): QuestionDifficulty {
  if (sessionDifficulty !== 'Adaptive') return sessionDifficulty
  const cycle: QuestionDifficulty[] = ['Easy', 'Medium', 'Hard', 'Medium', 'Hard']
  return cycle[index % cycle.length]
}

export function difficultyPromptLabel(
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Adaptive',
): string {
  if (difficulty === 'Adaptive') {
    return 'Adaptive AI — vary Easy, Medium, and Hard based on topic complexity (mix across questions)'
  }
  return difficulty
}
