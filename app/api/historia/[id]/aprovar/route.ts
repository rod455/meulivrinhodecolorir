import { NextResponse } from 'next/server';
import { ehUuid } from '@/lib/ficha';
import { historiaPorId, mudarHistoria } from '@/lib/servidor/historias';
import { contaDaSessao } from '@/lib/servidor/sessao';

export const dynamic = 'force-dynamic';

// "Amei, aprovar a história": o pedido só aceita história aprovada.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const conta = await contaDaSessao();
  if (!conta) return NextResponse.json({ conta: false }, { status: 401 });
  if (!ehUuid(params.id)) return NextResponse.json({ mensagem: 'História não encontrada.' }, { status: 404 });
  const h = await historiaPorId(params.id).catch(() => null);
  if (!h || h.user_id !== conta.id) return NextResponse.json({ mensagem: 'História não encontrada.' }, { status: 404 });
  if (h.status !== 'pronta' || !h.texto || h.pedido_id) return NextResponse.json({ mensagem: 'Essa história não pode ser aprovada agora.' }, { status: 409 });
  try {
    await mudarHistoria(h.id, { aprovada_em: new Date().toISOString() }, '&status=eq.pronta');
    return NextResponse.json({ aprovada: true });
  } catch {
    return NextResponse.json({ mensagem: 'Não conseguimos aprovar agora. Tente de novo.' }, { status: 502 });
  }
}
