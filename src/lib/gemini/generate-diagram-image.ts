export async function generateDiagramImageDataUrl(params: {
  questionText: string
  topic: string
  /** Use dp-table for knapsack / DP prompts so the model draws a labeled grid. */
  diagramKind?: DiagramKind
}): Promise<string | null> {
  const kind = params.diagramKind ?? 'general'
  const svg =
    kind === 'dp-table'
      ? buildDpTableSvg(params.questionText)
      : kind === 'dfd'
        ? buildDfdSvg(params.questionText)
        : buildGeneralDiagramSvg(params.topic, params.questionText)

  if (!svg) return null
  return svgToDataUrl(svg)
}

/**
 * Lightweight, deterministic diagram generator.
 * We intentionally use SVG to avoid flaky model-based "image generation" support.
 */
export type DiagramKind = 'general' | 'dp-table' | 'dfd'

function svgToDataUrl(svg: string): string {
  const normalized = svg.replace(/\r\n/g, '\n').trim()
  const base64 = Buffer.from(normalized, 'utf8').toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => {
    if (c === '&') return '&amp;'
    if (c === '<') return '&lt;'
    if (c === '>') return '&gt;'
    return '&quot;'
  })
}

function buildGeneralDiagramSvg(topic: string, questionText: string): string {
  const title = topic ? `Diagram: ${topic}` : 'Diagram'
  const subtitle = questionText.slice(0, 96).replace(/\s+/g, ' ').trim()
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="940" height="420" viewBox="0 0 940 420">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1220"/>
      <stop offset="1" stop-color="#071027"/>
    </linearGradient>
    <linearGradient id="stroke" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4f6ef7" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#7c3aed" stop-opacity="0.75"/>
    </linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#7c3aed" fill-opacity="0.9"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="940" height="420" rx="26" fill="url(#bg)"/>
  <rect x="18" y="18" width="904" height="384" rx="22" fill="rgba(255,255,255,0.03)" stroke="url(#stroke)" stroke-width="2" filter="url(#glow)"/>

  <text x="42" y="64" font-family="Inter, ui-sans-serif" font-size="18" fill="white" fill-opacity="0.95">${esc(title)}</text>
  <text x="42" y="88" font-family="Inter, ui-sans-serif" font-size="12" fill="white" fill-opacity="0.62">${esc(subtitle)}...</text>

  <g>
    <rect x="80" y="140" width="220" height="96" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
    <text x="190" y="190" text-anchor="middle" font-family="Inter, ui-sans-serif" font-size="14" fill="white" fill-opacity="0.9">Client</text>
  </g>
  <g>
    <rect x="360" y="120" width="220" height="136" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
    <text x="470" y="176" text-anchor="middle" font-family="Inter, ui-sans-serif" font-size="14" fill="white" fill-opacity="0.9">Service</text>
    <text x="470" y="200" text-anchor="middle" font-family="Inter, ui-sans-serif" font-size="11" fill="white" fill-opacity="0.55">API / Logic</text>
  </g>
  <g>
    <rect x="640" y="140" width="220" height="96" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
    <text x="750" y="190" text-anchor="middle" font-family="Inter, ui-sans-serif" font-size="14" fill="white" fill-opacity="0.9">Data Store</text>
  </g>

  <path d="M 300 188 C 330 188, 330 188, 360 188" stroke="#4f6ef7" stroke-width="3" fill="none" marker-end="url(#arrow)" opacity="0.9"/>
  <path d="M 580 188 C 610 188, 610 188, 640 188" stroke="#22d3ee" stroke-width="3" fill="none" marker-end="url(#arrow)" opacity="0.8"/>
  <path d="M 640 208 C 610 208, 610 208, 580 208" stroke="#7c3aed" stroke-width="3" fill="none" marker-end="url(#arrow)" opacity="0.65"/>

  <text x="330" y="176" font-family="Inter, ui-sans-serif" font-size="11" fill="white" fill-opacity="0.55">request</text>
  <text x="610" y="176" font-family="Inter, ui-sans-serif" font-size="11" fill="white" fill-opacity="0.55">read/write</text>
</svg>`
}

function buildDpTableSvg(_questionText: string): string {
  const cols = 9
  const rows = 6
  const cell = 44
  const startX = 72
  const startY = 96
  const w = startX * 2 + cols * cell
  const h = startY + rows * cell + 84

  let grid = ''
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * cell
      const y = startY + r * cell
      grid += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>`
    }
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1220"/>
      <stop offset="1" stop-color="#071027"/>
    </linearGradient>
    <linearGradient id="stroke" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4f6ef7" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#7c3aed" stop-opacity="0.75"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" rx="26" fill="url(#bg)"/>
  <rect x="18" y="18" width="${w - 36}" height="${h - 36}" rx="22" fill="rgba(255,255,255,0.03)" stroke="url(#stroke)" stroke-width="2"/>
  <text x="42" y="58" font-family="Inter, ui-sans-serif" font-size="18" fill="white" fill-opacity="0.95">DP Table</text>
  <text x="42" y="82" font-family="Inter, ui-sans-serif" font-size="12" fill="white" fill-opacity="0.62">Reference grid (platform-supplied)</text>
  ${grid}
  <text x="${startX}" y="${startY + rows * cell + 56}" font-family="Inter, ui-sans-serif" font-size="12" fill="white" fill-opacity="0.62">Rows: steps · Cols: capacity/state</text>
</svg>`
}

function buildDfdSvg(questionText: string): string {
  const subtitle = questionText
    .replace(/\s+/g, ' ')
    .slice(0, 110)
    .trim()

  // Simple, generic DFD for login → balance → transfer
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="980" height="460" viewBox="0 0 980 460">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1220"/>
      <stop offset="1" stop-color="#071027"/>
    </linearGradient>
    <linearGradient id="stroke" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4f6ef7" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#7c3aed" stop-opacity="0.75"/>
    </linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="7" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f6ef7" fill-opacity="0.9"/>
    </marker>
    <marker id="arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#22d3ee" fill-opacity="0.9"/>
    </marker>
  </defs>

  <rect x="0" y="0" width="980" height="460" rx="26" fill="url(#bg)"/>
  <rect x="18" y="18" width="944" height="424" rx="22" fill="rgba(255,255,255,0.03)" stroke="url(#stroke)" stroke-width="2" filter="url(#glow)"/>

  <text x="42" y="64" font-family="Inter, ui-sans-serif" font-size="18" fill="white" fill-opacity="0.95">Data Flow Diagram (DFD)</text>
  <text x="42" y="88" font-family="Inter, ui-sans-serif" font-size="12" fill="white" fill-opacity="0.62">${esc(subtitle)}...</text>

  <!-- External entity -->
  <g>
    <rect x="70" y="180" width="200" height="96" rx="20" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
    <text x="170" y="232" text-anchor="middle" font-family="Inter, ui-sans-serif" font-size="14" fill="white" fill-opacity="0.9">User</text>
    <text x="170" y="254" text-anchor="middle" font-family="Inter, ui-sans-serif" font-size="11" fill="white" fill-opacity="0.55">Browser / App</text>
  </g>

  <!-- Processes -->
  <g>
    <rect x="330" y="110" width="260" height="92" rx="22" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
    <text x="460" y="160" text-anchor="middle" font-family="Inter, ui-sans-serif" font-size="14" fill="white" fill-opacity="0.9">Auth Service</text>
  </g>
  <g>
    <rect x="330" y="220" width="260" height="92" rx="22" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
    <text x="460" y="270" text-anchor="middle" font-family="Inter, ui-sans-serif" font-size="14" fill="white" fill-opacity="0.9">Account Service</text>
  </g>
  <g>
    <rect x="330" y="330" width="260" height="92" rx="22" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
    <text x="460" y="380" text-anchor="middle" font-family="Inter, ui-sans-serif" font-size="14" fill="white" fill-opacity="0.9">Transfer Service</text>
  </g>

  <!-- Data stores -->
  <g>
    <rect x="680" y="160" width="230" height="96" rx="20" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
    <text x="795" y="212" text-anchor="middle" font-family="Inter, ui-sans-serif" font-size="14" fill="white" fill-opacity="0.9">Accounts DB</text>
    <text x="795" y="234" text-anchor="middle" font-family="Inter, ui-sans-serif" font-size="11" fill="white" fill-opacity="0.55">Balances / Ledger</text>
  </g>
  <g>
    <rect x="680" y="290" width="230" height="96" rx="20" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
    <text x="795" y="342" text-anchor="middle" font-family="Inter, ui-sans-serif" font-size="14" fill="white" fill-opacity="0.9">Recipient Bank</text>
    <text x="795" y="364" text-anchor="middle" font-family="Inter, ui-sans-serif" font-size="11" fill="white" fill-opacity="0.55">External network</text>
  </g>

  <!-- Flows -->
  <path d="M 270 212 C 305 190, 305 170, 330 156" stroke="#4f6ef7" stroke-width="3" fill="none" marker-end="url(#arrow)"/>
  <path d="M 270 228 C 305 240, 305 250, 330 266" stroke="#4f6ef7" stroke-width="3" fill="none" marker-end="url(#arrow)"/>
  <path d="M 270 244 C 305 290, 305 320, 330 356" stroke="#4f6ef7" stroke-width="3" fill="none" marker-end="url(#arrow)"/>

  <path d="M 590 266 C 635 250, 650 230, 680 208" stroke="#22d3ee" stroke-width="3" fill="none" marker-end="url(#arrow2)" opacity="0.9"/>
  <path d="M 590 376 C 635 360, 650 350, 680 338" stroke="#22d3ee" stroke-width="3" fill="none" marker-end="url(#arrow2)" opacity="0.9"/>

  <!-- Trust boundaries -->
  <rect x="300" y="92" width="640" height="342" rx="26" fill="none" stroke="rgba(124,58,237,0.55)" stroke-width="2" stroke-dasharray="8 8"/>
  <text x="312" y="112" font-family="Inter, ui-sans-serif" font-size="11" fill="rgba(124,58,237,0.9)">Trust boundary: server-side services</text>
</svg>`
}
