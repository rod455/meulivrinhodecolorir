// A conta da sessão no navegador, num arquivo leve: o cabeçalho da LP usa
// sem carregar o formulário de conta inteiro.

import { useEffect, useState } from 'react';
import { supabaseNoNavegador } from './navegador';

export type ContaNoNavegador = { id: string; email: string };

/** A conta da sessão no navegador, acompanhando entrada e saída em outras abas. */
export function useConta() {
  const [estado, setEstado] = useState<{ carregando: boolean; conta: ContaNoNavegador | null }>({ carregando: true, conta: null });
  useEffect(() => {
    const supabase = supabaseNoNavegador();
    const aplicar = (u: { id: string; email?: string } | null | undefined) =>
      setEstado({ carregando: false, conta: u?.email ? { id: u.id, email: u.email.toLowerCase() } : null });
    supabase.auth.getSession().then(({ data }) => aplicar(data.session?.user));
    const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => aplicar(sessao?.user));
    return () => data.subscription.unsubscribe();
  }, []);
  return estado;
}
