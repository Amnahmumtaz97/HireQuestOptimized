import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import { QuestionBankPage } from '@/components/app/question-bank/QuestionBankPage'

export const metadata = {
  title: 'Question Bank — HireQuest',
}

export default function QuestionBankRoute() {
  return (
    <>
      <DashboardPageHeader
        title="Question Bank"
        description="Browse topics from the interview catalog, then start a focused practice session."
        titleHighlight="accent"
        variant="dashboard"
      />
      <QuestionBankPage />
    </>
  )
}
