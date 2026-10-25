// A ficha do personagem antes de pagar (decisão do dono, 25/10/2026): só com
// conta, a família vê só a ficha (nunca o livro), em prévia pequena com marca
// d'água, e pode pedir até 2 ajustes. Puro: conferido por `npm run conferir:ficha`.

import type { Personagem } from './personagem.ts';

/** a primeira ficha e mais 2 ajustes, por pessoa, a cada 24 horas, sem contar as que viraram pedido */
export const LIMITE_DE_FICHAS = 3;
export const JANELA_DO_LIMITE_HORAS = 24;
/** passou disso "gerando", a ficha conta como falha e não gasta tentativa */
export const MINUTOS_PARA_DESISTIR = 10;

/**
 * O tamanho e a qualidade que o fluxo "Meu Livrinho: gerar ficha" usa (o modelo,
 * gpt-image-2, fica fixo nos nós da OpenAI do fluxo; o gpt-image-1 já não gera
 * imagem: "does not exist" no teste de 25/10/2026). Mudou aqui, muda lá.
 */
export const PEDIDO_DE_IMAGEM = {
  tamanho: '1536x1024',
  qualidade: 'medium',
  formato: 'jpeg',
} as const;

export type FichaNoBanco = {
  id: string;
  criada_em: string;
  status: 'gerando' | 'pronta' | 'falhou';
  pedido_id: string | null;
};

/** Quantas fichas a pessoa ainda pode gerar agora. Falha e ficha que virou pedido não contam. */
export function fichasRestantes(fichas: FichaNoBanco[], agora: Date): number {
  const desde = agora.getTime() - JANELA_DO_LIMITE_HORAS * 60 * 60 * 1000;
  const usadas = fichas.filter((f) => !f.pedido_id && contaComoTentativa(f, agora) && new Date(f.criada_em).getTime() >= desde).length;
  return Math.max(0, LIMITE_DE_FICHAS - usadas);
}

export function contaComoTentativa(f: FichaNoBanco, agora: Date): boolean {
  if (f.status === 'falhou') return false;
  if (f.status === 'gerando' && desistiu(f, agora)) return false;
  return true;
}

export function desistiu(f: Pick<FichaNoBanco, 'status' | 'criada_em'>, agora: Date): boolean {
  return f.status === 'gerando' && agora.getTime() - new Date(f.criada_em).getTime() > MINUTOS_PARA_DESISTIR * 60 * 1000;
}

/**
 * O que define o desenho. O superpoder não muda a ficha (só a página 13),
 * então trocar de superpoder depois de aprovar não pede ficha nova.
 */
export function chaveDoDesenho(personagem: Personagem, idade: number): string {
  const { superpoder: _superpoder, ...resto } = personagem;
  void _superpoder;
  return JSON.stringify({ ...resto, idade });
}

/** Bilhete de uso único que o n8n usa para buscar o trabalho e devolver a imagem. */
export function novoBilhete(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Compara sem vazar pelo tempo de resposta quantos caracteres bateram. */
export function bilheteConfere(esperado: string | null | undefined, recebido: unknown): boolean {
  if (!esperado || typeof recebido !== 'string' || recebido.length !== esperado.length) return false;
  let diferenca = 0;
  for (let i = 0; i < esperado.length; i++) diferenca |= esperado.charCodeAt(i) ^ recebido.charCodeAt(i);
  return diferenca === 0;
}

export const ehUuid = (texto: unknown): texto is string => typeof texto === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(texto);
