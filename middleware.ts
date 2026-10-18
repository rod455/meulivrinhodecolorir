import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_PUBLICO } from '@/lib/config';

// Renova a sessão do Supabase a cada visita às páginas que usam conta, para
// o token não vencer no meio da compra.
export async function middleware(req: NextRequest) {
  let resposta = NextResponse.next({ request: req });
  const supabase = createServerClient(SUPABASE_PUBLICO.url, SUPABASE_PUBLICO.chave, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (lista) => {
        for (const { name, value } of lista) req.cookies.set(name, value);
        resposta = NextResponse.next({ request: req });
        for (const { name, value, options } of lista) resposta.cookies.set(name, value, options);
      },
    },
  });
  await supabase.auth.getUser().catch(() => undefined);
  return resposta;
}

export const config = { matcher: ['/conta/:path*', '/entrar', '/criar', '/api/pedido', '/api/conta/:path*', '/api/livro/:path*'] };
