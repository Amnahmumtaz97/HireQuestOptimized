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
  matcher: ['/pricing/:path*', '/dashboard/:path*', '/app', '/app/:path*'],
}
