import { NextResponse } from 'next/server';
import { lerPedidoDaTurma } from '@/lib/livros-publicados';
import { contaDaSessao } from '@/lib/servidor/sessao';
import { avisarDonoDaTurma, guardarPedidoDaTurma, linkDePagamentoDaTurma, turmaLigada } from '@/lib/servidor/turma';

export const dynamic = 'force-dynamic';

// Pedido de um livro da turma, impresso ou PDF (dono, 26/10/2026). Precisa de
// conta, como o livrinho personalizado; o preço sai do servidor.
export async function POST(req: Request) {
  const conta = await contaDaSessao();
  if (!conta) return NextResponse.json({ conta: false, mensagem: 'Entre ou crie sua conta para finalizar.' }, { status: 401 });
  if (!turmaLigada()) return NextResponse.json({ mensagem: 'Os pedidos abrem em breve.' }, { status: 503 });

  const entrada = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!entrada) return NextResponse.json({ mensagem: 'Pedido ilegível.' }, { status: 400 });
  // armadilha para robôs: o campo escondido só vem preenchido por máquina
  if (typeof entrada.site === 'string' && entrada.site.trim()) return NextResponse.json({ id: 'ok', pagar: null });

  const lido = lerPedidoDaTurma(entrada);
  if (!lido.ok) return NextResponse.json({ erros: lido.erros, mensagem: 'Confira os campos.' }, { status: 422 });

  const id = crypto.randomUUID();
  try {
    await guardarPedidoDaTurma(id, lido.pedido, conta);
  } catch (e) {
    console.error('[turma] pedido não gravou', e);
    return NextResponse.json({ mensagem: 'Não conseguimos registrar o pedido agora. Tente de novo em instantes.' }, { status: 502 });
  }
  await avisarDonoDaTurma(id, lido.pedido, conta).catch((e) => console.error('[turma] aviso ao dono falhou', id, e));
  return NextResponse.json({ id, pagar: linkDePagamentoDaTurma(lido.pedido.formato) });
}
