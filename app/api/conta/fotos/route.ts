import { NextResponse } from 'next/server';
import { apagarFotosDaConta, fotoLigada } from '@/lib/servidor/fotos';
import { contaDaSessao } from '@/lib/servidor/sessao';

export const dynamic = 'force-dynamic';

// "Apagar fotos agora": tira do armazenamento as fotos ligadas à conta, sem esperar os 7 dias.
export async function POST() {
  const conta = await contaDaSessao();
  if (!conta) return NextResponse.json({ mensagem: 'Entre na sua conta.' }, { status: 401 });
  if (!fotoLigada()) return NextResponse.json({ mensagem: 'Não conseguimos agora. Tente de novo em instantes.' }, { status: 503 });
  try {
    return NextResponse.json({ apagadas: await apagarFotosDaConta(conta.id) });
  } catch (e) {
    console.error('[conta] fotos não apagadas', conta.id, e);
    return NextResponse.json({ mensagem: 'Não conseguimos apagar agora. Tente de novo em instantes.' }, { status: 502 });
  }
}
