// Temas do MVP (seção 8). Os da fase 2 ficam listados para a vitrine dizer "em breve".

export type TemaId = 'futebol' | 'natal' | 'fundo-do-mar';

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
    descricao: 'Urso, coelha, raposa, guaxinim e tartaruga, bola no pé e muito gol.',
    tituloDaHistoria: 'e o gol mais bonito do mundo',
    cor: 'verde',
    faixas: ['todos', 'bebes', 'maiores'],
    amostras: ['{nome} chutou e foi gol!', 'Pinte a camisa do time de {nome}'],
    historia: 'Naquela manhã, {nome} acordou com um barulhinho de bola quicando lá fora…',
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
  },
};

export const LISTA_DE_TEMAS: Tema[] = [TEMAS.futebol, TEMAS.natal, TEMAS['fundo-do-mar']];

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
  return valor === 'futebol' || valor === 'natal' || valor === 'fundo-do-mar';
}

export function comNome(frase: string, nome: string): string {
  return frase.replaceAll('{nome}', nome);
}
