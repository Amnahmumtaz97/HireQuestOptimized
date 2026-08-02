import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Path Categories — HireQuest',
}

/** Categories hub now lives on the Learning Paths home. */
export default function LearningPathCategoriesPage() {
  redirect('/app/learning-paths')
}
