'use client'

import {
  siGooglecloud, siCisco, siMeta, siNvidia, siMongodb, siGithub,
  siFreecodecamp, siHackerrank, siHashicorp, siRedhat, siDocker,
  siLinuxfoundation, siDatabricks, siPython, siFortinet, siCncf,
  siComptia, siIsc2, siAnthropic, siScrumalliance,
  siHuggingface, siSnowflake, siLangchain,
} from 'simple-icons'
import { providerAbbr, providerColors } from '@/lib/certifications/constants'

type SimpleIconData = { title: string; slug: string; hex: string; path: string }

const SIMPLE_ICONS: Record<string, SimpleIconData> = {
  cisco: siCisco,
  meta: siMeta,
  nvidia: siNvidia,
  mongodb: siMongodb,
  github: siGithub,
  freecodecamp: siFreecodecamp,
  hackerrank: siHackerrank,
  hashicorp: siHashicorp,
  redhat: siRedhat,
  docker: siDocker,
  linux: siLinuxfoundation,
  databricks: siDatabricks,
  pythoninstitute: siPython,
  fortinet: siFortinet,
  cncf: siCncf,
  comptia: siComptia,
  isc2: siIsc2,
  anthropic: siAnthropic,
  scrum: siScrumalliance,
  googlecloud: siGooglecloud,
  huggingface: siHuggingface,
  snowflake: siSnowflake,
  langchain: siLangchain,
}

// ── Custom full-color brand marks (not in simple-icons, or better in color) ──

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <rect x="1.5" y="1.5" width="10" height="10" fill="#F25022" />
      <rect x="12.5" y="1.5" width="10" height="10" fill="#7FBA00" />
      <rect x="1.5" y="12.5" width="10" height="10" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="10" height="10" fill="#FFB900" />
    </svg>
  )
}

function AwsLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <path
        fill="#232F3E"
        d="M7.05 8.85c0 .78.22 1.38.66 1.8.44.42 1.04.63 1.8.63.7 0 1.26-.17 1.68-.52V9.4c-.34.26-.74.4-1.18.4-.42 0-.74-.1-.96-.32-.22-.22-.34-.52-.34-.9s.12-.68.34-.9c.22-.22.54-.32.96-.32.46 0 .86.14 1.2.4V6.4c-.42-.26-.98-.4-1.68-.4-.82 0-1.46.22-1.92.66-.46.44-.7 1.06-.7 1.86zm5.55 0c0 .78.2 1.38.58 1.8.38.42.94.63 1.68.63s1.3-.21 1.68-.63c.38-.42.58-1.02.58-1.8s-.2-1.38-.58-1.8c-.38-.42-.94-.63-1.68-.63s-1.3.21-1.68.63c-.38.42-.58 1.02-.58 1.8zm1.4 0c0-.42.08-.74.26-.96.18-.22.42-.32.74-.32s.56.1.74.32c.18.22.26.54.26.96s-.08.74-.26.96c-.18.22-.42.32-.74.32s-.56-.1-.74-.32c-.18-.22-.26-.54-.26-.96z"
      />
      <path
        fill="#FF9900"
        d="M4.2 15.05c2.7 2 6.2 3.15 10 3.15 2.35 0 4.6-.45 6.65-1.25.4-.16.58.26.32.52-1.6 1.55-5.2 2.68-8.55 2.68-4.9 0-9.2-1.82-12.35-4.82-.24-.22.02-.52.38-.56.16 0 .28.06.4.28.05 0 .1 0 .15 0z"
      />
    </svg>
  )
}

function IbmLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <g fill="#0F62FE">
        <rect x="2" y="3.2" width="20" height="1.35" />
        <rect x="2" y="5.55" width="20" height="1.35" />
        <rect x="5.2" y="7.9" width="5.1" height="1.35" />
        <rect x="13.7" y="7.9" width="5.1" height="1.35" />
        <rect x="5.2" y="10.25" width="5.1" height="1.35" />
        <rect x="13.7" y="10.25" width="5.1" height="1.35" />
        <rect x="5.2" y="12.6" width="5.1" height="1.35" />
        <rect x="13.7" y="12.6" width="5.1" height="1.35" />
        <rect x="2" y="14.95" width="20" height="1.35" />
        <rect x="2" y="17.3" width="20" height="1.35" />
        <rect x="2" y="19.65" width="20" height="1.35" />
      </g>
    </svg>
  )
}

function OracleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <ellipse cx="12" cy="12" rx="9.2" ry="6.4" fill="none" stroke="#C74634" strokeWidth="2.4" />
    </svg>
  )
}

function PmiLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#F58025" />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fill="#fff"
        fontSize="8"
        fontWeight="800"
        fontFamily="Arial, sans-serif"
      >
        PMI
      </text>
    </svg>
  )
}

const CUSTOM_LOGOS: Record<string, () => JSX.Element> = {
  google: GoogleLogo,
  microsoft: MicrosoftLogo,
  aws: AwsLogo,
  ibm: IbmLogo,
  oracle: OracleLogo,
  pmi: PmiLogo,
}

type ProviderLogoProps = {
  slug: string
  name: string
  size?: string
  iconSize?: string
  className?: string
  colored?: boolean
}

export function ProviderLogo({
  slug,
  name,
  size = 'h-10 w-10',
  iconSize = 'h-6 w-6',
  className = '',
}: ProviderLogoProps) {
  const lowerSlug = slug.toLowerCase()
  const Custom = CUSTOM_LOGOS[lowerSlug]
  const si = SIMPLE_ICONS[lowerSlug]
  const abbr = providerAbbr(lowerSlug)
  const { bg: fallbackBg, text: fallbackText } = providerColors(lowerSlug)

  const plate = [
    'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-xl',
    'border border-black/8 bg-white p-[7px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]',
    size,
    className,
  ].join(' ')

  if (Custom) {
    return (
      <span className={plate} aria-label={name} title={name}>
        <span className={['block', iconSize].join(' ')}>
          <Custom />
        </span>
      </span>
    )
  }

  if (si) {
    const isDark = ['000000', '0A0A23', '181717', '231F20', '1A1A1A'].includes(si.hex.toUpperCase())
    return (
      <span className={plate} aria-label={name} title={name}>
        <svg
          viewBox="0 0 24 24"
          fill={isDark ? '#111111' : `#${si.hex}`}
          className={iconSize}
          role="img"
          aria-hidden
        >
          <title>{si.title}</title>
          <path d={si.path} />
        </svg>
      </span>
    )
  }

  return (
    <span
      className={[
        'inline-flex shrink-0 select-none items-center justify-center rounded-xl',
        'text-[10px] font-extrabold tracking-tighter',
        fallbackBg,
        fallbackText,
        size,
        className,
      ].join(' ')}
      aria-label={name}
      title={name}
    >
      {abbr}
    </span>
  )
}
