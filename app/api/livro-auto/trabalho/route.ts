import { NextResponse } from 'next/server';
import { itensDoLivro, PEDIDO_DA_PAGINA } from '@/lib/livro';
import { linkAssinado, pedidoComBilhete } from '@/lib/servidor/livros';
import type { TemaId } from '@/lib/temas';

export const dynamic = 'force-dynamic';

// O n8n busca aqui o que desenhar: só as imagens que ainda faltam, cada uma com o
// prompt do plano gravado no pedido, a cena e a ficha aprovada. Sem bilhete, 404.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const token = url.searchParams.get('token');
  const pedido = await pedidoComBilhete(id, token);
  if (!pedido?.plano?.ficha.aprovada) return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  const prontas = pedido.livro_paginas.map((c) => c.split('/').pop()!.replace('.jpg', ''));
  const itens = itensDoLivro(pedido.tema as TemaId, pedido.plano, prontas);
  // a cena sai deste mesmo site (em produção, o domínio; nos testes, o site local)
  const cena = (chave: string) => `${url.origin}/api/livro-auto/cena?${new URLSearchParams({ id: pedido.id, token: token!, chave })}`;
  return NextResponse.json({
    pedido_id: pedido.id,
    // a ficha que a família aprovou: o livro usa ela e não desenha outra (link de 2 horas)
    ficha_url: await linkAssinado('fichas', pedido.plano.ficha.aprovada.caminho, 2 * 60 * 60),
    itens: itens.map((i) => ({ chave: i.chave, prompt: i.prompt, cena_url: cena(i.chave), ...PEDIDO_DA_PAGINA })),
  });
}
