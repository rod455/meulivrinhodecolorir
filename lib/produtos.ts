// Produtos e preços de teste (seção 3 do documento de produto).
// Preço é decisão do dono: mudar aqui só com ele.

export type ProdutoId = 'lembrancinha' | 'presente' | 'combo' | 'sob-medida';

export type Produto = {
  id: ProdutoId;
  emoji: string;
  nome: string;
  resumo: string;
  paginas: string;
  idealPara: string;
  /** em centavos */
  preco: number;
  /** preço "de", só para ancoragem; em centavos */
  precoDe?: number;
  temDedicatoria: boolean;
};

export const PRODUTOS: Record<ProdutoId, Produto> = {
  lembrancinha: {
    id: 'lembrancinha',
    emoji: '🎉',
    nome: 'Lembrancinha de festa',
    resumo: 'Nome e idade na capa. Você imprime quantas cópias quiser.',
    paginas: '12 páginas',
    idealPara: 'Ideal para a festa de aniversário',
    preco: 3900,
    precoDe: 5900,
    temDedicatoria: false,
  },
  presente: {
    id: 'presente',
    emoji: '🎁',
    nome: 'Livrinho presente',
    resumo: 'Uma história em que a criança é a heroína, com dedicatória.',
    paginas: '20 páginas',
    idealPara: 'Ideal para presentear',
    preco: 2490,
    temDedicatoria: true,
  },
  combo: {
    id: 'combo',
    emoji: '💛',
    nome: 'Combo festa',
    resumo: 'A lembrancinha para os convidados e o livrinho presente para o aniversariante.',
    paginas: '12 + 20 páginas',
    idealPara: 'Ideal para quem quer os dois',
    preco: 5400,
    temDedicatoria: true,
  },
  // a história escrita do zero pela IA, no estilo da turma (dono, 31/10/2026: R$ 39,90).
  // Fica fora da LISTA_DE_PRODUTOS: só existe no caminho dela, e é o único produto lá.
  'sob-medida': {
    id: 'sob-medida',
    emoji: '✍️',
    nome: 'História sob medida',
    resumo: 'Uma história escrita do zero para a criança. Você vê o começo e aprova antes de pagar.',
    paginas: '20 páginas',
    idealPara: 'Ideal para um momento especial',
    preco: 3990,
    temDedicatoria: true,
  },
};

/**
 * A versão do livro (dono, 02/11/2026): o livro de colorir, a história ilustrada (colorida) ou
 * as duas, com o combo mais barato. Vale para o Livrinho presente (a turma) e para a sob medida.
 * Preços decididos pelo dono em 02/11/2026; mudar só com ele.
 */
export type VersaoId = 'colorir' | 'ilustrada' | 'combo';
export const VERSOES: { id: VersaoId; nome: string; resumo: string }[] = [
  { id: 'colorir', nome: 'Livro de colorir', resumo: 'Os desenhos em contorno, para pintar' },
  { id: 'ilustrada', nome: 'História ilustrada', resumo: 'A mesma história, toda colorida, para ler junto' },
  { id: 'combo', nome: 'Os dois', resumo: 'O de colorir e o ilustrado' },
];
export const PRECOS_POR_VERSAO: Partial<Record<ProdutoId, Record<VersaoId, number>>> = {
  presente: { colorir: 2490, ilustrada: 3490, combo: 4990 },
  'sob-medida': { colorir: 3990, ilustrada: 4990, combo: 6990 },
};
export const ehVersao = (v: unknown): v is VersaoId => v === 'colorir' || v === 'ilustrada' || v === 'combo';

/**
 * O formato do livro personalizado (dono, 09/11/2026): o PDF para imprimir em casa (os preços
 * acima) ou o livro impresso, que chega pelo correio, com o frete à parte. No impresso, o de
 * colorir e o ilustrado custam o mesmo, e o combo sai por R$ 109,90 nos dois caminhos.
 */
export type FormatoId = 'pdf' | 'impresso';
export const FORMATOS: { id: FormatoId; nome: string; resumo: string }[] = [
  { id: 'pdf', nome: 'PDF', resumo: 'Para imprimir em casa. Chega por e-mail e WhatsApp.' },
  { id: 'impresso', nome: 'Livro impresso', resumo: 'Chega pelo correio. O frete é à parte.' },
];
export const PRECOS_IMPRESSOS: Partial<Record<ProdutoId, Record<VersaoId, number>>> = {
  presente: { colorir: 6990, ilustrada: 6990, combo: 10990 },
  'sob-medida': { colorir: 7490, ilustrada: 7490, combo: 10990 },
};
export const ehFormato = (v: unknown): v is FormatoId => v === 'pdf' || v === 'impresso';
/** o produto vende o impresso? (o presente e a sob medida; a lembrancinha não) */
export const temImpresso = (produto: ProdutoId) => Boolean(PRECOS_IMPRESSOS[produto]);
/** as versões que o produto tem; os outros produtos só têm a de colorir */
export const temVersoes = (produto: ProdutoId) => Boolean(PRECOS_POR_VERSAO[produto]);
/** o preço da versão, em centavos; a de colorir é o preço de sempre do produto */
export function precoDaVersao(produto: ProdutoId, versao: VersaoId, formato: FormatoId = 'pdf'): number {
  if (formato === 'impresso') {
    const impresso = PRECOS_IMPRESSOS[produto]?.[versao];
    if (impresso) return impresso;
  }
  return PRECOS_POR_VERSAO[produto]?.[versao] ?? PRODUTOS[produto].preco;
}
/** quanto o combo economiza contra comprar as duas versões separadas */
export function economiaDoCombo(produto: ProdutoId, formato: FormatoId = 'pdf'): number {
  const p = (formato === 'impresso' ? PRECOS_IMPRESSOS[produto] : null) ?? PRECOS_POR_VERSAO[produto];
  return p ? p.colorir + p.ilustrada - p.combo : 0;
}

export const LISTA_DE_PRODUTOS: Produto[] = [PRODUTOS.lembrancinha, PRODUTOS.presente, PRODUTOS.combo];

/** Desconto do Pix, em fração (passo 7: Pix com 5% de desconto). */
export const DESCONTO_PIX = 0.05;

export type FormaDePagamento = 'pix' | 'cartao';

export function ehProduto(valor: unknown): valor is ProdutoId {
  return valor === 'lembrancinha' || valor === 'presente' || valor === 'combo' || valor === 'sob-medida';
}

/** Total em centavos. O Pix arredonda para o centavo de baixo, a favor de quem compra. */
export function totalDoPedido(produto: ProdutoId, pagamento: FormaDePagamento, versao: VersaoId = 'colorir', formato: FormatoId = 'pdf'): number {
  const base = precoDaVersao(produto, versao, formato);
  if (pagamento === 'pix') return Math.floor(base * (1 - DESCONTO_PIX));
  return base;
}

export function emReais(centavos: number): string {
  const reais = Math.floor(centavos / 100);
  const resto = String(centavos % 100).padStart(2, '0');
  return resto === '00' ? `R$ ${reais}` : `R$ ${reais},${resto}`;
}

export const MENOR_PRECO = Math.min(...LISTA_DE_PRODUTOS.map((p) => p.preco));
