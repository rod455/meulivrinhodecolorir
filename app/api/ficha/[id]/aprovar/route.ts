import { NextResponse } from 'next/server';
import { ehUuid } from '@/lib/ficha';
import { fichaPorId, mudarFicha } from '@/lib/servidor/fichas';
import { contaDaSessao } from '@/lib/servidor/sessao';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const conta = await contaDaSessao();
  if (!conta) return NextResponse.json({ conta: false }, { status: 401 });
  if (!ehUuid(params.id)) return NextResponse.json({ mensagem: 'Ficha não encontrada.' }, { status: 404 });
  const ficha = await fichaPorId(params.id).catch(() => null);
  if (!ficha || ficha.user_id !== conta.id) return NextResponse.json({ mensagem: 'Ficha não encontrada.' }, { status: 404 });
  if (ficha.status !== 'pronta') return NextResponse.json({ mensagem: 'O desenho ainda não ficou pronto.' }, { status: 409 });
  if (!ficha.aprovada_em) await mudarFicha(ficha.id, { aprovada_em: new Date().toISOString() });
  return NextResponse.json({ aprovada: true });
}
