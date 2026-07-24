import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin pages require ADMIN role
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Client-specific pages require CLIENT role
    if ((path.startsWith('/projects/new') || path.startsWith('/dashboard/client')) && token?.role !== 'CLIENT' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Freelancer-specific pages require FREELANCER role
    if (path.startsWith('/dashboard/freelancer') && token?.role !== 'FREELANCER' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET || 'supersecretkeyforworkforgeappdevelopment2026',
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/projects/new',
    '/admin/:path*',
    '/messages/:path*',
  ],
};
