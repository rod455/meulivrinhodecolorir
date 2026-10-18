import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { destinoSeguro } from '@/lib/destino';
import { supabaseNoServidor } from '@/lib/servidor/sessao';

export const dynamic = 'force-dynamic';

// Volta do Google e do link por e-mail: troca o código pela sessão (cookie) e
// segue para onde a pessoa estava, normalmente o pagamento do livrinho.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const destino = destinoSeguro(url.searchParams.get('next'));
  const supabase = supabaseNoServidor();
  const codigo = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const tipo = url.searchParams.get('type') as EmailOtpType | null;

  let erro: unknown = null;
  if (codigo) erro = (await supabase.auth.exchangeCodeForSession(codigo)).error;
  else if (tokenHash && tipo) erro = (await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo })).error;
  else erro = 'sem código';

  if (erro) {
    console.error('[auth] volta sem sessão', erro);
    return NextResponse.redirect(new URL(`/entrar?erro=link&next=${encodeURIComponent(destino)}`, url.origin));
  }
  return NextResponse.redirect(new URL(destino, url.origin));
}
