import { createServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    'https://krvdixadkiqawlwtdnjc.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydmRpeGFka2lxYXdsd3RkbmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MDAxNjQsImV4cCI6MjA4NzM3NjE2NH0.t82PeJJellZf-LPrti8m8amkaefDq4tX9UXYGtrsris',
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isDemoSession = req.cookies.get('demo-session')?.value === 'true';
  const isLoginPage = req.nextUrl.pathname === '/login';

  // If there is no session (real or demo) and the user is trying to access a protected route
  if (!session && !isDemoSession && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If there is a session and the user is trying to access the login page
  if ((session || isDemoSession) && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/', '/clientes/:path*', '/produtos/:path*', '/pedidos/:path*', '/relatorios/:path*', '/nf/:path*'],
};
