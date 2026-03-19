import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname === '/login';
  const isDemoSession = req.cookies.get('demo-session')?.value === 'true';

  // Check for Supabase auth token cookie (set after successful login)
  const allCookies = req.cookies.getAll();
  const hasSupabaseSession = allCookies.some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );

  const isAuthenticated = hasSupabaseSession || isDemoSession;

  // Redirect to login if not authenticated and trying to access protected route
  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect to dashboard if authenticated and trying to access login page
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/clientes/:path*', '/produtos/:path*', '/pedidos/:path*', '/relatorios/:path*', '/nf/:path*'],
};

