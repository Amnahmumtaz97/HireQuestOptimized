import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl
    const role = request.nextauth.token?.role

    if (!role) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    if (pathname.startsWith('/dashboard') && role !== 'admin') {
      return NextResponse.redirect(new URL('/app', request.url))
    }

    if (pathname.startsWith('/app') && role !== 'user') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
  },
)

export const config = {
  // Only protect app + admin areas. Exclude /api (NextAuth session), /_next, static files.
  matcher: [
    '/dashboard/:path*',
    '/app',
    '/app/:path*',
  ],
}
