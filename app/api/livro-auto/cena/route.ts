import { itensDoLivro } from '@/lib/livro';
import { lerAsset, pedidoComBilhete } from '@/lib/servidor/livros';
import type { TemaId } from '@/lib/temas';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// A cena base de uma página, para o n8n mandar à OpenAI. As cenas não são públicas
// (são o livro sem a criança): só saem com o bilhete do pedido em geração.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const pedido = await pedidoComBilhete(url.searchParams.get('id'), url.searchParams.get('token'));
  const item = pedido?.plano ? itensDoLivro(pedido.tema as TemaId, pedido.plano).find((i) => i.chave === url.searchParams.get('chave')) : null;
  if (!item) return new Response('não encontrado', { status: 404 });
  return new Response(new Uint8Array(lerAsset(item.cena)), { headers: { 'content-type': 'image/jpeg', 'cache-control': 'no-store' } });
}
