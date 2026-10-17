// Produtos e preços de teste (seção 3 do documento de produto).
// Preço é decisão do dono: mudar aqui só com ele.

export type ProdutoId = 'lembrancinha' | 'presente' | 'combo';

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
};

export const LISTA_DE_PRODUTOS: Produto[] = [PRODUTOS.lembrancinha, PRODUTOS.presente, PRODUTOS.combo];

/** Desconto do Pix, em fração (passo 7: Pix com 5% de desconto). */
export const DESCONTO_PIX = 0.05;

export type FormaDePagamento = 'pix' | 'cartao';

export function ehProduto(valor: unknown): valor is ProdutoId {
  return valor === 'lembrancinha' || valor === 'presente' || valor === 'combo';
}

/** Total em centavos. O Pix arredonda para o centavo de baixo, a favor de quem compra. */
export function totalDoPedido(produto: ProdutoId, pagamento: FormaDePagamento): number {
  const base = PRODUTOS[produto].preco;
  if (pagamento === 'pix') return Math.floor(base * (1 - DESCONTO_PIX));
  return base;
}

export function emReais(centavos: number): string {
  const reais = Math.floor(centavos / 100);
  const resto = String(centavos % 100).padStart(2, '0');
  return resto === '00' ? `R$ ${reais}` : `R$ ${reais},${resto}`;
}

export const MENOR_PRECO = Math.min(...LISTA_DE_PRODUTOS.map((p) => p.preco));
