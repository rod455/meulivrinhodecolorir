import { NextResponse } from 'next/server';
import { ehUuid } from '@/lib/ficha';
import { fichaPorId, lerImagemDaFicha, previaComMarca } from '@/lib/servidor/fichas';
import { contaDaSessao } from '@/lib/servidor/sessao';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// A família vê só esta prévia, pequena e com marca d'água. A imagem limpa
// nunca sai daqui: só entra no livro depois do pagamento.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const conta = await contaDaSessao();
  if (!conta || !ehUuid(params.id)) return new NextResponse(null, { status: 404 });
  const ficha = await fichaPorId(params.id).catch(() => null);
  if (!ficha || ficha.user_id !== conta.id || ficha.status !== 'pronta' || !ficha.caminho_imagem) return new NextResponse(null, { status: 404 });
  try {
    const previa = await previaComMarca(await lerImagemDaFicha(ficha.caminho_imagem));
    return new NextResponse(new Uint8Array(previa), {
      headers: { 'content-type': 'image/jpeg', 'cache-control': 'private, no-store' },
    });
  } catch (e) {
    console.error('[ficha] prévia', params.id, e);
    return new NextResponse(null, { status: 502 });
  }
}
