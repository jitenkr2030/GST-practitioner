import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // If user is not authenticated and trying to access protected routes, redirect to landing
    if (!token && pathname !== '/landing' && pathname !== '/auth/signin' && pathname !== '/auth/signup') {
      return NextResponse.redirect(new URL('/landing', req.url))
    }

    // If user is authenticated and trying to access landing page, redirect to dashboard
    if (token && pathname === '/landing') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/',
    '/clients/:path*',
    '/registration/:path*',
    '/returns/:path*',
    '/payments/:path*',
    '/notices/:path*',
    '/analytics/:path*',
    '/settings/:path*',
  ]
}