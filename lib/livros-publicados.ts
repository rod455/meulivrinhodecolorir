// Os livros da turma Little Paws já publicados na Amazon (KDP), em inglês:
// mostram na LP que a turma tem histórias de verdade, e dão um empurrão para
// o inglês desde cedo (pedido do dono, 26/10/2026). Fonte das histórias:
// livros-fonte/ (README, com o status de cada um).
//
// `capa` fica null e `links` vazio até o dono dizer qual é qual: sem capa, o
// cartão aparece só com o texto; sem link, sem botão. Nunca inventar link nem
// capa, nem adivinhar pelo código da Amazon qual livro é qual.

export type LivroPublicado = {
  id: string;
  titulo: string;
  subtitulo: string | null;
  /** o que a criança vive na história, em português */
  historia: string;
  formatos: string;
  /** caminho em public/, a capa de verdade do livro */
  capa: { src: string; largura: number; altura: number } | null;
  /** uma página da Amazon por formato (colorir, ilustrado, eBook) */
  links: { formato: string; url: string }[];
};

export const LIVROS_PUBLICADOS: LivroPublicado[] = [
  {
    id: 'big-game',
    titulo: 'Little Paws, Big Game',
    subtitulo: null,
    historia:
      'No basquete, Pip quer fazer a cesta decisiva sozinho. Descobrindo o que cada amigo faz de melhor, aprende a jogar em equipe, e o time termina unido, mesmo perdendo por um ponto.',
    formatos: 'Livro de colorir',
    capa: null,
    links: [],
  },
  {
    id: 'big-play',
    titulo: 'Little Paws, Big Play',
    subtitulo: 'A Story About Gentle Strength',
    historia:
      'Bo é o maior do time, mas no flag football ninguém derruba ninguém: é preciso puxar a bandeirinha com jeito. Com a ajuda dos amigos e da Vovó Ursa, ele descobre o que é força de verdade.',
    formatos: 'Livro ilustrado, eBook e livro de colorir',
    capa: null,
    links: [],
  },
  {
    id: 'big-christmas',
    titulo: 'Little Paws, Big Christmas',
    subtitulo: 'A Christmas Story About Patience',
    historia:
      'Dot é a mais devagar da turma e pede ao Papai Noel para ser rápida. Mas, quando o vento leva a estrela da árvore de Natal, é ela quem para, olha com calma e encontra o caminho.',
    formatos: 'Livro de colorir e atividades',
    capa: null,
    links: [],
  },
];

/** Só link da Amazon, em https: o que vai para a LP nunca aponta para outro lugar. */
export const linkValido = (link: string): boolean => /^https:\/\/(www\.)?amazon\.[a-z.]+\/dp\/[A-Z0-9]{10}$/.test(link);
