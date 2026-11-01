import { NextResponse } from 'next/server';
import { SITE } from '@/lib/config';
import { emailParaFamilia } from '@/lib/livro';
import { mudarPedidoDoLivro, pedidoComBilhete } from '@/lib/servidor/livros';

export const dynamic = 'force-dynamic';

// Depois que o dono libera, o n8n busca aqui o e-mail da família, com o bilhete que
// recebeu. O bilhete serve uma vez só: o n8n não manda o mesmo aviso duas vezes.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const pedido = await pedidoComBilhete(url.searchParams.get('id'), url.searchParams.get('token'), 'liberado');
  if (!pedido) return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  const usou = await mudarPedidoDoLivro(pedido.id, { livro_token: null }, `&livro_token=eq.${pedido.livro_token}`);
  if (!usou) return NextResponse.json({ mensagem: 'não encontrado' }, { status: 404 });
  return NextResponse.json({ email: emailParaFamilia({ para: pedido.email, responsavel: pedido.responsavel, nome: pedido.nome_crianca, linkDaConta: `${SITE.url}/conta` }) });
}
