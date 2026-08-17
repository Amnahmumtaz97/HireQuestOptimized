'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Briefcase,
  Check,
  ChevronDown,
  FileText,
  GitBranch,
  Globe,
  GraduationCap,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Sparkles,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react'

import { useToast } from '@/components/ui/toast'
import { ResumeUpload } from '@/components/app/ResumeUpload'
import { StyledSelect } from '@/components/ui/styled-select'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SENIORITY_UI_OPTIONS } from '@/lib/interview-config/experience'
import type { ResumeParseResult } from '@/lib/resume/schema'
import { setSavedProfileResume } from '@/lib/profile/storage'

const YEARS_OPTIONS = ['0–1', '1–3', '3–5', '5–8', '8+'] as const

const SKILL_OPTIONS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Python',
  'Java',
  'SQL',
  'APIs',
  'System design',
  'DSA',
  'DevOps',
  'AWS',
  'Docker',
  'Kubernetes',
  'Machine learning',
  'Data structures',
  'Communication',
  'Leadership',
  'Product sense',
] as const

const MAX_SKILLS = 20

function withProtocol(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function isLikelyUrl(value: string) {
  try {
    const url = new URL(withProtocol(value.trim()))
    return url.hostname.includes('.')
  } catch {
    return false
  }
}

const linkField = (label: string) =>
  z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || isLikelyUrl(v), `${label} must look like a valid link`)

const ProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(60),
  headline: z.string().trim().max(80, 'Keep the headline under 80 characters').optional().or(z.literal('')),
  bio: z.string().trim().max(240, 'Keep it under 240 characters').optional().or(z.literal('')),
  currentRole: z.string().trim().max(80).optional().or(z.literal('')),
  seniority: z.string().optional().or(z.literal('')),
  years: z.string().optional().or(z.literal('')),
  education: z.string().trim().max(120).optional().or(z.literal('')),
  location: z.string().trim().max(80).optional().or(z.literal('')),
  website: linkField('Website'),
  github: linkField('GitHub'),
  linkedin: linkField('LinkedIn'),
})

type ProfileForm = z.infer<typeof ProfileSchema>

type StoredProfile = ProfileForm & {
  avatarDataUrl?: string
  skills?: string[]
  resume?: ResumeParseResult | null
}

const STORAGE_KEY = 'hirequest.profile'

const EMPTY_PROFILE: ProfileForm = {
  name: '',
  headline: '',
  bio: '',
  currentRole: '',
  seniority: '',
  years: '',
  education: '',
  location: '',
  website: '',
  github: '',
  linkedin: '',
}

function readStoredProfile(): StoredProfile | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredProfile
  } catch {
    return null
  }
}

function writeStoredProfile(data: StoredProfile) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

async function fileToDataUrl(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return `data:${file.type};base64,${btoa(binary)}`
}

const fieldClass =
  'h-11 w-full rounded-xl border border-border bg-input/15 px-3.5 text-sm text-foreground outline-none transition focus:border-primary/50 focus:bg-input/25'

function Field({
  label,
  icon,
  hint,
  error,
  children,
}: {
  label: string
  icon?: ReactNode
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="block space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          {icon}
          {label}
        </span>
        {hint ? <span className="text-[10px] text-muted-foreground/70">{hint}</span> : null}
      </div>
      {children}
      {error ? <span className="block text-xs text-destructive">{error}</span> : null}
    </div>
  )
}

function Card({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="dashboard-card p-5 sm:p-6">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function SkillsDropdown({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const toggle = (skill: string) => {
    if (selected.includes(skill)) {
      onChange(selected.filter((s) => s !== skill))
      return
    }
    if (selected.length >= MAX_SKILLS) return
    onChange([...selected, skill])
  }

  const customSkills = selected.filter(
    (skill) => !(SKILL_OPTIONS as readonly string[]).includes(skill),
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={[
            'hq-cert-dd h-11 w-full justify-between rounded-xl px-3.5 text-sm font-medium',
            selected.length ? 'is-active' : '',
          ].join(' ')}
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              {selected.length ? `${selected.length} skill${selected.length === 1 ? '' : 's'} selected` : 'Choose skills'}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-72 w-72 overflow-y-auto"
      >
        <DropdownMenuLabel>Popular skills</DropdownMenuLabel>
        {SKILL_OPTIONS.map((skill) => {
          const checked = selected.includes(skill)
          const atLimit = !checked && selected.length >= MAX_SKILLS
          return (
            <DropdownMenuCheckboxItem
              key={skill}
              checked={checked}
              disabled={atLimit}
              onCheckedChange={() => toggle(skill)}
              onSelect={(e) => e.preventDefault()}
            >
              {skill}
            </DropdownMenuCheckboxItem>
          )
        })}
        {customSkills.length ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>From your resume</DropdownMenuLabel>
            {customSkills.map((skill) => (
              <DropdownMenuCheckboxItem
                key={skill}
                checked
                onCheckedChange={() => toggle(skill)}
                onSelect={(e) => e.preventDefault()}
              >
                {skill}
              </DropdownMenuCheckboxItem>
            ))}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ProfileManagementPage() {
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const hydratedRef = useRef(false)
  const lastSavedRef = useRef('')
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(undefined)
  const [skills, setSkills] = useState<string[]>([])
  const [resume, setResume] = useState<ResumeParseResult | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'waiting'>('idle')

  const form = useForm<ProfileForm>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: EMPTY_PROFILE,
    mode: 'onChange',
  })

  const { errors } = form.formState

  useEffect(() => {
    const stored = readStoredProfile()
    if (stored) {
      const initial = { ...EMPTY_PROFILE, ...stored }
      form.reset(initial)
      setAvatarDataUrl(stored.avatarDataUrl)
      setSkills(stored.skills ?? [])
      setResume(stored.resume ?? null)
      lastSavedRef.current = JSON.stringify({
        ...initial,
        website: initial.website ? withProtocol(initial.website) : '',
        github: initial.github ? withProtocol(initial.github) : '',
        linkedin: initial.linkedin ? withProtocol(initial.linkedin) : '',
        avatarDataUrl: stored.avatarDataUrl,
        skills: stored.skills ?? [],
        resume: stored.resume ?? null,
      })
      setSaveStatus('saved')
    }
    hydratedRef.current = true
  }, [form])

  const values = form.watch()

  const completeness = useMemo(() => {
    const checks = [
      values.name,
      values.headline,
      values.currentRole,
      values.seniority,
      values.education,
      values.github || values.linkedin || values.website,
      skills.length > 0 ? 'yes' : '',
      resume ? 'yes' : '',
    ]
    const filled = checks.filter((v) => Boolean(v && String(v).trim())).length
    return Math.round((filled / checks.length) * 100)
  }, [values, skills.length, resume])

  useEffect(() => {
    if (!hydratedRef.current) return

    const parsed = ProfileSchema.safeParse(values)
    if (!parsed.success) {
      setSaveStatus('waiting')
      return
    }

    const next: StoredProfile = {
      ...parsed.data,
      website: parsed.data.website ? withProtocol(parsed.data.website) : '',
      github: parsed.data.github ? withProtocol(parsed.data.github) : '',
      linkedin: parsed.data.linkedin ? withProtocol(parsed.data.linkedin) : '',
      avatarDataUrl,
      skills,
      resume,
    }
    const snapshot = JSON.stringify(next)
    if (snapshot === lastSavedRef.current) {
      setSaveStatus('saved')
      return
    }

    setSaveStatus('saving')
    const timer = window.setTimeout(() => {
      try {
        writeStoredProfile(next)
        lastSavedRef.current = snapshot
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
        toast.error('Failed to save profile')
      }
    }, 550)

    return () => window.clearTimeout(timer)
  }, [values, skills, avatarDataUrl, resume, toast])

  const updateSkills = (next: string[]) => {
    setSkills(next.slice(0, MAX_SKILLS))
  }

  const yearsFromResume = (years: number | null | undefined): string => {
    if (typeof years !== 'number' || !Number.isFinite(years) || years < 0) return ''
    if (years <= 1) return '0–1'
    if (years <= 3) return '1–3'
    if (years <= 5) return '3–5'
    if (years <= 8) return '5–8'
    return '8+'
  }

  const applyResume = (parsed: ResumeParseResult) => {
    setResume(parsed)
    setSavedProfileResume(parsed)

    const setIfPresent = (key: keyof ProfileForm, value: string | null | undefined) => {
      const next = (value ?? '').trim()
      if (!next) return
      const max =
        key === 'bio'
          ? 240
          : key === 'headline'
            ? 80
            : key === 'github' || key === 'linkedin' || key === 'website'
              ? 200
              : 120
      form.setValue(key, next.slice(0, max), {
        shouldDirty: true,
        shouldValidate: true,
      })
    }

    setIfPresent('name', parsed.name)
    setIfPresent('headline', parsed.domain)
    setIfPresent('currentRole', parsed.domain)
    setIfPresent('github', parsed.github)
    setIfPresent('linkedin', parsed.linkedin)
    setIfPresent('website', parsed.website)

    if (parsed.seniorityLevel) {
      form.setValue('seniority', parsed.seniorityLevel, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }

    const years = yearsFromResume(parsed.yearsExperience)
    if (years) {
      form.setValue('years', years, { shouldDirty: true, shouldValidate: true })
    }

    const firstEducation = parsed.education?.[0]
    if (firstEducation) {
      setIfPresent(
        'education',
        [firstEducation.degree, firstEducation.institution].filter(Boolean).join(' · '),
      )
    }

    if (!form.getValues('bio')?.trim() && parsed.projects.length) {
      const summary = parsed.projects
        .slice(0, 2)
        .map((p) => {
          const title = p.name?.trim()
          const desc = p.description?.trim()
          if (title && desc) return `${title}: ${desc}`
          return desc || title
        })
        .filter(Boolean)
        .join(' ')
      setIfPresent('bio', summary)
    }

    if (parsed.skills.length) {
      setSkills((prev) => {
        const merged = [...prev]
        for (const skill of parsed.skills) {
          if (!merged.some((x) => x.toLowerCase() === skill.toLowerCase())) merged.push(skill)
        }
        return merged.slice(0, MAX_SKILLS)
      })
    }
  }

  return (
    <div className="animate-fade-up space-y-4">
      <div className="dashboard-card p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border bg-input/15 transition hover:border-primary/40"
            title="Change photo"
          >
            {avatarDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarDataUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center bg-primary/15 text-primary">
                <User className="h-4 w-4" />
              </span>
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-foreground">
              {values.name?.trim() || 'Your name'}
            </div>
            <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {values.headline?.trim() || values.currentRole?.trim() || 'Complete the basics below'}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-input/10 px-2.5 text-[11px] font-semibold text-foreground hover:bg-input/20"
            >
              <Upload className="h-3 w-3" /> Photo
            </button>
            {avatarDataUrl ? (
              <button
                type="button"
                onClick={() => setAvatarDataUrl(undefined)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-input/10 text-muted-foreground hover:bg-input/20"
                aria-label="Remove photo"
                title="Remove photo"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            ) : null}
            <Link
              href="/app/settings?section=account"
              className="inline-flex h-8 items-center rounded-lg px-2 text-[11px] font-semibold text-primary hover:underline"
            >
              Account
            </Link>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                if (f.size > 1_500_000) {
                  toast.error('Photo too large (max ~1.5MB)')
                  return
                }
                try {
                  setAvatarDataUrl(await fileToDataUrl(f))
                  toast.success('Photo updated')
                } catch {
                  toast.error('Failed to read image')
                }
                e.target.value = ''
              }}
            />
          </div>

          <div className="flex w-full items-center gap-2.5 sm:ml-auto sm:w-auto sm:min-w-[11rem]">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-muted-foreground">
                <span>{completeness}% complete</span>
                <span
                  className={[
                    'inline-flex items-center gap-1',
                    saveStatus === 'error'
                      ? 'text-destructive'
                      : saveStatus === 'waiting'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-muted-foreground',
                  ].join(' ')}
                  aria-live="polite"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" /> Saving
                    </>
                  ) : saveStatus === 'saved' ? (
                    <>
                      <Check className="h-3 w-3 text-primary" /> Saved
                    </>
                  ) : saveStatus === 'error' ? (
                    'Save failed'
                  ) : saveStatus === 'waiting' ? (
                    errors.name ? 'Name needed' : 'Fix fields'
                  ) : (
                    'Autosave'
                  )}
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-input/30">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card title="Basics" description="Used to tailor question difficulty and role context.">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Field label="Full name" error={errors.name?.message}>
                <input className={fieldClass} placeholder="Alex Morgan" {...form.register('name')} />
              </Field>

              <Field label="Headline" hint={`${(values.headline || '').length}/80`} error={errors.headline?.message}>
                <input
                  className={fieldClass}
                  placeholder="Frontend engineer focused on React"
                  {...form.register('headline')}
                />
              </Field>

              <Field label="Current role" icon={<Briefcase className="h-3.5 w-3.5" />}>
                <input
                  className={fieldClass}
                  placeholder="Software Engineer at Systems Limited"
                  {...form.register('currentRole')}
                />
              </Field>

              <Field label="Location" icon={<MapPin className="h-3.5 w-3.5" />}>
                <input className={fieldClass} placeholder="Lahore, Pakistan" {...form.register('location')} />
              </Field>

              <Field label="Experience level">
                <StyledSelect
                  value={values.seniority || ''}
                  placeholder="Select level"
                  options={SENIORITY_UI_OPTIONS.map((opt) => ({
                    value: opt.key,
                    label: opt.label,
                  }))}
                  onChange={(next) =>
                    form.setValue('seniority', next, { shouldDirty: true, shouldValidate: true })
                  }
                />
              </Field>

              <Field label="Years of experience">
                <StyledSelect
                  value={values.years || ''}
                  placeholder="Select range"
                  options={YEARS_OPTIONS.map((opt) => ({
                    value: opt,
                    label: `${opt} years`,
                  }))}
                  onChange={(next) =>
                    form.setValue('years', next, { shouldDirty: true, shouldValidate: true })
                  }
                />
              </Field>

              <div className="sm:col-span-2">
                <Field
                  label="Education"
                  icon={<GraduationCap className="h-3.5 w-3.5" />}
                  hint="Degree · institution"
                >
                  <input
                    className={fieldClass}
                    placeholder="BS Computer Science · FAST NUCES"
                    {...form.register('education')}
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field
                  label="Short bio"
                  hint={`${(values.bio || '').length}/240`}
                  error={errors.bio?.message}
                >
                  <textarea
                    rows={2}
                    className="w-full resize-none rounded-xl border border-border bg-input/15 px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/50 focus:bg-input/25"
                    placeholder="Two lines on what you build and the roles you're targeting."
                    {...form.register('bio')}
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field
                  label="Resume"
                  icon={<FileText className="h-3.5 w-3.5" />}
                  hint="Prefills skills, level, and education"
                >
                  <ResumeUpload
                    value={resume}
                    variant="button"
                    onParsed={applyResume}
                    onClear={() => {
                      setResume(null)
                      setSavedProfileResume(null)
                    }}
                  />
                </Field>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Links" description="Paste a full URL or just the handle domain.">
            <div className="space-y-3.5">
              <Field label="GitHub" icon={<GitBranch className="h-3.5 w-3.5" />} error={errors.github?.message}>
                <input className={fieldClass} placeholder="github.com/username" {...form.register('github')} />
              </Field>

              <Field label="LinkedIn" icon={<LinkIcon className="h-3.5 w-3.5" />} error={errors.linkedin?.message}>
                <input className={fieldClass} placeholder="linkedin.com/in/username" {...form.register('linkedin')} />
              </Field>

              <Field label="Website" icon={<Globe className="h-3.5 w-3.5" />} error={errors.website?.message}>
                <input className={fieldClass} placeholder="yourdomain.com" {...form.register('website')} />
              </Field>
            </div>
          </Card>

          <Card title="Skills" description={`${skills.length}/${MAX_SKILLS} selected — pick from the list.`}>
            <SkillsDropdown selected={skills} onChange={updateSkills} />

            <div className="mt-3.5 flex flex-wrap gap-2">
              {skills.length === 0 ? (
                <p className="text-xs text-muted-foreground">No skills yet — open the dropdown or upload your resume.</p>
              ) : (
                skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-input/15 py-1 pl-3 pr-1.5 text-xs font-semibold text-foreground"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => updateSkills(skills.filter((x) => x !== s))}
                      className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-input/40 hover:text-foreground"
                      aria-label={`Remove ${s}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
