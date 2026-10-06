/** Shared client-side validation (mirrors server rules where applicable). */

/**
 * Practical email shape: local@domain.tld
 * Rejects: `user`, `user@`, `@host`, `user@.com`, `user@com`
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** NextAuth credentials deliberately return a generic failure (no account enumeration). */
export const AUTH_CREDENTIALS_ERROR = 'The email or password is incorrect.'

export type FieldErrors = Partial<Record<string, string>>

export function validateEmail(email: string): string | null {
  const t = email.trim()
  if (!t) return 'Email is required.'
  if (!EMAIL_RE.test(t)) return 'Please enter a valid email address.'
  return null
}

/** Signup / change-password strength rules (matches API min length). */
export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.'
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (password.length > 128) return 'Password is too long.'
  return null
}

/** Login: required only — do not apply signup strength rules here. */
export function validateSignInPassword(password: string): string | null {
  if (!password) return 'Password is required.'
  return null
}

export function validatePhoneNumber(phoneNumber: string, opts?: { required?: boolean }): string | null {
  const phone = phoneNumber.trim()
  if (!phone) {
    return opts?.required ? 'Phone number is required.' : null
  }
  if (phone.length > 30) return 'Phone number is too long.'
  if (!/^[\d\s+().\-]{7,30}$/.test(phone)) {
    return 'Please enter a valid phone number.'
  }
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
  if (!fn) errors.firstName = 'First name is required.'
  else if (fn.length > 60) errors.firstName = 'First name is too long.'

  if (!ln) errors.lastName = 'Last name is required.'
  else if (ln.length > 60) errors.lastName = 'Last name is too long.'

  const emailErr = validateEmail(input.email)
  if (emailErr) errors.email = emailErr

  const phoneErr = validatePhoneNumber(input.phoneNumber)
  if (phoneErr) errors.phoneNumber = phoneErr

  const pwErr = validatePassword(input.password)
  if (pwErr) errors.password = pwErr

  if (!input.confirmPassword) errors.confirmPassword = 'Confirm your password.'
  else if (input.password !== input.confirmPassword) errors.confirmPassword = 'Passwords do not match.'

  const keys = Object.keys(errors)
  const ok = keys.length === 0
  const message = ok ? null : errors[keys[0]] ?? 'Please fix the highlighted fields.'
  return { ok, errors, message }
}

export function validateSignInFields(email: string, password: string): { ok: boolean; errors: FieldErrors } {
  const errors: FieldErrors = {}
  const e = validateEmail(email)
  if (e) errors.email = e
  const p = validateSignInPassword(password)
  if (p) errors.password = p
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
  if (!fn) errors.firstName = 'First name is required.'
  else if (fn.length > 60) errors.firstName = 'First name is too long.'

  if (!ln) errors.lastName = 'Last name is required.'
  else if (ln.length > 60) errors.lastName = 'Last name is too long.'

  const emailErr = validateEmail(input.email)
  if (emailErr) errors.email = emailErr

  const phoneErr = validatePhoneNumber(input.phoneNumber)
  if (phoneErr) errors.phoneNumber = phoneErr

  return { ok: Object.keys(errors).length === 0, errors }
}

export function validateChangePassword(input: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): { ok: boolean; errors: FieldErrors } {
  const errors: FieldErrors = {}
  if (!input.currentPassword) {
    errors.currentPassword = 'Current password is required.'
  }

  const pwErr = validatePassword(input.newPassword)
  if (pwErr) errors.newPassword = pwErr

  if (!input.confirmPassword) {
    errors.confirmPassword = 'Confirm your new password.'
  } else if (input.newPassword !== input.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (
    input.currentPassword &&
    input.newPassword &&
    input.currentPassword === input.newPassword
  ) {
    errors.newPassword = 'New password must be different from the current password.'
  }

  return { ok: Object.keys(errors).length === 0, errors }
}
