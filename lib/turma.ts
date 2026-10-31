// A turma Little Paws, para a LP contar a história deles (pedido do dono,
// 31/10/2026). Cada um com o seu jeito e o livro em que é protagonista.
// Fonte: livros-fonte/ (bíblias de personagens dos livros).

export type Amigo = {
  nome: string;
  bicho: string;
  jeito: string;
  /** id do livro em lib/livros-publicados.ts em que é protagonista; null se ainda não tem */
  livro: string | null;
  /** cor de apoio do cartão (classe tom-*) */
  tom: 'amarelo' | 'laranja' | 'verde' | 'azul' | 'rosa' | 'nuvem';
};

export const TURMA: Amigo[] = [
  { nome: 'Pip', bicho: 'coelho', jeito: 'Pequeno e rapidinho. Queria fazer a cesta da vitória sozinho, até descobrir o time.', livro: 'big-game', tom: 'amarelo' },
  { nome: 'Bo', bicho: 'urso', jeito: 'Grandão e gentil como um abraço. Aprendeu com a Vovó Ursa que patas grandes podem ser patas gentis.', livro: 'big-play', tom: 'laranja' },
  { nome: 'Dot', bicho: 'tartaruga', jeito: 'A mais devagar da turma, e por isso a que mais repara. Foi ela quem achou a estrela do Natal.', livro: 'big-christmas', tom: 'verde' },
  { nome: 'Milo', bicho: 'guaxinim', jeito: 'Repara em tudo, menos na bola. Na grande final de futebol, aprendeu a olhar na hora certa.', livro: 'grande-final', tom: 'azul' },
  { nome: 'Luna', bicho: 'raposa', jeito: 'Sempre tem um plano na prancheta. O livro dela ainda está por vir.', livro: null, tom: 'rosa' },
  { nome: 'Kiko', bicho: 'porco-espinho', jeito: 'O novo do bairro. Tinha medo de furar a bola com os espinhos, até descobrir que no futebol a bola é no pé.', livro: 'grande-final', tom: 'nuvem' },
];
