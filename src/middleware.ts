import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname === '/login';
  const isDemoSession = req.cookies.get('demo-session')?.value === 'true';

  // Se estiver em modo demonstração e acessar o login, manda pro dashboard
  if (isDemoSession && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // A validação rigorosa de sessões reais do Supabase (localStorage) 
  // ocorre no Client-Side Layout wrapper, uma vez que SSR packages 
  // não estão totalmente configurados no boilerplate deste projeto.
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/clientes/:path*', '/produtos/:path*', '/pedidos/:path*', '/relatorios/:path*', '/nf/:path*'],
};

