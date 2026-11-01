import { NextResponse } from 'next/server';
import { SITE } from '@/lib/config';
import { bilheteConfere, ehUuid, novoBilhete } from '@/lib/ficha';
import { apagarPaginas, avisarN8nDoLivro, mudarPedidoDoLivro, pedidoDoLivro } from '@/lib/servidor/livros';

export const dynamic = 'force-dynamic';

// O dono revisou e liberou (botão da página de revisão; POST, para nenhum leitor de
// e-mail liberar sem querer). O PDF vai para "Meus livrinhos", as páginas soltas são
// apagadas (só o PDF fica) e o n8n avisa a família.
export async function POST(req: Request) {
  const dados = await req.formData().catch(() => null);
  const id = dados?.get('id');
  const chave = dados?.get('chave');
  const pedido = ehUuid(id) ? await pedidoDoLivro(id).catch(() => null) : null;
  if (!pedido || !bilheteConfere(pedido.livro_revisao, chave)) return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  const volta = new URL(`/livro/revisar/${pedido.id}?chave=${pedido.livro_revisao}`, SITE.url);
  if (pedido.livro_status !== 'montado' || !pedido.livro_pdf) return NextResponse.redirect(volta, 303);

  const token = novoBilhete();
  const agora = new Date().toISOString();
  const mudou = await mudarPedidoDoLivro(
    pedido.id,
    { link_pdf: pedido.livro_pdf, status: 'entregue', entregue_em: agora, livro_status: 'liberado', livro_token: token, livro_paginas: [] },
    '&livro_status=eq.montado',
  );
  if (mudou) {
    await apagarPaginas(pedido.livro_paginas).catch((e) => console.error('[livro] páginas não apagadas', pedido.id, e));
    if (!(await avisarN8nDoLivro({ tipo: 'avisar', pedido_id: pedido.id, token }))) {
      await mudarPedidoDoLivro(pedido.id, { livro_erro: 'liberado, mas o n8n não respondeu ao aviso à família' });
    }
  }
  return NextResponse.redirect(volta, 303);
}
