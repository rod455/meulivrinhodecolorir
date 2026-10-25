import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { bilheteConfere, ehUuid } from '@/lib/ficha';
import { fichaPorId, guardarImagemDaFicha, mudarFicha } from '@/lib/servidor/fichas';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Devolucao = { ficha_id?: unknown; token?: unknown; imagem?: Buffer | null; erro?: unknown };

/** O n8n manda a imagem como arquivo (multipart); o erro vem em JSON. Base64 aceito por garantia. */
async function lerDevolucao(req: Request): Promise<Devolucao> {
  if ((req.headers.get('content-type') ?? '').includes('multipart/form-data')) {
    const dados = await req.formData().catch(() => null);
    if (!dados) return {};
    const arquivo = dados.get('imagem');
    return {
      ficha_id: dados.get('ficha_id'),
      token: dados.get('token'),
      imagem: arquivo instanceof Blob ? Buffer.from(await arquivo.arrayBuffer()) : null,
      erro: dados.get('erro'),
    };
  }
  const corpo = (await req.json().catch(() => ({}))) as { ficha_id?: unknown; token?: unknown; imagem_base64?: unknown; erro?: unknown };
  const base64 = typeof corpo.imagem_base64 === 'string' ? corpo.imagem_base64.replace(/^data:image\/\w+;base64,/, '') : '';
  return { ficha_id: corpo.ficha_id, token: corpo.token, imagem: base64 ? Buffer.from(base64, 'base64') : null, erro: corpo.erro };
}

// O n8n devolve aqui a imagem ou o erro, com o mesmo bilhete. Depois disso o
// bilhete morre: não dá para trocar a imagem de uma ficha pronta.
export async function POST(req: Request) {
  const corpo = await lerDevolucao(req);
  if (!ehUuid(corpo.ficha_id)) return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  const ficha = await fichaPorId(corpo.ficha_id).catch(() => null);
  if (!ficha || ficha.status !== 'gerando' || !bilheteConfere(ficha.token, corpo.token)) {
    return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  }
  if (!corpo.imagem || corpo.imagem.length === 0) {
    const erro = typeof corpo.erro === 'string' ? corpo.erro.slice(0, 500) : 'sem imagem';
    await mudarFicha(ficha.id, { status: 'falhou', token: null, erro }, '&status=eq.gerando');
    return NextResponse.json({ ok: true, status: 'falhou' });
  }
  try {
    const imagem = corpo.imagem;
    const { format } = await sharp(imagem).metadata();
    if (!format || !['jpeg', 'png', 'webp'].includes(format)) throw new Error(`formato ${format}`);
    const caminho = await guardarImagemDaFicha(ficha.id, imagem);
    await mudarFicha(ficha.id, { status: 'pronta', token: null, caminho_imagem: caminho }, '&status=eq.gerando');
    return NextResponse.json({ ok: true, status: 'pronta' });
  } catch (e) {
    console.error('[ficha] imagem recusada', ficha.id, e);
    await mudarFicha(ficha.id, { status: 'falhou', token: null, erro: 'imagem inválida' }, '&status=eq.gerando');
    return NextResponse.json({ ok: false, status: 'falhou' }, { status: 422 });
  }
}
