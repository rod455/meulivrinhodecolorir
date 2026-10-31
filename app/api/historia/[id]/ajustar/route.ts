import { NextResponse } from 'next/server';
import { ehUuid, novoBilhete } from '@/lib/ficha';
import { AJUSTES_POR_HISTORIA, LIMITES, limparTextoLivre } from '@/lib/historia';
import { avisarN8nDaHistoria, historiaPorId, mudarHistoria } from '@/lib/servidor/historias';
import { contaDaSessao } from '@/lib/servidor/sessao';

export const dynamic = 'force-dynamic';

// Pede um ajuste no texto (até 2 por história). O pedido da família passa pela
// mesma limpeza do briefing: o nome da criança vira {NOME} antes de ir à IA.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const conta = await contaDaSessao();
  if (!conta) return NextResponse.json({ conta: false }, { status: 401 });
  if (!ehUuid(params.id)) return NextResponse.json({ mensagem: 'História não encontrada.' }, { status: 404 });
  const h = await historiaPorId(params.id).catch(() => null);
  if (!h || h.user_id !== conta.id) return NextResponse.json({ mensagem: 'História não encontrada.' }, { status: 404 });
  if (h.status !== 'pronta' || !h.texto || h.pedido_id) return NextResponse.json({ mensagem: 'Essa história não pode ser ajustada agora.' }, { status: 409 });
  if (h.ajustes >= AJUSTES_POR_HISTORIA) return NextResponse.json({ mensagem: `Essa história já teve os ${AJUSTES_POR_HISTORIA} ajustes.` }, { status: 429 });
  const entrada = (await req.json().catch(() => ({}))) as { pedido?: unknown; nome?: unknown };
  const pedido = limparTextoLivre(entrada.pedido, typeof entrada.nome === 'string' ? entrada.nome : '', LIMITES.ajuste);
  if ([...pedido].length < 5) return NextResponse.json({ mensagem: 'Conte o que você quer mudar.' }, { status: 422 });

  const token = novoBilhete();
  try {
    // a aprovação anterior deixa de valer: o texto vai mudar
    await mudarHistoria(h.id, { status: 'escrevendo', token, pedido_de_ajuste: pedido, ajustes: h.ajustes + 1, erro: null, aprovada_em: null, pedida_em: new Date().toISOString() }, '&status=eq.pronta');
    if (!(await avisarN8nDaHistoria(h.id, token))) {
      await mudarHistoria(h.id, { status: 'pronta', token: null, pedido_de_ajuste: null, ajustes: h.ajustes, erro: 'n8n sem resposta' });
      return NextResponse.json({ mensagem: 'Não conseguimos pedir o ajuste agora. Tente de novo em instantes.' }, { status: 502 });
    }
    return NextResponse.json({ ok: true, ajustesRestantes: AJUSTES_POR_HISTORIA - h.ajustes - 1 });
  } catch (e) {
    console.error('[historia] ajuste não começou', h.id, e);
    return NextResponse.json({ mensagem: 'Não conseguimos pedir o ajuste agora. Tente de novo em instantes.' }, { status: 502 });
  }
}
