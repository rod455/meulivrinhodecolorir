import 'server-only';

// As histórias sob medida no Supabase (migração 0007). Só com a chave de
// serviço: quem chama já conferiu a conta (rotas da família) ou o bilhete de
// uso único (rotas do n8n).

import type { Briefing, HistoriaNoBanco } from '@/lib/historia';
import type { SuperpoderId } from '@/lib/personagem';
import { comChaveDeServico } from './fotos';

export type Historia = HistoriaNoBanco & {
  pedida_em: string;
  user_id: string;
  idade: number;
  superpoder: SuperpoderId;
  briefing: Briefing;
  token: string | null;
  ajustes: number;
  pedido_de_ajuste: string | null;
  erro: string | null;
  aprovada_em: string | null;
};

const json = { 'content-type': 'application/json' };

export async function historiaPorId(id: string): Promise<Historia | null> {
  const r = await comChaveDeServico(`/rest/v1/historias?select=*&id=eq.${id}`);
  if (!r.ok) throw new Error(`historias ${r.status}`);
  return ((await r.json()) as Historia[])[0] ?? null;
}

/** As histórias da conta nas últimas 48 horas: base do limite e da escrita em andamento. */
export async function historiasRecentes(userId: string): Promise<Historia[]> {
  const desde = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const r = await comChaveDeServico(`/rest/v1/historias?select=*&user_id=eq.${userId}&criada_em=gte.${desde}&order=criada_em.desc`);
  if (!r.ok) throw new Error(`historias ${r.status}`);
  return (await r.json()) as Historia[];
}

export async function criarHistoria(linha: Pick<Historia, 'id' | 'user_id' | 'idade' | 'superpoder' | 'briefing' | 'token'>): Promise<void> {
  const agora = new Date().toISOString();
  const r = await comChaveDeServico('/rest/v1/historias', {
    method: 'POST',
    headers: { ...json, prefer: 'return=minimal' },
    body: JSON.stringify({ ...linha, criada_em: agora, pedida_em: agora, status: 'escrevendo', ajustes: 0 }),
  });
  if (!r.ok) throw new Error(`historias ${r.status}: ${await r.text()}`);
}

export async function mudarHistoria(id: string, campos: Partial<Historia>, condicao = ''): Promise<void> {
  const r = await comChaveDeServico(`/rest/v1/historias?id=eq.${id}${condicao}`, {
    method: 'PATCH',
    headers: { ...json, prefer: 'return=minimal' },
    body: JSON.stringify(campos),
  });
  if (!r.ok) throw new Error(`historias ${r.status}`);
}

/** Avisa o fluxo "Meu Livrinho | escrever história": só o id e o bilhete. */
export async function avisarN8nDaHistoria(id: string, token: string): Promise<boolean> {
  const url = process.env.N8N_WEBHOOK_HISTORIA;
  if (!url) return false;
  const r = await fetch(url, { method: 'POST', headers: json, body: JSON.stringify({ historia_id: id, token }), cache: 'no-store' }).catch(() => null);
  return Boolean(r?.ok);
}

/** Uma escrita que passou do tempo: a primeira vira falha; um ajuste volta ao texto anterior, sem gastar o ajuste. */
export function camposDeDesistencia(h: Historia, erro: string): Partial<Historia> {
  return h.texto ? { status: 'pronta', token: null, erro, ajustes: Math.max(0, h.ajustes - 1), pedido_de_ajuste: null } : { status: 'falhou', token: null, erro };
}
