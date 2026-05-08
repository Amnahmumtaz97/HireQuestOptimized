'use client'

import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToast } from '@/components/ui/toast'

type InterviewDeleteModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  interviewId: string | null
  onDeleted: (id: string) => void
}

export function InterviewDeleteModal({
  open,
  onOpenChange,
  interviewId,
  onDeleted,
}: InterviewDeleteModalProps) {
  const toast = useToast()

  const handleConfirm = async () => {
    if (!interviewId) return
    const res = await fetch(`/api/interviews/${interviewId}`, { method: 'DELETE' })
    let message = 'Failed to delete interview'
    try {
      const data = (await res.json()) as { message?: string }
      if (data.message) message = data.message
    } catch {
      /* ignore */
    }
    if (!res.ok) {
      toast.error(message)
      return
    }
    onDeleted(interviewId)
    toast.success('Interview deleted')
    onOpenChange(false)
  }

  return (
    <ConfirmModal
      open={open && Boolean(interviewId)}
      onOpenChange={onOpenChange}
      title="Delete Interview?"
      description="This action cannot be undone."
      confirmLabel="Confirm Delete"
      confirmVariant="danger"
      onConfirm={handleConfirm}
    />
  )
}
