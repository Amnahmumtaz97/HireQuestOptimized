'use client'

import { useEffect, useState } from 'react'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Phone } from 'lucide-react'
import Link from 'next/link'
import { getSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  validateSignInFields,
  validateSignupFields,
  type FieldErrors,
} from '@/lib/validation/client-forms'

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, oklch(1 0 0 / 0.1), transparent)' }} />
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, oklch(1 0 0 / 0.1), transparent)' }} />
    </div>
  )
}

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

async function redirectByRole(router: ReturnType<typeof useRouter>) {
  // Avoid an extra /api/auth/session round-trip after sign-in by reading the
  // session once here and routing appropriately.
  const session = await getSession()
  const role = session?.user?.role
  router.push(role === 'admin' ? '/dashboard' : '/app')
}

export function AuthForms({ mode, onToggle }: Props) {
  const router = useRouter()
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
          await redirectByRole(router)
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

      await redirectByRole(router)
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex h-full w-full flex-col justify-center px-6 py-6 lg:px-12 lg:py-8">
      <div className="mx-auto w-full max-w-sm space-y-4">
        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            {isSignIn ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-muted-foreground lg:text-sm">
            {isSignIn
              ? 'Sign in to continue your journey'
              : 'Start your AI-powered interview prep today'}
          </p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {!isSignIn && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-[11px] text-foreground/80">
                    First Name
                  </Label>
                  <div className="relative">
                    <FieldIcon>
                      <User className="h-3.5 w-3.5" />
                    </FieldIcon>
                    <Input
                      id="firstName"
                      placeholder="Jane"
                      className="h-9 pl-9 text-sm"
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
                    <p className="text-[11px] text-red-400">{fieldErrors.firstName}</p>
                  ) : null}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-[11px] text-foreground/80">
                    Last Name
                  </Label>
                  <div className="relative">
                    <FieldIcon>
                      <User className="h-3.5 w-3.5" />
                    </FieldIcon>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="h-9 pl-9 text-sm"
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
                    <p className="text-[11px] text-red-400">{fieldErrors.lastName}</p>
                  ) : null}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="phoneNumber" className="text-[11px] text-foreground/80">
                  Phone Number (optional)
                </Label>
                <div className="relative">
                  <FieldIcon>
                    <Phone className="h-3.5 w-3.5" />
                  </FieldIcon>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+91 9876543210"
                    className="h-9 pl-9 text-sm"
                    value={phoneNumber}
                    onChange={(event) => {
                      setPhoneNumber(event.target.value)
                      clearFieldError('phoneNumber')
                    }}
                    aria-invalid={Boolean(fieldErrors.phoneNumber)}
                  />
                </div>
                {fieldErrors.phoneNumber ? (
                  <p className="text-[11px] text-red-400">{fieldErrors.phoneNumber}</p>
                ) : null}
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label htmlFor="email" className="text-[11px] text-foreground/80">
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
                className="h-9 pl-9 text-sm"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  clearFieldError('email')
                }}
                required
                aria-invalid={Boolean(fieldErrors.email)}
              />
            </div>
            {fieldErrors.email ? <p className="text-[11px] text-red-400">{fieldErrors.email}</p> : null}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-[11px] text-foreground/80">
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
                className="h-9 pl-9 pr-9 text-sm"
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
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {fieldErrors.password ? <p className="text-[11px] text-red-400">{fieldErrors.password}</p> : null}
          </div>

          {!isSignIn && (
            <div className="space-y-1">
              <Label htmlFor="confirm" className="text-[11px] text-foreground/80">
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
                  className="h-9 pl-9 text-sm"
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
                <p className="text-[11px] text-red-400">{fieldErrors.confirmPassword}</p>
              ) : null}
            </div>
          )}

          {errorMessage ? (
            <p className="text-xs text-red-400">{errorMessage}</p>
          ) : null}
          {successMessage ? (
            <p className="text-xs text-emerald-400">{successMessage}</p>
          ) : null}

          {isSignIn && (
            <div className="flex items-center justify-between text-[11px]">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded border-border bg-input accent-primary"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-primary transition-colors hover:text-primary-glow"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex h-10 w-full items-center justify-center gap-2 rounded-full bg-gradient-primary text-white font-semibold text-sm shadow-glow-sm transition-smooth hover:shadow-glow hover:scale-[1.01]"
          >
            {isSubmitting ? 'Please wait...' : isSignIn ? 'Sign In' : 'Create Account'}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {isSignIn ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={onToggle}
            className="font-medium text-primary transition-colors hover:text-primary-glow"
          >
            {isSignIn ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        {/* Go Back — exact clone of "Get Started" on right panel */}
        <div className="flex justify-center pt-1">
          <Link href="/">
            <button
              type="button"
              className="group inline-flex items-center justify-center gap-2 rounded-full h-9 px-5 text-sm font-semibold bg-gradient-primary text-white shadow-glow-sm transition-smooth hover:shadow-glow hover:scale-[1.02]"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Go Back
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
