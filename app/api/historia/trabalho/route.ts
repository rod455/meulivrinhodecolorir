import { NextResponse } from 'next/server';
import { bilheteConfere, ehUuid } from '@/lib/ficha';
import { desistiuDaHistoria, INSTRUCOES_DA_HISTORIA, MODELO_DE_TEXTO, pedidoDaHistoria, pedidoDoAjuste } from '@/lib/historia';
import { historiaPorId } from '@/lib/servidor/historias';

export const dynamic = 'force-dynamic';

// O n8n busca aqui o que escrever, com o bilhete de uso único que recebeu.
// Nada aqui tem o nome da criança: o briefing já está com {NOME}.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!ehUuid(id)) return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  const h = await historiaPorId(id).catch(() => null);
  if (!h || h.status !== 'escrevendo' || desistiuDaHistoria(h, new Date()) || !bilheteConfere(h.token, url.searchParams.get('token'))) {
    return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  }
  const pedido = h.texto && h.pedido_de_ajuste ? pedidoDoAjuste(h.briefing, h.idade, h.superpoder, h.texto, h.pedido_de_ajuste) : pedidoDaHistoria(h.briefing, h.idade, h.superpoder);
  return NextResponse.json({ historia_id: h.id, modelo: MODELO_DE_TEXTO, instrucoes: INSTRUCOES_DA_HISTORIA, pedido });
}
