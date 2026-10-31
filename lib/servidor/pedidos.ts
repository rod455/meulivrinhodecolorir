import 'server-only';

// Para onde vai um pedido validado. Três destinos, todos opcionais e ligados
// por variável de ambiente na Vercel:
//   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY  grava na tabela `pedidos`
//   N8N_WEBHOOK_PEDIDO                         avisa o n8n (geração do PDF, envio, lembretes)
//   PAGAMENTO_LINK_<PRODUTO>_<PIX|CARTAO>      link de pagamento para onde a pessoa vai
// Sem nenhum dos dois primeiros, a rota recusa o pedido: pedido que não fica
// guardado em lugar nenhum é pedido perdido.

import type { PlanoDoLivro } from '@/lib/geracao';
import type { PlanoSobMedida } from '@/lib/historia';
import type { Pedido } from '@/lib/pedido';

/** `plano` só existe nos temas com personagem: é a receita que o n8n executa (a da turma ou a da sob medida). */
export type Registro = Pedido & { id: string; criadoEm: string; origem: Record<string, string>; plano: PlanoDoLivro | PlanoSobMedida | null; userId: string };

export function destinosLigados() {
  return {
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    n8n: Boolean(process.env.N8N_WEBHOOK_PEDIDO),
  };
}

export function linkDePagamento(pedido: Pedido): string | null {
  const chave = `PAGAMENTO_LINK_${pedido.produto.toUpperCase().replace(/-/g, '_')}_${pedido.pagamento === 'pix' ? 'PIX' : 'CARTAO'}`;
  const link = process.env[chave];
  return link && /^https:\/\//.test(link) ? link : null;
}

function emLinhaDoBanco(r: Registro) {
  return {
    id: r.id,
    criado_em: r.criadoEm,
    produto: r.produto,
    tema: r.tema,
    nome_crianca: r.nome,
    idade: r.idade,
    data_festa: r.dataDaFesta,
    dedicatoria: r.dedicatoria,
    responsavel: r.responsavel,
    email: r.email,
    whatsapp: r.whatsapp,
    forma_pagamento: r.pagamento,
    total_centavos: r.total,
    aceita_novidades: r.aceitaNovidades,
    aceita_lembrete: r.aceitaLembrete,
    status: 'aguardando_pagamento',
    origem: r.origem,
    modelo: r.plano?.modelo ?? null,
    personagem: r.personagem,
    plano: r.plano,
    user_id: r.userId,
  };
}

async function gravarNoSupabase(r: Registro): Promise<void> {
  const resposta = await fetch(`${process.env.SUPABASE_URL}/rest/v1/pedidos`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
      prefer: 'return=minimal',
    },
    body: JSON.stringify(emLinhaDoBanco(r)),
    cache: 'no-store',
  });
  if (!resposta.ok) throw new Error(`supabase ${resposta.status}: ${await resposta.text()}`);
}

async function avisarN8n(r: Registro): Promise<void> {
  const resposta = await fetch(process.env.N8N_WEBHOOK_PEDIDO!, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ evento: 'pedido_criado', pedido: emLinhaDoBanco(r) }),
    cache: 'no-store',
  });
  if (!resposta.ok) throw new Error(`n8n ${resposta.status}`);
}

/**
 * Grava em todos os destinos ligados. Basta UM aceitar para o pedido valer;
 * a falha do outro vai para o log, para não perder venda por um aviso.
 */
export async function guardarPedido(r: Registro): Promise<{ guardado: boolean }> {
  const ligados = destinosLigados();
  const tentativas: Promise<void>[] = [];
  if (ligados.supabase) tentativas.push(gravarNoSupabase(r));
  if (ligados.n8n) tentativas.push(avisarN8n(r));
  const resultados = await Promise.allSettled(tentativas);
  for (const res of resultados) {
    if (res.status === 'rejected') console.error('[pedido] destino falhou', r.id, res.reason);
  }
  return { guardado: resultados.some((res) => res.status === 'fulfilled') };
}
