import 'server-only';

// Os pedidos dos livros da turma (migração 0006): gravados com a chave de
// serviço, depois que a rota conferiu a conta e recalculou o preço.
//   PAGAMENTO_LINK_TURMA_IMPRESSO e PAGAMENTO_LINK_TURMA_PDF: os links de
//   pagamento que o dono cria (um por formato, porque o preço é o mesmo para
//   todos os livros). Sem eles, o pedido fica registrado e o dono cobra.

import type { FormatoDaTurma, PedidoDaTurma } from '@/lib/livros-publicados';
import { comChaveDeServico, fotoLigada } from './fotos';

export const turmaLigada = fotoLigada;

export async function guardarPedidoDaTurma(id: string, pedido: PedidoDaTurma, conta: { id: string; email: string }): Promise<void> {
  const r = await comChaveDeServico('/rest/v1/pedidos_turma', {
    method: 'POST',
    headers: { 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify({
      id,
      user_id: conta.id,
      email: conta.email,
      edicao: pedido.edicao,
      formato: pedido.formato,
      preco_centavos: pedido.precoCentavos,
      responsavel: pedido.responsavel,
      whatsapp: pedido.whatsapp,
      endereco: pedido.endereco,
    }),
  });
  if (!r.ok) throw new Error(`pedidos_turma ${r.status}: ${await r.text()}`);
}

export function linkDePagamentoDaTurma(formato: FormatoDaTurma): string | null {
  const link = process.env[`PAGAMENTO_LINK_TURMA_${formato.toUpperCase()}`];
  return link && /^https:\/\//.test(link) ? link : null;
}

/** Ao excluir a conta: some quem comprou e para onde foi; fica a venda. */
export async function anonimizarPedidosDaTurma(userId: string): Promise<void> {
  const r = await comChaveDeServico(`/rest/v1/pedidos_turma?user_id=eq.${userId}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify({ responsavel: '(apagado)', email: '(apagado)', whatsapp: '(apagado)', endereco: null, user_id: null }),
  });
  if (!r.ok) throw new Error(`pedidos_turma ${r.status}`);
}
