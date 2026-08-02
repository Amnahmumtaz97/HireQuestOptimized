'use client'

import { useEffect, useState } from 'react'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Phone } from 'lucide-react'
import Link from 'next/link'
import { getSession, signIn } from 'next-auth/react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  validateSignInFields,
  validateSignupFields,
  type FieldErrors,
} from '@/lib/validation/client-forms'
import type { EnabledOAuthProviders } from '@/lib/oauth-config'

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
      {children}
    </span>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12S6.6 21.8 12 21.8c5.5 0 9.1-3.8 9.1-9.2 0-.6-.1-1.1-.2-1.6H12z"
      />
      <path fill="#34A853" d="M3.2 7.1 6.4 9.5C7.3 7.2 9.4 5.6 12 5.6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 8.2 2.2 4.9 4.3 3.2 7.1z" />
      <path fill="#4A90E2" d="M12 21.8c2.5 0 4.6-.8 6.1-2.2l-2.9-2.3c-.8.6-1.9 1-3.2 1-2.5 0-4.6-1.7-5.4-4l-3.2 2.4c1.7 3.3 5.1 5.1 8.6 5.1z" />
      <path fill="#FBBC05" d="M6.6 14.3c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8L3.4 8.3C2.7 9.4 2.2 10.7 2.2 12s.5 2.6 1.2 3.7l3.2-1.4z" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.8c.85 0 1.71.12 2.51.35 1.9-1.32 2.74-1.05 2.74-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .26.18.59.69.48A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
    </svg>
  )
}

interface Props {
  mode: 'signin' | 'signup'
  onToggle: () => void
  oauth?: EnabledOAuthProviders
}

async function redirectAfterAuth() {
  const session = await getSession()
  const role = session?.user?.role
  const destination = role === 'admin' ? '/dashboard' : '/app/new-interview'
  window.location.assign(destination)
}

export function AuthForms({ mode, onToggle, oauth }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const isSignIn = mode === 'signin'
  const showGoogle = Boolean(oauth?.google)
  const showGitHub = Boolean(oauth?.github)
  const showOAuth = showGoogle || showGitHub

  const handleOAuth = async (provider: 'google' | 'github') => {
    setErrorMessage('')
    setOauthLoading(provider)
    try {
      // Middleware sends admins from /app → /dashboard after session is established.
      await signIn(provider, { callbackUrl: '/app/new-interview' })
    } catch {
      setErrorMessage('Could not start social sign-in. Please try again.')
      setOauthLoading(null)
    }
  }

  useEffect(() => {
    setFieldErrors({})
    setErrorMessage('')
    setSuccessMessage('')
  }, [mode])

  const clearFieldError = (key: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setFieldErrors({})

    if (isSignIn) {
      const { ok, errors } = validateSignInFields(email, password)
      if (!ok) {
        setFieldErrors(errors)
        setErrorMessage('Please fix the highlighted fields.')
        return
      }
    } else {
      const { ok, errors, message } = validateSignupFields({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        confirmPassword,
      })
      if (!ok) {
        setFieldErrors(errors)
        setErrorMessage(message ?? 'Please fix the highlighted fields.')
        return
      }
    }

    setIsSubmitting(true)

    try {
      if (isSignIn) {
        const response = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (response?.ok) {
          await redirectAfterAuth()
          return
        }

        setErrorMessage('Invalid email or password')
        return
      }

      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber,
          password,
          confirmPassword,
        }),
      })

      const signupData = await signupResponse.json()

      if (!signupResponse.ok) {
        setErrorMessage(signupData.message ?? 'Could not create account')
        return
      }

      const loginResponse = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (!loginResponse?.ok) {
        setSuccessMessage('Account created. Please sign in.')
        onToggle()
        return
      }

      await redirectAfterAuth()
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex h-full w-full flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="text-left">
          <h2 className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.02em] text-foreground leading-tight">
            {isSignIn ? 'Welcome back.' : 'Create your account.'}
          </h2>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            {isSignIn
              ? 'Sign in to continue practicing.'
              : 'Start your AI-powered interview prep today.'}
          </p>
        </div>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          {!isSignIn && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-[12px] font-semibold text-foreground/80">
                    First Name
                  </Label>
                  <div className="relative">
                    <FieldIcon>
                      <User className="h-3.5 w-3.5" />
                    </FieldIcon>
                    <Input
                      id="firstName"
                      placeholder="Jane"
                      className="h-10 pl-9 text-sm"
                      value={firstName}
                      onChange={(event) => {
                        setFirstName(event.target.value)
                        clearFieldError('firstName')
                      }}
                      required
                      aria-invalid={Boolean(fieldErrors.firstName)}
                    />
                  </div>
                  {fieldErrors.firstName ? (
                    <p className="text-[11px] text-red-500">{fieldErrors.firstName}</p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-[12px] font-semibold text-foreground/80">
                    Last Name
                  </Label>
                  <div className="relative">
                    <FieldIcon>
                      <User className="h-3.5 w-3.5" />
                    </FieldIcon>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="h-10 pl-9 text-sm"
                      value={lastName}
                      onChange={(event) => {
                        setLastName(event.target.value)
                        clearFieldError('lastName')
                      }}
                      required
                      aria-invalid={Boolean(fieldErrors.lastName)}
                    />
                  </div>
                  {fieldErrors.lastName ? (
                    <p className="text-[11px] text-red-500">{fieldErrors.lastName}</p>
                  ) : null}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" className="text-[12px] font-semibold text-foreground/80">
                  Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <FieldIcon>
                    <Phone className="h-3.5 w-3.5" />
                  </FieldIcon>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+91 9876543210"
                    className="h-10 pl-9 text-sm"
                    value={phoneNumber}
                    onChange={(event) => {
                      setPhoneNumber(event.target.value)
                      clearFieldError('phoneNumber')
                    }}
                    aria-invalid={Boolean(fieldErrors.phoneNumber)}
                  />
                </div>
                {fieldErrors.phoneNumber ? (
                  <p className="text-[11px] text-red-500">{fieldErrors.phoneNumber}</p>
                ) : null}
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[12px] font-semibold text-foreground/80">
              Email
            </Label>
            <div className="relative">
              <FieldIcon>
                <Mail className="h-3.5 w-3.5" />
              </FieldIcon>
              <Input
                id="email"
                type="email"
                placeholder="you@hirequest.ai"
                className="h-10 pl-9 text-sm"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  clearFieldError('email')
                }}
                required
                aria-invalid={Boolean(fieldErrors.email)}
              />
            </div>
            {fieldErrors.email ? <p className="text-[11px] text-red-500">{fieldErrors.email}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[12px] font-semibold text-foreground/80">
              Password
            </Label>
            <div className="relative">
              <FieldIcon>
                <Lock className="h-3.5 w-3.5" />
              </FieldIcon>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-10 pl-9 pr-10 text-sm"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  clearFieldError('password')
                }}
                required
                minLength={8}
                aria-invalid={Boolean(fieldErrors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-input/40 hover:text-primary"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password ? <p className="text-[11px] text-red-500">{fieldErrors.password}</p> : null}
          </div>

          {!isSignIn && (
            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-[12px] font-semibold text-foreground/80">
                Confirm Password
              </Label>
              <div className="relative">
                <FieldIcon>
                  <Lock className="h-3.5 w-3.5" />
                </FieldIcon>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  className="h-10 pl-9 text-sm"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value)
                    clearFieldError('confirmPassword')
                  }}
                  required
                  minLength={8}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                />
              </div>
              {fieldErrors.confirmPassword ? (
                <p className="text-[11px] text-red-500">{fieldErrors.confirmPassword}</p>
              ) : null}
            </div>
          )}

          {errorMessage ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-500">
              {errorMessage}
            </div>
          ) : null}
          {successMessage ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-600">
              {successMessage}
            </div>
          ) : null}

          {isSignIn && (
            <div className="flex items-center justify-between text-[12px]">
              <label className="flex min-h-10 cursor-pointer items-center gap-2 py-1 text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border bg-input accent-primary"
                />
                Remember me
              </label>
              <button
                type="button"
                className="inline-flex min-h-10 items-center px-1 font-semibold text-primary transition-colors hover:opacity-80"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || oauthLoading !== null}
            className="hq-btn-primary w-full h-11 rounded-[10px] text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Please wait…' : isSignIn ? 'Sign In' : 'Create Account'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {showOAuth ? (
          <div className="mt-5">
            <div className="relative flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                or continue with
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className={`mt-4 grid gap-2.5 ${showGoogle && showGitHub ? 'grid-cols-1 min-[360px]:grid-cols-2' : 'grid-cols-1'}`}>
              {showGoogle ? (
                <button
                  type="button"
                  disabled={isSubmitting || oauthLoading !== null}
                  onClick={() => handleOAuth('google')}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-border bg-background px-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <GoogleIcon className="h-4 w-4" />
                  {oauthLoading === 'google' ? 'Connecting…' : 'Google'}
                </button>
              ) : null}
              {showGitHub ? (
                <button
                  type="button"
                  disabled={isSubmitting || oauthLoading !== null}
                  onClick={() => handleOAuth('github')}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-border bg-background px-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <GitHubIcon className="h-4 w-4" />
                  {oauthLoading === 'github' ? 'Connecting…' : 'GitHub'}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <p className="mt-5 text-center text-[13px] text-muted-foreground">
          {isSignIn ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={onToggle}
            className="font-semibold text-primary transition-colors hover:opacity-80"
          >
            {isSignIn ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <div className="mt-5 flex justify-center">
          <Link
            href="/"
            className="hq-btn-outline inline-flex h-10 items-center gap-2 rounded-[10px] px-4 text-[13px]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
