import { NextResponse } from 'next/server';
import { ehUuid } from '@/lib/ficha';
import { AJUSTES_POR_HISTORIA, desistiuDaHistoria } from '@/lib/historia';
import { historiaPorId } from '@/lib/servidor/historias';
import { contaDaSessao } from '@/lib/servidor/sessao';

export const dynamic = 'force-dynamic';

// A tela pergunta a cada poucos segundos se a história ficou pronta. O texto
// volta com {NOME}: quem põe o nome é a tela.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const conta = await contaDaSessao();
  if (!conta) return NextResponse.json({ conta: false }, { status: 401 });
  if (!ehUuid(params.id)) return NextResponse.json({ mensagem: 'História não encontrada.' }, { status: 404 });
  const h = await historiaPorId(params.id).catch(() => null);
  if (!h || h.user_id !== conta.id) return NextResponse.json({ mensagem: 'História não encontrada.' }, { status: 404 });
  const travou = desistiuDaHistoria(h, new Date());
  const status = travou ? (h.texto ? 'pronta' : 'falhou') : h.status;
  return NextResponse.json({
    status,
    texto: h.texto,
    briefing: h.briefing,
    superpoder: h.superpoder,
    idade: h.idade,
    ajustesRestantes: Math.max(0, AJUSTES_POR_HISTORIA - (travou && h.texto ? h.ajustes - 1 : h.ajustes)),
    aprovada: Boolean(h.aprovada_em),
    usada: Boolean(h.pedido_id),
    // o ajuste que falhou devolve o texto anterior com um aviso
    falhouOAjuste: status === 'pronta' && Boolean(h.erro),
  });
}
