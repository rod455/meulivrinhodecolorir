import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { itensDoLivro } from '@/lib/livro';
import { comCenaOriginal, guardarPagina, lerAsset, mudarPedidoDoLivro, pedidoComBilhete } from '@/lib/servidor/livros';
import type { TemaId } from '@/lib/temas';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// O n8n devolve aqui cada página desenhada (multipart) ou o erro dela (JSON). A página
// passa pela trava: só a área da criança vem da OpenAI, o resto é a cena original.
export async function POST(req: Request) {
  let id: unknown, token: unknown, chave: unknown, erro: unknown, imagem: Buffer | null = null;
  if ((req.headers.get('content-type') ?? '').includes('multipart/form-data')) {
    const dados = await req.formData().catch(() => null);
    if (!dados) return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
    [id, token, chave, erro] = ['pedido_id', 'token', 'chave', 'erro'].map((k) => dados.get(k));
    const arquivo = dados.get('imagem');
    imagem = arquivo instanceof Blob ? Buffer.from(await arquivo.arrayBuffer()) : null;
  } else {
    ({ pedido_id: id, token, chave, erro } = (await req.json().catch(() => ({}))) as Record<string, unknown>);
  }
  const pedido = await pedidoComBilhete(id, token);
  const item = pedido?.plano ? itensDoLivro(pedido.tema as TemaId, pedido.plano).find((i) => i.chave === chave) : null;
  if (!pedido || !item) return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });

  if (!imagem?.length) {
    const motivo = `${item.chave}: ${typeof erro === 'string' && erro ? erro.slice(0, 200) : 'sem imagem'}`;
    await mudarPedidoDoLivro(pedido.id, { livro_erro: [pedido.livro_erro, motivo].filter(Boolean).join(' · ').slice(0, 1000) });
    return NextResponse.json({ ok: true, guardada: false });
  }
  try {
    const { format, width, height } = await sharp(imagem).metadata();
    if (!format || !['jpeg', 'png', 'webp'].includes(format) || !width || !height) throw new Error(`formato ${format}`);
    // a proporção tem que ser a da cena (2:3); outra proporção é imagem errada, não página
    if (Math.abs(width / height - 2 / 3) > 0.02) throw new Error(`proporção ${width}x${height}`);
    const pagina = await comCenaOriginal(imagem, lerAsset(item.cena), item.area);
    await guardarPagina(pedido, item.chave, pagina);
    return NextResponse.json({ ok: true, guardada: true });
  } catch (e) {
    console.error('[livro] página recusada', pedido.id, item.chave, e);
    await mudarPedidoDoLivro(pedido.id, { livro_erro: [pedido.livro_erro, `${item.chave}: imagem inválida`].filter(Boolean).join(' · ').slice(0, 1000) });
    return NextResponse.json({ ok: false, guardada: false }, { status: 422 });
  }
}
