import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  try {
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();
    
    const isLoginPage = req.nextUrl.pathname === '/login';
    const isDemoSession = req.cookies.get('demo-session')?.value === 'true';

    // If authenticated (via demo or real session) and trying to access login
    if ((isDemoSession || session) && isLoginPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // If NOT authenticated and trying to access protected route
    if (!isDemoSession && !session && !isLoginPage && req.nextUrl.pathname !== '/catalogo') {
        return NextResponse.redirect(new URL('/login', req.url));
    }

  } catch (e) {
    // Falha silenciosa no middleware se supabase não estiver configurado corretamente
  }
  return res;
}

export const config = {
  matcher: ['/', '/clientes/:path*', '/produtos/:path*', '/pedidos/:path*', '/relatorios/:path*', '/nf/:path*'],
};

