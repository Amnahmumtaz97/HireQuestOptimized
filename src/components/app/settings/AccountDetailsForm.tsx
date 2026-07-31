'use client'

import { useEffect, useMemo, useState } from 'react'
import { validateAccountProfile, type FieldErrors } from '@/lib/validation/client-forms'
import { LoadingButton } from '@/components/ui/loading-button'
import { BounceLoader } from '@/components/ui/bounce-loader'
import { useToast } from '@/components/ui/toast'

export type AccountFormData = {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
}

const defaultFormData: AccountFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
}

type AccountDetailsFormProps = {
  title?: string
  description?: string
}

export function AccountDetailsForm({
  title = 'Account',
  description = 'Update your name, email, and phone number.',
}: AccountDetailsFormProps) {
  const toast = useToast()
  const [formData, setFormData] = useState<AccountFormData>(defaultFormData)
  const [initialData, setInitialData] = useState<AccountFormData>(defaultFormData)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    async function loadAccount() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/account')
        const data = await response.json()

        if (!response.ok) {
          setError(data.message || 'Failed to load account settings')
          return
        }

        const loadedData: AccountFormData = {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
        }

        setFormData(loadedData)
        setInitialData(loadedData)
      } catch {
        setError('Failed to load account settings')
      } finally {
        setIsLoading(false)
      }
    }

    void loadAccount()
  }, [])

  const isDirty = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(initialData),
    [formData, initialData],
  )

  const handleChange =
    (field: keyof AccountFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setMessage('')
      setError('')
      setFieldErrors((prev) => {
        const k = field as keyof FieldErrors
        if (!prev[k]) return prev
        const next = { ...prev }
        delete next[k]
        return next
      })
      setFormData((previous) => ({
        ...previous,
        [field]: event.target.value,
      }))
    }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')
    const { ok, errors } = validateAccountProfile(formData)
    if (!ok) {
      setFieldErrors(errors)
      setError('Please fix the highlighted fields.')
      toast.error('Please fix the highlighted fields.')
      return
    }
    setFieldErrors({})
    setIsSaving(true)

    try {
      const response = await fetch('/api/account', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()

      if (!response.ok) {
        const msg = data.message || 'Failed to update account settings'
        setError(msg)
        toast.error(msg)
        return
      }

      const nextData: AccountFormData = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
      }

      setFormData(nextData)
      setInitialData(nextData)
      setMessage('Account settings saved successfully')
      toast.success('Account settings saved')
    } catch {
      setError('Failed to update account settings')
      toast.error('Failed to update account settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <BounceLoader label="Loading account details" />
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>

      <form className="mt-6 space-y-4" onSubmit={handleSave}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs text-muted-foreground">First Name</span>
            <input
              value={formData.firstName}
              onChange={handleChange('firstName')}
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              required
              aria-invalid={Boolean(fieldErrors.firstName)}
            />
            {fieldErrors.firstName ? (
              <p className="text-xs text-red-400">{fieldErrors.firstName}</p>
            ) : null}
          </label>

          <label className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Last Name</span>
            <input
              value={formData.lastName}
              onChange={handleChange('lastName')}
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              required
              aria-invalid={Boolean(fieldErrors.lastName)}
            />
            {fieldErrors.lastName ? (
              <p className="text-xs text-red-400">{fieldErrors.lastName}</p>
            ) : null}
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs text-muted-foreground">Email Address</span>
          <input
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            required
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email ? <p className="text-xs text-red-400">{fieldErrors.email}</p> : null}
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs text-muted-foreground">Phone Number</span>
          <input
            value={formData.phoneNumber}
            onChange={handleChange('phoneNumber')}
            className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            placeholder="+91 9876543210"
            aria-invalid={Boolean(fieldErrors.phoneNumber)}
          />
          {fieldErrors.phoneNumber ? (
            <p className="text-xs text-red-400">{fieldErrors.phoneNumber}</p>
          ) : null}
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-400">{message}</p> : null}

        <LoadingButton
          type="submit"
          loading={isSaving}
          loadingLabel="Saving..."
          disabled={!isDirty || isSaving}
          className="hq-btn-primary h-10 rounded-full px-5 text-sm"
        >
          Save changes
        </LoadingButton>
      </form>
    </div>
  )
}
