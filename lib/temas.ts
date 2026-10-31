// Temas do MVP (seção 8). Os da fase 2 ficam listados para a vitrine dizer "em breve".

export type TemaId = 'futebol' | 'natal' | 'fundo-do-mar' | 'sob-medida';

export type Tema = {
  id: TemaId;
  emoji: string;
  nome: string;
  descricao: string;
  /** frase de capa abaixo do nome, no livrinho presente */
  tituloDaHistoria: string;
  /** cor de apoio do cartão (token da paleta) */
  cor: 'verde' | 'rosa' | 'azul';
  faixas: Faixa[];
  /** duas frases das páginas de amostra; {nome} vira o nome da criança */
  amostras: [string, string];
  /** começo da história do livrinho presente; {nome} vira o nome */
  historia: string;
  /** artes coloridas em public/artes: a cena da capa e as duas das páginas de amostra.
   * Sem elas, o tema usa o desenho em SVG de components/desenho/temas.tsx. */
  artes?: { capa: string; amostras: [string, string] };
  /** imagem de vitrine do tema na galeria da LP, do kit de marca (sem nome gravado por cima) */
  vitrine: { src: string; largura: number; altura: number };
  /** o tema tem história com vaga para o personagem da criança (lib/historias) */
  comPersonagem?: boolean;
  /** a história é escrita do zero pela IA para cada criança (lib/historia.ts) */
  sobMedida?: boolean;
};

export type Faixa = 'todos' | 'bebes' | 'maiores';

export const FAIXAS: { id: Faixa; rotulo: string }[] = [
  { id: 'todos', rotulo: 'Para meninos e meninas' },
  { id: 'bebes', rotulo: 'Bebês (2 a 3 anos)' },
  { id: 'maiores', rotulo: 'Maiores (5 a 8 anos)' },
];

export const TEMAS: Record<TemaId, Tema> = {
  futebol: {
    id: 'futebol',
    emoji: '⚽',
    nome: 'Futebol com a turma Little Paws',
    descricao: 'Pip, Bo, Luna, Milo e Dot, a turma Little Paws, com bola no pé e muito gol.',
    tituloDaHistoria: 'e o gol mais bonito do mundo',
    cor: 'verde',
    faixas: ['todos', 'bebes', 'maiores'],
    amostras: ['{nome} chutou e foi gol!', 'Pinte a camisa do time de {nome}'],
    historia: 'Naquela manhã, {nome} acordou com um barulhinho de bola quicando lá fora…',
    vitrine: { src: '/artes/turma-em-fila.webp', largura: 970, altura: 600 },
    comPersonagem: true,
    artes: {
      capa: '/artes/turma-em-fila.webp',
      amostras: ['/artes/turma-comemorando.webp', '/artes/turma-no-banco.webp'],
    },
  },
  natal: {
    id: 'natal',
    emoji: '🎄',
    nome: 'Natal mágico',
    descricao: 'Árvore, presentes e uma noite cheia de estrelas.',
    tituloDaHistoria: 'e a estrela que caiu no quintal',
    cor: 'rosa',
    faixas: ['todos', 'bebes', 'maiores'],
    amostras: ['Feliz Natal, {nome}!', 'Que presente {nome} vai abrir?'],
    historia: 'Na noite de Natal, {nome} viu uma luz pequenininha piscando perto da janela…',
    vitrine: { src: '/marca/livro-natal.webp', largura: 216, altura: 390 },
  },
  'fundo-do-mar': {
    id: 'fundo-do-mar',
    emoji: '🌊',
    nome: 'Fundo do mar',
    descricao: 'Peixinhos, baleia e tesouros para colorir.',
    tituloDaHistoria: 'e o mergulho no mar encantado',
    cor: 'azul',
    faixas: ['todos', 'bebes', 'maiores'],
    amostras: ['{nome} fez amizade com a baleia', 'Quantos peixinhos {nome} encontrou?'],
    historia: 'Num dia de sol, {nome} encontrou uma concha que cantava baixinho…',
    vitrine: { src: '/marca/livro-fundo-do-mar.webp', largura: 238, altura: 402 },
  },
  // não é um tema de vitrine: é o "tema" da história sob medida, que a IA escreve
  'sob-medida': {
    id: 'sob-medida',
    emoji: '✍️',
    nome: 'História sob medida com o jeito Little Paws',
    descricao: 'Uma história escrita do zero, com o lugar, a lição e os gostos da criança.',
    tituloDaHistoria: 'e uma história só sua',
    cor: 'verde',
    faixas: ['todos', 'bebes', 'maiores'],
    amostras: ['{nome} é a estrela desta história', 'Uma aventura escrita só para {nome}'],
    historia: 'Era uma vez {nome}, e uma ideia que não cabia no bolso…',
    vitrine: { src: '/artes/turma-comemorando.webp', largura: 600, altura: 600 },
    comPersonagem: true,
    sobMedida: true,
    artes: {
      capa: '/artes/turma-comemorando.webp',
      amostras: ['/artes/turma-no-banco.webp', '/artes/turma-em-fila.webp'],
    },
  },
};

export const LISTA_DE_TEMAS: Tema[] = [TEMAS.futebol, TEMAS.natal, TEMAS['fundo-do-mar']];

/**
 * A primeira escolha do site (pedido do dono, 31/10/2026): ou a história da
 * turma Little Paws, com a criança entrando no time, ou uma história do zero,
 * em que a criança é a heroína sozinha. Os temas com personagem são da turma.
 */
// O terceiro caminho (31/10/2026): a história sob medida, escrita pela IA.
export type Caminho = 'turma' | 'zero' | 'sob-medida';
export const ehCaminho = (v: unknown): v is Caminho => v === 'turma' || v === 'zero' || v === 'sob-medida';
export const caminhoDoTema = (t: TemaId): Caminho => (TEMAS[t].sobMedida ? 'sob-medida' : TEMAS[t].comPersonagem ? 'turma' : 'zero');
export const TEMAS_DO_CAMINHO: Record<Caminho, Tema[]> = {
  turma: LISTA_DE_TEMAS.filter((t) => t.comPersonagem),
  zero: LISTA_DE_TEMAS.filter((t) => !t.comPersonagem),
  'sob-medida': [TEMAS['sob-medida']],
};

export const TEMAS_EM_BREVE = [
  { emoji: '🦕', nome: 'Dinossauros' },
  { emoji: '🦁', nome: 'Safári e selva' },
  { emoji: '🐄', nome: 'Fazendinha' },
  { emoji: '🚀', nome: 'Espaço e astronauta' },
  { emoji: '🦄', nome: 'Unicórnio e arco-íris' },
  { emoji: '🧚', nome: 'Fadas e jardim encantado' },
  { emoji: '🧁', nome: 'Confeitaria e docinhos' },
];

export function ehTema(valor: unknown): valor is TemaId {
  return valor === 'futebol' || valor === 'natal' || valor === 'fundo-do-mar' || valor === 'sob-medida';
}

export function comNome(frase: string, nome: string): string {
  return frase.replaceAll('{nome}', nome);
}
