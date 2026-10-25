import 'server-only';

// Quem está entrando, do lado do servidor. A sessão vem nos cookies que o
// @supabase/ssr grava; o usuário é sempre conferido no Supabase (getUser),
// nunca lido do cookie sem checar.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_PUBLICO } from '@/lib/config';

export function supabaseNoServidor() {
  const pote = cookies();
  return createServerClient(SUPABASE_PUBLICO.url, SUPABASE_PUBLICO.chave, {
    cookies: {
      getAll: () => pote.getAll(),
      setAll: (lista) => {
        try {
          for (const { name, value, options } of lista) pote.set(name, value, options);
        } catch {
          // em componente de servidor não dá para gravar cookie; o middleware renova
        }
      },
    },
  });
}

export type Conta = {
  id: string;
  email: string;
  /** o nome que o Google manda; com e-mail e senha não há nome */
  nome?: string;
  entrouCom?: 'google' | 'email';
};

export async function contaDaSessao(): Promise<Conta | null> {
  try {
    const { data } = await supabaseNoServidor().auth.getUser();
    const u = data.user;
    if (!u?.email) return null;
    const nome = typeof u.user_metadata?.full_name === 'string' ? u.user_metadata.full_name.trim() : '';
    return { id: u.id, email: u.email.toLowerCase(), nome: nome || undefined, entrouCom: u.app_metadata?.provider === 'google' ? 'google' : 'email' };
  } catch {
    return null;
  }
}

/** O Google só aparece se estiver ligado no Supabase (Authentication, Providers). */
export async function googleLigado(): Promise<boolean> {
  try {
    const r = await fetch(`${SUPABASE_PUBLICO.url}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_PUBLICO.chave },
      next: { revalidate: 600 },
    });
    if (!r.ok) return false;
    const ajustes = (await r.json()) as { external?: Record<string, boolean> };
    return ajustes.external?.google === true;
  } catch {
    return false;
  }
}
