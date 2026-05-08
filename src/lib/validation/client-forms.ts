/** Shared client-side validation (mirrors server rules where applicable). */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type FieldErrors = Partial<Record<string, string>>

export function validateEmail(email: string): string | null {
  const t = email.trim()
  if (!t) return 'Email is required'
  if (!EMAIL_RE.test(t)) return 'Enter a valid email address'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (password.length > 128) return 'Password is too long'
  return null
}

export function validateSignupFields(input: {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
}): { ok: boolean; errors: FieldErrors; message: string | null } {
  const errors: FieldErrors = {}

  const fn = input.firstName.trim()
  const ln = input.lastName.trim()
  if (!fn) errors.firstName = 'First name is required'
  else if (fn.length > 60) errors.firstName = 'First name is too long'

  if (!ln) errors.lastName = 'Last name is required'
  else if (ln.length > 60) errors.lastName = 'Last name is too long'

  const emailErr = validateEmail(input.email)
  if (emailErr) errors.email = emailErr

  const phone = input.phoneNumber.trim()
  if (phone.length > 30) errors.phoneNumber = 'Phone number is too long'
  if (phone && !/^[\d\s+().\-]{7,30}$/.test(phone)) {
    errors.phoneNumber = 'Use digits and optional + ( ) - between 7 and 30 characters'
  }

  const pwErr = validatePassword(input.password)
  if (pwErr) errors.password = pwErr

  if (!input.confirmPassword) errors.confirmPassword = 'Confirm your password'
  else if (input.password !== input.confirmPassword) errors.confirmPassword = 'Passwords do not match'

  const keys = Object.keys(errors) as (keyof FieldErrors)[]
  const ok = keys.length === 0
  const message = ok ? null : errors[keys[0] as string] ?? 'Please fix the highlighted fields'
  return { ok, errors, message }
}

export function validateSignInFields(email: string, password: string): { ok: boolean; errors: FieldErrors } {
  const errors: FieldErrors = {}
  const e = validateEmail(email)
  if (e) errors.email = e
  if (!password) errors.password = 'Password is required'
  return { ok: Object.keys(errors).length === 0, errors }
}

export function validateAccountProfile(input: {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
}): { ok: boolean; errors: FieldErrors } {
  const errors: FieldErrors = {}
  const fn = input.firstName.trim()
  const ln = input.lastName.trim()
  if (!fn) errors.firstName = 'First name is required'
  else if (fn.length > 60) errors.firstName = 'First name is too long'

  if (!ln) errors.lastName = 'Last name is required'
  else if (ln.length > 60) errors.lastName = 'Last name is too long'

  const emailErr = validateEmail(input.email)
  if (emailErr) errors.email = emailErr

  const phone = input.phoneNumber.trim()
  if (phone.length > 30) errors.phoneNumber = 'Phone number is too long'
  if (phone && !/^[\d\s+().\-]{7,30}$/.test(phone)) {
    errors.phoneNumber = 'Use digits and optional + ( ) - between 7 and 30 characters'
  }

  return { ok: Object.keys(errors).length === 0, errors }
}
