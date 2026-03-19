import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth is handled client-side (Supabase v2 uses localStorage, not cookies)
// This middleware only handles the demo-session cookie check
export async function middleware(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname === '/login';
  const isDemoSession = req.cookies.get('demo-session')?.value === 'true';

  // If demo session is active and trying to access login, redirect to dashboard
  if (isDemoSession && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/clientes/:path*', '/produtos/:path*', '/pedidos/:path*', '/relatorios/:path*', '/nf/:path*'],
};

