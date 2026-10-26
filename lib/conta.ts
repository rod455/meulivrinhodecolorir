// O que a tela da conta e a rota de exclusão precisam combinar.
export const PALAVRA_DE_CONFIRMACAO = 'EXCLUIR';

export const STATUS_DO_PEDIDO: Record<string, string> = {
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pago, preparando o livrinho',
  pdf_gerado: 'Em revisão final',
  entregue: 'Pronto para baixar',
  reembolsado: 'Reembolsado',
  cancelado: 'Cancelado',
};

/** Os pedidos dos livros da turma (migração 0006). */
export const STATUS_DO_PEDIDO_DA_TURMA: Record<string, string> = {
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pago, preparando',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};
