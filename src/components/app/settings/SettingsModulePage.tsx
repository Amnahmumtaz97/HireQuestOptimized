'use client'

import { useMemo, useState } from 'react'
import { KeyRound, Palette, Shield, Trash2, User2, Bell, SlidersHorizontal } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useToast } from '@/components/ui/toast'

export function SettingsModulePage() {
  const toast = useToast()
  const { theme, setTheme } = useTheme()
  const [tab, setTab] = useState('profile')
  const [deleteOpen, setDeleteOpen] = useState(false)

  const appearanceLabel = useMemo(() => (theme === 'light' ? 'Light' : 'Dark'), [theme])

  return (
    <div className="animate-fade-up space-y-6">
      <div className="dashboard-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Settings</div>
            <div className="text-xs text-muted-foreground">Account, preferences, security & appearance</div>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <TabsList className="flex-wrap">
              <TabsTrigger value="profile" className="gap-2"><User2 className="h-4 w-4" /> Profile</TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2"><SlidersHorizontal className="h-4 w-4" /> Preferences</TabsTrigger>
              <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Security</TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2"><Palette className="h-4 w-4" /> Appearance</TabsTrigger>
              <TabsTrigger value="danger" className="gap-2"><Trash2 className="h-4 w-4" /> Danger</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile">
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-input/10 p-5">
                <div className="text-sm font-semibold text-foreground">Profile settings</div>
                <div className="mt-1 text-xs text-muted-foreground">Managed from the Profile page.</div>
                <div className="mt-4 rounded-xl border border-border bg-input/10 p-4 text-xs text-muted-foreground">
                  Tip: Use Profile to update avatar, skills, and social links.
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-input/10 p-5">
                <div className="text-sm font-semibold text-foreground">Connected apps</div>
                <div className="mt-1 text-xs text-muted-foreground">Coming soon: GitHub, Google, and calendar sync.</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-input/10 p-5">
                <div className="text-sm font-semibold text-foreground">Experience</div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Reduce motion</div>
                      <div className="text-xs text-muted-foreground">Minimize animations where possible.</div>
                    </div>
                    <Switch onCheckedChange={() => toast.showToast('Saved', 'info')} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Auto-save drafts</div>
                      <div className="text-xs text-muted-foreground">Save interview wizard drafts locally.</div>
                    </div>
                    <Switch defaultChecked onCheckedChange={() => toast.showToast('Saved', 'info')} />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-input/10 p-5">
                <div className="text-sm font-semibold text-foreground">Default difficulty</div>
                <div className="mt-1 text-xs text-muted-foreground">Applied when you create new interviews.</div>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-input/10 text-xs font-semibold text-foreground hover:bg-input/20 btn-micro"
                      onClick={() => toast.success(`Default set to ${d}`)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-input/10 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <KeyRound className="h-4 w-4 text-muted-foreground" /> Password
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Change your password securely.</div>
                <div className="mt-4 space-y-3">
                  <input className="h-11 w-full rounded-2xl border border-border bg-input/15 px-4 text-sm" placeholder="Current password" type="password" />
                  <input className="h-11 w-full rounded-2xl border border-border bg-input/15 px-4 text-sm" placeholder="New password" type="password" />
                  <button
                    type="button"
                    className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-primary px-5 text-xs font-semibold text-white shadow-glow-sm hover:shadow-glow btn-micro"
                    onClick={() => toast.success('Password updated')}
                  >
                    Update password
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-input/10 p-5">
                <div className="text-sm font-semibold text-foreground">Security</div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Two-factor authentication</div>
                      <div className="text-xs text-muted-foreground">Extra protection for your account.</div>
                    </div>
                    <Switch onCheckedChange={() => toast.showToast('2FA settings saved', 'info')} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Biometric unlock</div>
                      <div className="text-xs text-muted-foreground">Use device biometrics (if supported).</div>
                    </div>
                    <Switch defaultChecked onCheckedChange={() => toast.showToast('Saved', 'info')} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-input/10 p-5">
                <div className="text-sm font-semibold text-foreground">Alerts</div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Interview reminders</div>
                      <div className="text-xs text-muted-foreground">Upcoming sessions and nudges.</div>
                    </div>
                    <Switch defaultChecked onCheckedChange={() => toast.showToast('Saved', 'info')} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Weekly progress report</div>
                      <div className="text-xs text-muted-foreground">Trends and recommendations.</div>
                    </div>
                    <Switch onCheckedChange={() => toast.showToast('Saved', 'info')} />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-input/10 p-5">
                <div className="text-sm font-semibold text-foreground">Email</div>
                <div className="mt-1 text-xs text-muted-foreground">Control what reaches your inbox.</div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Product updates</div>
                      <div className="text-xs text-muted-foreground">Occasional release highlights.</div>
                    </div>
                    <Switch defaultChecked onCheckedChange={() => toast.showToast('Saved', 'info')} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Security alerts</div>
                      <div className="text-xs text-muted-foreground">Login and account events.</div>
                    </div>
                    <Switch defaultChecked onCheckedChange={() => toast.showToast('Saved', 'info')} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance">
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-input/10 p-5">
                <div className="text-sm font-semibold text-foreground">Theme</div>
                <div className="mt-1 text-xs text-muted-foreground">Currently: {appearanceLabel}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-input/10 px-5 text-xs font-semibold text-foreground hover:bg-input/20 btn-micro"
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-input/10 px-5 text-xs font-semibold text-foreground hover:bg-input/20 btn-micro"
                  >
                    Light
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-input/10 p-5">
                <div className="text-sm font-semibold text-foreground">Density</div>
                <div className="mt-1 text-xs text-muted-foreground">Spacing and component compactness.</div>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {(['Cozy', 'Default', 'Compact'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-input/10 text-xs font-semibold text-foreground hover:bg-input/20 btn-micro"
                      onClick={() => toast.showToast(`${d} density selected`, 'info')}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="danger">
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
              <div className="text-sm font-semibold text-red-100">Danger zone</div>
              <div className="mt-1 text-xs text-red-100/75">
                Account deletion is irreversible. This UI is wired for the modal; you can connect it to your backend when ready.
              </div>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-red-600 px-5 text-xs font-semibold text-white hover:bg-red-500 btn-micro"
              >
                Delete account
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete account?"
        description="This action cannot be undone. Your interview history, results, and billing records will be permanently removed."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={async () => {
          await new Promise((r) => setTimeout(r, 600))
          setDeleteOpen(false)
          toast.error('Account deletion is not connected yet')
        }}
      />
    </div>
  )
}

