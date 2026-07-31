'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Bell,
  KeyRound,
  Palette,
  Shield,
  SlidersHorizontal,
  Trash2,
  User2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useToast } from '@/components/ui/toast'
import { Switch } from '@/components/ui/switch'
import { LoadingButton } from '@/components/ui/loading-button'
import { BounceLoader } from '@/components/ui/bounce-loader'
import {
  validateChangePassword,
  type FieldErrors,
} from '@/lib/validation/client-forms'
import { AccountDetailsForm } from '@/components/app/settings/AccountDetailsForm'
import { applyReduceMotionPreference } from '@/lib/preferences/client'

const SECTIONS = [
  { id: 'account', label: 'Account', icon: User2 },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'danger', label: 'Danger zone', icon: Trash2 },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

const VALID_SECTIONS = new Set<string>(SECTIONS.map((s) => s.id))

/** Map legacy query values to current section ids */
function resolveSection(raw: string | null): SectionId {
  if (!raw) return 'account'
  if (raw === 'profile') return 'account'
  if (VALID_SECTIONS.has(raw)) return raw as SectionId
  return 'account'
}

type PreferenceDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Adaptive'

type AccountMeta = {
  authProvider: string
  hasPassword: boolean
  preferences: {
    defaultDifficulty: PreferenceDifficulty | null
    reduceMotion: boolean
  }
}

function ComingSoonPanel({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-input/5 px-5 py-10 text-center">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">{description}</p>
      <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
        Coming soon
      </p>
    </div>
  )
}

function SecurityPanel({
  authProvider,
  hasPassword,
}: {
  authProvider: string
  hasPassword: boolean
}) {
  const toast = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const providerLabel =
    authProvider === 'google'
      ? 'Google'
      : authProvider === 'github'
        ? 'GitHub'
        : 'email and password'

  if (!hasPassword) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Security</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            How you sign in to HireQuest.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-input/10 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            Signed in with {providerLabel}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            This account does not have a password. Sign in continues through{' '}
            {providerLabel}. Password change is unavailable for social accounts.
          </p>
        </div>
        <ComingSoonPanel
          title="Two-factor authentication"
          description="Extra login protection will be available here in a future update."
        />
      </div>
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    const { ok, errors } = validateChangePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    })
    if (!ok) {
      setFieldErrors(errors)
      toast.error('Please fix the highlighted fields.')
      return
    }
    setFieldErrors({})
    setIsSaving(true)
    try {
      const response = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await response.json()
      if (!response.ok) {
        const msg = data.message || 'Failed to update password'
        setError(msg)
        toast.error(msg)
        return
      }
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password updated')
    } catch {
      setError('Failed to update password')
      toast.error('Failed to update password')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Security</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Change your password. You signed in with {providerLabel}.
        </p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block space-y-1.5">
          <span className="text-xs text-muted-foreground">Current password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value)
              setFieldErrors((prev) => {
                if (!prev.currentPassword) return prev
                const next = { ...prev }
                delete next.currentPassword
                return next
              })
            }}
            className="h-11 w-full rounded-2xl border border-border bg-input/15 px-4 text-sm"
            aria-invalid={Boolean(fieldErrors.currentPassword)}
          />
          {fieldErrors.currentPassword ? (
            <p className="text-xs text-red-400">{fieldErrors.currentPassword}</p>
          ) : null}
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs text-muted-foreground">New password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
              setFieldErrors((prev) => {
                if (!prev.newPassword) return prev
                const next = { ...prev }
                delete next.newPassword
                return next
              })
            }}
            className="h-11 w-full rounded-2xl border border-border bg-input/15 px-4 text-sm"
            aria-invalid={Boolean(fieldErrors.newPassword)}
          />
          {fieldErrors.newPassword ? (
            <p className="text-xs text-red-400">{fieldErrors.newPassword}</p>
          ) : null}
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs text-muted-foreground">Confirm new password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setFieldErrors((prev) => {
                if (!prev.confirmPassword) return prev
                const next = { ...prev }
                delete next.confirmPassword
                return next
              })
            }}
            className="h-11 w-full rounded-2xl border border-border bg-input/15 px-4 text-sm"
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
          />
          {fieldErrors.confirmPassword ? (
            <p className="text-xs text-red-400">{fieldErrors.confirmPassword}</p>
          ) : null}
        </label>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <LoadingButton
          type="submit"
          loading={isSaving}
          loadingLabel="Updating..."
          className="hq-btn-primary h-11 rounded-2xl px-5 text-xs"
        >
          Update password
        </LoadingButton>
      </form>

      <ComingSoonPanel
        title="Two-factor authentication"
        description="Extra login protection will be available here in a future update."
      />
    </div>
  )
}

function PreferencesPanel({
  initial,
  onSaved,
}: {
  initial: AccountMeta['preferences']
  onSaved: (prefs: AccountMeta['preferences']) => void
}) {
  const toast = useToast()
  const [defaultDifficulty, setDefaultDifficulty] = useState<
    PreferenceDifficulty | null
  >(initial.defaultDifficulty)
  const [reduceMotion, setReduceMotion] = useState(initial.reduceMotion)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setDefaultDifficulty(initial.defaultDifficulty)
    setReduceMotion(initial.reduceMotion)
  }, [initial])

  const isDirty =
    defaultDifficulty !== initial.defaultDifficulty ||
    reduceMotion !== initial.reduceMotion

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: {
            defaultDifficulty,
            reduceMotion,
          },
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.message || 'Failed to save preferences')
        return
      }
      const next = {
        defaultDifficulty:
          (data.preferences?.defaultDifficulty as PreferenceDifficulty | null) ??
          null,
        reduceMotion: Boolean(data.preferences?.reduceMotion),
      }
      applyReduceMotionPreference(next.reduceMotion)
      onSaved(next)
      toast.success('Preferences saved')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const difficulties: PreferenceDifficulty[] = [
    'Easy',
    'Medium',
    'Hard',
    'Adaptive',
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Preferences</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Defaults that apply when you create interviews and how motion behaves.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-input/10 p-5">
        <div className="text-sm font-semibold text-foreground">Default difficulty</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Pre-selected when you start a new interview (you can still change it).
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {difficulties.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDefaultDifficulty(d)}
              className={cn(
                'inline-flex h-10 items-center justify-center rounded-xl border text-xs font-semibold btn-micro',
                defaultDifficulty === d
                  ? 'border-primary bg-primary/15 text-foreground'
                  : 'border-border bg-input/10 text-foreground hover:bg-input/20',
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-input/10 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Reduce motion</div>
            <div className="text-xs text-muted-foreground">
              Minimize animations where possible.
            </div>
          </div>
          <Switch
            checked={reduceMotion}
            onCheckedChange={(checked) => setReduceMotion(checked)}
          />
        </div>
      </div>

      <LoadingButton
        type="button"
        loading={isSaving}
        loadingLabel="Saving..."
        disabled={!isDirty || isSaving}
        onClick={() => void handleSave()}
        className="hq-btn-primary h-10 rounded-full px-5 text-sm"
      >
        Save preferences
      </LoadingButton>
    </div>
  )
}

export function SettingsModulePage() {
  const { theme, setTheme } = useTheme()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const tabFromUrl = searchParams.get('tab')
  const section = resolveSection(tabFromUrl)

  const [meta, setMeta] = useState<AccountMeta | null>(null)
  const [metaLoading, setMetaLoading] = useState(true)
  const [metaError, setMetaError] = useState('')

  const setSection = useCallback(
    (id: SectionId) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', id)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  useEffect(() => {
    // Normalize legacy ?tab=profile
    if (tabFromUrl === 'profile') {
      setSection('account')
    }
  }, [tabFromUrl, setSection])

  useEffect(() => {
    let cancelled = false
    async function loadMeta() {
      try {
        setMetaLoading(true)
        const response = await fetch('/api/account')
        const data = await response.json()
        if (!response.ok) {
          if (!cancelled) {
            setMetaError(data.message || 'Failed to load settings')
          }
          return
        }
        if (cancelled) return
        const prefs = {
          defaultDifficulty:
            (data.preferences?.defaultDifficulty as PreferenceDifficulty | null) ??
            null,
          reduceMotion: Boolean(data.preferences?.reduceMotion),
        }
        setMeta({
          authProvider: data.authProvider || 'credentials',
          hasPassword: Boolean(data.hasPassword),
          preferences: prefs,
        })
        applyReduceMotionPreference(prefs.reduceMotion)
        setMetaError('')
      } catch {
        if (!cancelled) setMetaError('Failed to load settings')
      } finally {
        if (!cancelled) setMetaLoading(false)
      }
    }
    void loadMeta()
    return () => {
      cancelled = true
    }
  }, [])

  const appearanceLabel = useMemo(
    () => (theme === 'light' ? 'Light' : 'Dark'),
    [theme],
  )

  return (
    <div className="animate-fade-up space-y-6">
      <div className="dashboard-card p-5">
        <div>
          <div className="text-sm font-semibold text-foreground">Settings</div>
          <div className="text-xs text-muted-foreground">
            Account, security, appearance, and preferences
          </div>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[200px,1fr]">
          <nav
            className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
            aria-label="Settings sections"
          >
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                  section === id
                    ? 'bg-input/30 border border-border font-medium text-foreground'
                    : 'border border-transparent text-muted-foreground hover:bg-input/15 hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            ))}
          </nav>

          <div className="min-w-0 rounded-2xl border border-border bg-input/5 p-5 sm:p-6">
            {section === 'account' ? <AccountDetailsForm /> : null}

            {section === 'security' ? (
              metaLoading ? (
                <div className="flex justify-center py-10">
                  <BounceLoader label="Loading security" />
                </div>
              ) : metaError ? (
                <p className="text-sm text-red-400">{metaError}</p>
              ) : meta ? (
                <SecurityPanel
                  authProvider={meta.authProvider}
                  hasPassword={meta.hasPassword}
                />
              ) : null
            ) : null}

            {section === 'appearance' ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Theme applies immediately across the app.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-input/10 p-5">
                  <div className="text-sm font-semibold text-foreground">Theme</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Currently: {appearanceLabel}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={cn(
                        'inline-flex h-11 items-center justify-center rounded-2xl border px-5 text-xs font-semibold btn-micro',
                        theme === 'dark'
                          ? 'border-primary bg-primary/15 text-foreground'
                          : 'border-border bg-input/10 text-foreground hover:bg-input/20',
                      )}
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={cn(
                        'inline-flex h-11 items-center justify-center rounded-2xl border px-5 text-xs font-semibold btn-micro',
                        theme === 'light'
                          ? 'border-primary bg-primary/15 text-foreground'
                          : 'border-border bg-input/10 text-foreground hover:bg-input/20',
                      )}
                    >
                      Light
                    </button>
                  </div>
                </div>
                <ComingSoonPanel
                  title="Density"
                  description="Compact and cozy layout options are not available yet."
                />
              </div>
            ) : null}

            {section === 'preferences' ? (
              metaLoading ? (
                <div className="flex justify-center py-10">
                  <BounceLoader label="Loading preferences" />
                </div>
              ) : metaError ? (
                <p className="text-sm text-red-400">{metaError}</p>
              ) : meta ? (
                <PreferencesPanel
                  initial={meta.preferences}
                  onSaved={(preferences) =>
                    setMeta((prev) => (prev ? { ...prev, preferences } : prev))
                  }
                />
              ) : null
            ) : null}

            {section === 'notifications' ? (
              <ComingSoonPanel
                title="Notifications"
                description="Interview reminders, weekly reports, and email alerts will be configurable here. Nothing is sent from this screen yet."
              />
            ) : null}

            {section === 'danger' ? (
              <ComingSoonPanel
                title="Danger zone"
                description="Account deletion is not available in-app yet. Contact support if you need help closing your account."
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
