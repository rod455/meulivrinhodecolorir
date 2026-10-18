import { NextResponse } from 'next/server';
import { comChaveDeServico, fotoLigada } from '@/lib/servidor/fotos';
import { contaDaSessao, supabaseNoServidor } from '@/lib/servidor/sessao';

export const dynamic = 'force-dynamic';

// Baixar o PDF: só quem comprou (a leitura passa pela RLS da conta) e por um
// link assinado que vale 60 segundos. O arquivo mora no bucket privado `livros`.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const origem = new URL(req.url).origin;
  const conta = await contaDaSessao();
  if (!conta) return NextResponse.redirect(new URL(`/entrar?next=${encodeURIComponent('/conta')}`, origem));
  if (!/^[0-9a-f-]{36}$/.test(params.id)) return NextResponse.json({ mensagem: 'Pedido não encontrado.' }, { status: 404 });

  const { data } = await supabaseNoServidor().from('pedidos').select('id, link_pdf').eq('id', params.id).maybeSingle();
  if (!data) return NextResponse.json({ mensagem: 'Pedido não encontrado.' }, { status: 404 });
  if (!data.link_pdf) return NextResponse.json({ mensagem: 'O livrinho ainda está sendo preparado.' }, { status: 409 });
  if (!fotoLigada()) return NextResponse.json({ mensagem: 'Tente de novo em instantes.' }, { status: 503 });

  const r = await comChaveDeServico(`/storage/v1/object/sign/livros/${data.link_pdf}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ expiresIn: 60 }),
  });
  if (!r.ok) {
    console.error('[livro] sem link assinado', params.id, r.status);
    return NextResponse.json({ mensagem: 'Não conseguimos abrir o arquivo agora.' }, { status: 502 });
  }
  const { signedURL } = (await r.json()) as { signedURL: string };
  return NextResponse.redirect(`${process.env.SUPABASE_URL}/storage/v1${signedURL}`);
}
