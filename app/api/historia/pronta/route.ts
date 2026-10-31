import { NextResponse } from 'next/server';
import { bilheteConfere, ehUuid } from '@/lib/ficha';
import { lerTextoDaHistoria } from '@/lib/historia';
import { camposDeDesistencia, historiaPorId, mudarHistoria } from '@/lib/servidor/historias';

export const dynamic = 'force-dynamic';

// O n8n devolve aqui o texto (o JSON que a IA escreveu) ou o erro, com o mesmo
// bilhete. O texto passa pelas regras da turma (lib/historia.ts) antes de a
// família ver; fora delas, a escrita conta como falha e não gasta tentativa.
export async function POST(req: Request) {
  const corpo = (await req.json().catch(() => ({}))) as { historia_id?: unknown; token?: unknown; texto?: unknown; erro?: unknown };
  if (!ehUuid(corpo.historia_id)) return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  const h = await historiaPorId(corpo.historia_id).catch(() => null);
  if (!h || h.status !== 'escrevendo' || !bilheteConfere(h.token, corpo.token)) return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });

  const lido = corpo.texto === undefined || corpo.texto === null || corpo.texto === '' ? null : lerTextoDaHistoria(corpo.texto);
  if (!lido || !lido.ok) {
    const erro = lido && !lido.ok ? `texto recusado: ${lido.erro}` : typeof corpo.erro === 'string' ? corpo.erro.slice(0, 500) : 'sem texto';
    console.error('[historia] escrita falhou', h.id, erro);
    await mudarHistoria(h.id, camposDeDesistencia(h, erro), '&status=eq.escrevendo');
    return NextResponse.json({ ok: !lido, status: 'falhou', erro }, { status: lido ? 422 : 200 });
  }
  await mudarHistoria(h.id, { status: 'pronta', token: null, texto: lido.texto, erro: null, pedido_de_ajuste: null }, '&status=eq.escrevendo');
  return NextResponse.json({ ok: true, status: 'pronta' });
}
