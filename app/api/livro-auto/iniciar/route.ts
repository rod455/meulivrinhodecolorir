import { NextResponse } from 'next/server';
import { ehUuid } from '@/lib/ficha';
import { iniciarLivro } from '@/lib/servidor/livros';

export const dynamic = 'force-dynamic';

// O banco chama aqui quando um pedido vira "pago" (gatilho da migração 0008). Leva só
// o id: o site relê o pedido e só começa se ele estiver pago e sem livro em andamento.
// Chamar à toa não gasta nada, por isso não há segredo aqui.
export async function POST(req: Request) {
  const corpo = (await req.json().catch(() => ({}))) as { pedido_id?: unknown };
  if (!ehUuid(corpo.pedido_id)) return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  const r = await iniciarLivro(corpo.pedido_id).catch((e) => {
    console.error('[livro] não começou', corpo.pedido_id, e);
    return { iniciado: false, motivo: 'erro' };
  });
  if (!r.iniciado) console.log('[livro] não começou', corpo.pedido_id, r.motivo);
  return NextResponse.json(r);
}
