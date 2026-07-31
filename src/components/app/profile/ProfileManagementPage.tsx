'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { GitBranch, Globe, GraduationCap, Link as LinkIcon, Plus, Save, Trash2, Upload, User } from 'lucide-react'

import { useToast } from '@/components/ui/toast'

const ProfileSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(60),
  headline: z.string().max(80).optional().or(z.literal('')),
  bio: z.string().max(420).optional().or(z.literal('')),
  education: z.string().max(120).optional().or(z.literal('')),
  website: z.string().url('Website must be a valid URL').optional().or(z.literal('')),
  github: z.string().url('GitHub must be a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('LinkedIn must be a valid URL').optional().or(z.literal('')),
})

type ProfileForm = z.infer<typeof ProfileSchema>

type StoredProfile = ProfileForm & {
  avatarDataUrl?: string
  skills?: string[]
}

const STORAGE_KEY = 'hirequest.profile'

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

export function ProfileManagementPage() {
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(undefined)
  const [skills, setSkills] = useState<string[]>([])
  const [skillDraft, setSkillDraft] = useState('')

  const defaults = useMemo<ProfileForm>(() => {
    const stored = typeof window !== 'undefined' ? readStoredProfile() : null
    return {
      name: stored?.name ?? 'Test User',
      headline: stored?.headline ?? 'Interview prep enthusiast',
      bio: stored?.bio ?? '',
      education: stored?.education ?? '',
      website: stored?.website ?? '',
      github: stored?.github ?? '',
      linkedin: stored?.linkedin ?? '',
    }
  }, [])

  const form = useForm<ProfileForm>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: defaults,
    mode: 'onChange',
  })

  useEffect(() => {
    const stored = readStoredProfile()
    if (!stored) return
    setAvatarDataUrl(stored.avatarDataUrl)
    setSkills(stored.skills ?? [])
  }, [])

  const onSubmit = (values: ProfileForm) => {
    const next: StoredProfile = { ...values, avatarDataUrl, skills }
    try {
      writeStoredProfile(next)
      toast.success('Profile saved')
    } catch {
      toast.error('Failed to save profile')
    }
  }

  const addSkill = () => {
    const s = skillDraft.trim()
    if (!s) return
    setSkills((prev) => {
      const normalized = prev.map((x) => x.toLowerCase())
      if (normalized.includes(s.toLowerCase())) return prev
      return [...prev, s].slice(0, 20)
    })
    setSkillDraft('')
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div className="dashboard-card overflow-hidden">
        <div className="relative h-28 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent">
          <div className="absolute inset-0 bg-mesh opacity-40" />
          <div className="absolute inset-0 grid-bg opacity-25" />
        </div>
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="relative -mt-14 h-24 w-24 overflow-hidden rounded-3xl border border-white/10 bg-input/15 shadow-[var(--shadow-card)]">
                {avatarDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarDataUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-primary text-white">
                    <User className="h-7 w-7" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-lg font-semibold text-foreground">{form.watch('name')}</div>
                <div className="mt-1 text-xs text-muted-foreground">{form.watch('headline') || 'Add a headline'}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="hq-btn-primary h-10 gap-2 px-4 text-xs"
                  >
                    <Upload className="h-4 w-4" /> Upload avatar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarDataUrl(undefined)
                      toast.showToast('Avatar removed', 'info')
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-input/15 px-4 text-xs font-semibold text-foreground hover:bg-input/25 btn-micro"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" /> Remove
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      if (f.size > 1_500_000) {
                        toast.error('Avatar too large (max ~1.5MB)')
                        return
                      }
                      try {
                        const url = await fileToDataUrl(f)
                        setAvatarDataUrl(url)
                        toast.success('Avatar updated')
                      } catch {
                        toast.error('Failed to read image')
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              className="hq-btn-primary h-11 gap-2 rounded-2xl px-5 text-xs"
              disabled={!form.formState.isValid}
            >
              <Save className="h-4 w-4" /> Save profile
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="dashboard-card p-6 xl:col-span-2">
          <div className="text-sm font-semibold text-foreground">Profile details</div>
          <div className="mt-1 text-xs text-muted-foreground">Keep it short, sharp, and role-focused.</div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground">Name</span>
              <input className="h-11 w-full rounded-2xl border border-border bg-input/15 px-4 text-sm" {...form.register('name')} />
              {form.formState.errors.name ? <div className="text-xs text-red-300">{form.formState.errors.name.message}</div> : null}
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground">Headline</span>
              <input className="h-11 w-full rounded-2xl border border-border bg-input/15 px-4 text-sm" {...form.register('headline')} />
            </label>
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-xs font-semibold text-muted-foreground">Bio</span>
            <textarea rows={4} className="w-full rounded-2xl border border-border bg-input/15 px-4 py-3 text-sm" {...form.register('bio')} />
          </label>

          <label className="mt-4 block space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <GraduationCap className="h-4 w-4" /> Education
            </span>
            <input className="h-11 w-full rounded-2xl border border-border bg-input/15 px-4 text-sm" {...form.register('education')} />
          </label>
        </div>

        <div className="space-y-4">
          <div className="dashboard-card p-6">
            <div className="text-sm font-semibold text-foreground">Skills</div>
            <div className="mt-1 text-xs text-muted-foreground">Add up to 20 skills.</div>

            <div className="mt-4 flex items-center gap-2">
              <input
                value={skillDraft}
                onChange={(e) => setSkillDraft(e.target.value)}
                placeholder="e.g. System design"
                className="h-11 w-full rounded-2xl border border-border bg-input/15 px-4 text-sm"
              />
              <button
                type="button"
                onClick={addSkill}
                className="hq-btn-primary h-11 w-11 items-center justify-center rounded-2xl p-0"
                aria-label="Add skill"
              >
                <Plus className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {skills.length === 0 ? (
                <div className="text-xs text-muted-foreground">No skills added.</div>
              ) : (
                skills.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSkills((prev) => prev.filter((x) => x !== s))}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-input/10 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-input/20 btn-micro"
                    title="Remove"
                  >
                    {s} <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="dashboard-card p-6">
            <div className="text-sm font-semibold text-foreground">Social links</div>
            <div className="mt-1 text-xs text-muted-foreground">Optional — helps recruiters verify work.</div>

            <div className="mt-4 space-y-3">
              <label className="block space-y-2">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Globe className="h-4 w-4" /> Website
                </span>
                <input className="h-11 w-full rounded-2xl border border-border bg-input/15 px-4 text-sm" {...form.register('website')} />
                {form.formState.errors.website ? <div className="text-xs text-red-300">{form.formState.errors.website.message}</div> : null}
              </label>

              <label className="block space-y-2">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <GitBranch className="h-4 w-4" /> GitHub
                </span>
                <input className="h-11 w-full rounded-2xl border border-border bg-input/15 px-4 text-sm" {...form.register('github')} />
                {form.formState.errors.github ? <div className="text-xs text-red-300">{form.formState.errors.github.message}</div> : null}
              </label>

              <label className="block space-y-2">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <LinkIcon className="h-4 w-4" /> LinkedIn
                </span>
                <input className="h-11 w-full rounded-2xl border border-border bg-input/15 px-4 text-sm" {...form.register('linkedin')} />
                {form.formState.errors.linkedin ? <div className="text-xs text-red-300">{form.formState.errors.linkedin.message}</div> : null}
              </label>
            </div>

            <button
              type="submit"
              className="hq-btn-primary mt-5 h-11 w-full gap-2 rounded-2xl px-5 text-xs"
              disabled={!form.formState.isValid}
            >
              <Save className="h-4 w-4" /> Save changes
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

