/**
 * Extract plain text from a PDF buffer using pdf-parse v2.
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  try {
    const result = await parser.getText()
    const text = (result?.text || '').trim()
    if (!text) {
      throw new Error(
        'This PDF has no extractable text (it may be a scanned image). Try a text-based PDF or DOCX.',
      )
    }
    return text
  } finally {
    await parser.destroy?.()
  }
}
