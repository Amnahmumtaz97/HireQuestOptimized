'use client'

import { AccountDetailsForm } from '@/components/app/settings/AccountDetailsForm'

/** @deprecated Prefer Settings at /app/settings?tab=account — thin wrapper for redirects. */
export function AccountSettingsPanel() {
  return (
    <div className="dashboard-card p-5 sm:p-6">
      <AccountDetailsForm
        title="Account Settings"
        description="Update your personal details."
      />
    </div>
  )
}
