import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Skip auth check for public routes
  if (
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup'
  ) {
    return response;
  }

  // Check for authentication
  const session = await fetch(new URL('/api/auth/session', request.url));
  const sessionData = await session.json();

  // If no session, create default user (handled by the session API)
  if (!sessionData) {
    await fetch(new URL('/api/auth/session', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
