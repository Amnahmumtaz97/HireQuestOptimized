import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function requireAdminSession(): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { ok: false, status: 401, message: 'Unauthorized' }
  }

  if (session.user.role !== 'admin') {
    return { ok: false, status: 403, message: 'Forbidden' }
  }

  return { ok: true }
}
