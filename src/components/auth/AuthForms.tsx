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

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
      {children}
    </span>
  )
}

interface Props {
  mode: 'signin' | 'signup'
  onToggle: () => void
}

async function redirectAfterAuth() {
  const session = await getSession()
  const role = session?.user?.role
  const destination = role === 'admin' ? '/dashboard' : '/app/new-interview'
  window.location.assign(destination)
}

export function AuthForms({ mode, onToggle }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
              <div className="grid grid-cols-2 gap-3">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
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
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-border bg-input accent-primary"
                />
                Remember me
              </label>
              <button
                type="button"
                className="font-semibold text-primary transition-colors hover:opacity-80"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="hq-btn-primary w-full h-11 rounded-[10px] text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Please wait…' : isSignIn ? 'Sign In' : 'Create Account'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

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
            className="hq-btn-outline inline-flex items-center gap-2 h-9 rounded-[10px] px-4 text-[13px]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
