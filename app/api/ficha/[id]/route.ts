import { NextResponse } from 'next/server';
import { desistiu, ehUuid } from '@/lib/ficha';
import { fichaPorId } from '@/lib/servidor/fichas';
import { contaDaSessao } from '@/lib/servidor/sessao';

export const dynamic = 'force-dynamic';

// A tela pergunta a cada poucos segundos se o desenho ficou pronto.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const conta = await contaDaSessao();
  if (!conta) return NextResponse.json({ conta: false }, { status: 401 });
  if (!ehUuid(params.id)) return NextResponse.json({ mensagem: 'Ficha não encontrada.' }, { status: 404 });
  const ficha = await fichaPorId(params.id).catch(() => null);
  if (!ficha || ficha.user_id !== conta.id) return NextResponse.json({ mensagem: 'Ficha não encontrada.' }, { status: 404 });
  const status = desistiu(ficha, new Date()) ? 'falhou' : ficha.status;
  return NextResponse.json({ status, aprovada: Boolean(ficha.aprovada_em) });
}
