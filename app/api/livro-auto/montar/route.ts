import { NextResponse } from 'next/server';
import { SITE } from '@/lib/config';
import { chavesDoLivro, emailDeFalha, emailDeRevisao, entradaDoLivro } from '@/lib/livro';
import { montarLivroA5 } from '@/lib/livro-pdf';
import { SUPERPODERES } from '@/lib/personagem';
import { guardarPdf, lerAsset, lerPagina, mudarPedidoDoLivro, pedidoComBilhete } from '@/lib/servidor/livros';
import type { TemaId } from '@/lib/temas';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// Depois da última página, o n8n chama aqui. Se faltar alguma, nada é montado e o dono
// recebe o aviso de falha; se estiver tudo, o PDF vai para o bucket e o dono recebe o
// link de revisão. A família só recebe depois que o dono liberar. O bilhete morre aqui.
export async function POST(req: Request) {
  const corpo = (await req.json().catch(() => ({}))) as { pedido_id?: unknown; token?: unknown };
  const pedido = await pedidoComBilhete(corpo.pedido_id, corpo.token);
  if (!pedido?.plano) return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  const tema = pedido.tema as TemaId;
  const linkDeRevisao = `${SITE.url}/livro/revisar/${pedido.id}?chave=${pedido.livro_revisao}`;
  const prontas = new Map(pedido.livro_paginas.map((c) => [c.split('/').pop()!.replace('.jpg', ''), c]));
  const faltando = chavesDoLivro(tema, pedido.plano).filter((c) => !prontas.has(c));

  const falhar = async (erro: string) => {
    await mudarPedidoDoLivro(pedido.id, { livro_status: 'falhou', livro_token: null, livro_erro: erro.slice(0, 1000) }, '&livro_status=eq.gerando');
    return NextResponse.json({
      status: 'falhou',
      email: emailDeFalha({ nome: pedido.nome_crianca, pedidoId: pedido.id, faltando, erro, linkDeRevisao }),
    });
  };
  if (faltando.length) return falhar(pedido.livro_erro ?? `faltaram ${faltando.join(', ')}`);

  try {
    const imagens = new Map<string, Uint8Array>();
    for (const [chave, caminho] of prontas) imagens.set(chave, await lerPagina(caminho));
    const superpoder = SUPERPODERES.find((s) => s.id === pedido.personagem?.superpoder)?.rotulo ?? '';
    const entrada = entradaDoLivro(
      tema,
      pedido.plano,
      { nome: pedido.nome_crianca, dedicatoria: pedido.dedicatoria, superpoder },
      { imagem: (c) => imagens.get(c)!, asset: (c) => new Uint8Array(lerAsset(c)) },
    );
    const pdf = await montarLivroA5(entrada);
    const caminho = await guardarPdf(pedido.id, pdf);
    await mudarPedidoDoLivro(pedido.id, { livro_status: 'montado', livro_token: null, livro_pdf: caminho, livro_erro: null, status: 'pdf_gerado' }, '&livro_status=eq.gerando');
    const titulo = entrada.titulo;
    return NextResponse.json({ status: 'montado', paginas: entrada.paginas.length, email: emailDeRevisao({ nome: pedido.nome_crianca, tituloDoLivro: titulo, pedidoId: pedido.id, linkDeRevisao, versao: pedido.versao, formato: pedido.formato }) });
  } catch (e) {
    console.error('[livro] montagem falhou', pedido.id, e);
    return falhar(`a montagem do PDF falhou (${String(e).slice(0, 200)})`);
  }
}
