'use client';

// "Entrar" para quem já tem conta, sempre à vista, inclusive no celular, onde
// o menu some (pedido do dono, 25/10/2026). Com a sessão aberta, vira "Meus livrinhos".

import Link from 'next/link';
import { useConta } from '@/lib/supabase/conta';

export function LinkDaConta() {
  const { conta } = useConta();
  return conta ? (
    <Link href="/conta" className="link-conta">
      Meus livrinhos
    </Link>
  ) : (
    <Link href="/entrar?next=/conta" className="link-conta">
      Entrar
    </Link>
  );
}
