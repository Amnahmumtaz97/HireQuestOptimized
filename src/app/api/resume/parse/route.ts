import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { extractResumeWithGemini } from '@/lib/resume/extract-with-gemini'
import { extractPdfText } from '@/lib/resume/extract-pdf-text'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
])

async function extractTextFromFile(
  buffer: Buffer,
  mime: string,
  filename: string,
): Promise<string> {
  const lower = filename.toLowerCase()
  const isPdf =
    mime === 'application/pdf' ||
    lower.endsWith('.pdf') ||
    (mime === 'application/octet-stream' && lower.endsWith('.pdf'))
  const isDocx = mime.includes('wordprocessingml') || lower.endsWith('.docx')

  if (isPdf) {
    return extractPdfText(buffer)
  }

  if (isDocx) {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return (result.value || '').trim()
  }

  throw new Error('Unsupported file type. Upload a PDF or DOCX resume.')
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const rate = checkRateLimit(`resume-parse:${session.user.id}`, {
      limit: 15,
      windowMs: 60 * 60 * 1000,
    })
    if (rate.ok === false) {
      return NextResponse.json(
        {
          message: `Too many resume parses. Try again in ${rate.retryAfterSec}s.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rate.retryAfterSec) },
        },
      )
    }

    const form = await request.formData()
    const file = form.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: 'Missing resume file (field name: file)' },
        { status: 400 },
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { message: 'File is too large. Maximum size is 5MB.' },
        { status: 400 },
      )
    }

    const mime = file.type || 'application/octet-stream'
    const name = file.name || 'resume'
    const lower = name.toLowerCase()
    const okExt = lower.endsWith('.pdf') || lower.endsWith('.docx')
    if (!ALLOWED.has(mime) && !okExt) {
      return NextResponse.json(
        { message: 'Only PDF or DOCX resumes are supported.' },
        { status: 400 },
      )
    }
    if (!okExt) {
      return NextResponse.json(
        { message: 'Only PDF or DOCX resumes are supported.' },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let text = ''
    try {
      text = await extractTextFromFile(buffer, mime, name)
    } catch (e) {
      console.error('[resume] extract failed', e)
      return NextResponse.json(
        {
          message:
            e instanceof Error
              ? e.message
              : 'Could not read this file. Try another PDF/DOCX or fill the form manually.',
        },
        { status: 400 },
      )
    }

    if (!text.trim()) {
      return NextResponse.json(
        {
          message:
            'No text could be extracted from this file. Fill the interview form manually.',
        },
        { status: 400 },
      )
    }

    try {
      const parsed = await extractResumeWithGemini(text)
      return NextResponse.json({
        resume: parsed,
        meta: { textChars: text.length },
      })
    } catch (e) {
      console.error('[resume] structure failed', e)
      return NextResponse.json(
        {
          message:
            e instanceof Error
              ? e.message
              : 'Resume AI parsing failed. Fill the form manually.',
          resume: null,
        },
        { status: 400 },
      )
    }
  } catch (e) {
    console.error('[resume] unexpected', e)
    return NextResponse.json(
      { message: 'Failed to parse resume' },
      { status: 500 },
    )
  }
}
