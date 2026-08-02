import { PathDetailPage } from '@/components/app/learning-paths/PathDetailPage'

export const metadata = {
  title: 'Learning Path — HireQuest',
}

export default async function LearningPathDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PathDetailPage pathId={id} />
}
