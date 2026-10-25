import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { bilheteConfere, ehUuid } from '@/lib/ficha';
import { fichaPorId, guardarImagemDaFicha, mudarFicha } from '@/lib/servidor/fichas';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// O n8n devolve aqui a imagem (base64) ou o erro, com o mesmo bilhete. Depois
// disso o bilhete morre: não dá para trocar a imagem de uma ficha pronta.
export async function POST(req: Request) {
  const corpo = (await req.json().catch(() => ({}))) as { ficha_id?: unknown; token?: unknown; imagem_base64?: unknown; erro?: unknown };
  if (!ehUuid(corpo.ficha_id)) return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  const ficha = await fichaPorId(corpo.ficha_id).catch(() => null);
  if (!ficha || ficha.status !== 'gerando' || !bilheteConfere(ficha.token, corpo.token)) {
    return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  }
  if (typeof corpo.imagem_base64 !== 'string' || !corpo.imagem_base64) {
    const erro = typeof corpo.erro === 'string' ? corpo.erro.slice(0, 500) : 'sem imagem';
    await mudarFicha(ficha.id, { status: 'falhou', token: null, erro }, '&status=eq.gerando');
    return NextResponse.json({ ok: true, status: 'falhou' });
  }
  try {
    const imagem = Buffer.from(corpo.imagem_base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
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
