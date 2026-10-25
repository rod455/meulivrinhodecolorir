import { NextResponse } from 'next/server';
import { bilheteConfere, desistiu, ehUuid, PEDIDO_DE_IMAGEM } from '@/lib/ficha';
import { fichaPorId, linkDaFoto } from '@/lib/servidor/fichas';

export const dynamic = 'force-dynamic';

// O n8n busca aqui o que desenhar, com o bilhete de uso único que recebeu.
// Sem bilhete certo, nada: o link do n8n descoberto não gasta crédito.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!ehUuid(id)) return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  const ficha = await fichaPorId(id).catch(() => null);
  if (!ficha || ficha.status !== 'gerando' || desistiu(ficha, new Date()) || !bilheteConfere(ficha.token, url.searchParams.get('token'))) {
    return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  }
  return NextResponse.json({
    ficha_id: ficha.id,
    prompt: ficha.prompt,
    ...PEDIDO_DE_IMAGEM,
    // com foto, o n8n usa a edição de imagem; sem foto, a geração
    foto_url: ficha.caminho_foto ? await linkDaFoto(ficha.caminho_foto) : null,
  });
}
