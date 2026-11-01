import { NextResponse } from 'next/server';
import { SITE } from '@/lib/config';
import { bilheteConfere, ehUuid } from '@/lib/ficha';
import { apagarPaginas, iniciarLivro, mudarPedidoDoLivro, pedidoDoLivro } from '@/lib/servidor/livros';

export const dynamic = 'force-dynamic';

// O dono pede o livro de novo: "faltantes" refaz só as páginas que não vieram;
// "tudo" apaga as páginas e desenha o livro inteiro outra vez (custa um livro).
export async function POST(req: Request) {
  const dados = await req.formData().catch(() => null);
  const id = dados?.get('id');
  const pedido = ehUuid(id) ? await pedidoDoLivro(id).catch(() => null) : null;
  if (!pedido || !bilheteConfere(pedido.livro_revisao, dados?.get('chave'))) return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  const volta = new URL(`/livro/revisar/${pedido.id}?chave=${pedido.livro_revisao}`, SITE.url);
  if (pedido.livro_status !== 'montado' && pedido.livro_status !== 'falhou') return NextResponse.redirect(volta, 303);

  const tudo = dados?.get('o_que') === 'tudo';
  const mudou = await mudarPedidoDoLivro(
    pedido.id,
    { status: 'pago', livro_status: null, livro_token: null, livro_erro: null, ...(tudo ? { livro_paginas: [], livro_pdf: null, livro_avisos: [] } : {}) },
    `&livro_status=eq.${pedido.livro_status}`,
  );
  if (mudou) {
    if (tudo) await apagarPaginas(pedido.livro_paginas).catch(() => undefined);
    // o gatilho do banco também avisa; quem chegar primeiro começa, o outro desiste
    await iniciarLivro(pedido.id).catch((e) => console.error('[livro] refazer não começou', pedido.id, e));
  }
  return NextResponse.redirect(volta, 303);
}
