import { NextResponse } from 'next/server';
import { bilheteConfere, ehUuid } from '@/lib/ficha';
import { linkAssinado, pedidoDoLivro } from '@/lib/servidor/livros';

export const dynamic = 'force-dynamic';

// O PDF em revisão, para o dono abrir pelo link do e-mail (vale 2 minutos a cada clique).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const pedido = ehUuid(id) ? await pedidoDoLivro(id).catch(() => null) : null;
  if (!pedido?.livro_pdf || !bilheteConfere(pedido.livro_revisao, url.searchParams.get('chave'))) return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  return NextResponse.redirect(await linkAssinado('livros', pedido.livro_pdf, 120));
}
