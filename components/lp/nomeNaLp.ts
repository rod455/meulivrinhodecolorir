'use client';

// O nome que a família digita no topo da LP acompanha a página inteira: os
// dois caminhos, o livro de exemplo e os botões levam o nome junto para o
// /criar. Um guarda pequeno, sem biblioteca, lido com useSyncExternalStore.
// O nome fica só na memória da página; não vai para lugar nenhum.

import { useSyncExternalStore } from 'react';
import { arrumarNome, problemaDoNome } from '@/lib/nome';

let nome = '';
const ouvintes = new Set<() => void>();

export function mudarNomeNaLp(novo: string) {
  nome = novo;
  for (const o of ouvintes) o();
}

function assinar(o: () => void) {
  ouvintes.add(o);
  return () => ouvintes.delete(o);
}

/** O nome como foi digitado (para o campo) e o nome pronto para mostrar ('' se não serve). */
export function useNomeNaLp(): { digitado: string; nome: string } {
  const digitado = useSyncExternalStore(assinar, () => nome, () => '');
  const pronto = digitado.trim() && !problemaDoNome(digitado) ? arrumarNome(digitado) : '';
  return { digitado, nome: pronto };
}

/** O link do /criar com o caminho e, se houver, o nome. */
export function linkDoCaminho(caminho: 'turma' | 'sob-medida', nomePronto: string): string {
  const busca = new URLSearchParams(caminho === 'turma' ? { caminho, tema: 'futebol' } : { caminho });
  if (nomePronto) busca.set('nome', nomePronto);
  return `/criar?${busca.toString()}`;
}
