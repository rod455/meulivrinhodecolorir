// Monta o PDF do Livrinho Presente (A5, 20 páginas) a partir das imagens já com a
// criança. Cada tema traz o seu modelo (lib/modelos-a5.ts), com as medidas tiradas do
// PDF do dono (gerado pelo script Python dele com ReportLab): as caixas das artes, os
// blocos de texto e as duas páginas que não mudam de desenho (o fundo da dedicatória e a
// contracapa), copiadas do próprio PDF dele sem as marcações do guia.
// Puro: recebe os bytes e devolve os bytes; quem lê arquivos e o banco é o servidor.
// Conferido por `npm run conferir:livro`.

import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';

/** A5 em pontos */
export const PAGINA_A5 = { largura: 419.528, altura: 595.276 } as const;

export type Caixa = { x: number; y: number; largura: number; altura: number };
type Cor = [number, number, number];

/**
 * Um parágrafo centralizado, como o Paragraph do ReportLab: a primeira linha fica na
 * `base` e as outras descem a `entrelinha`. "\n" força linha nova. Os marcadores
 * ({NOME}, {QUEM_PRESENTEIA}, {DEDICATORIA}, {SUPERPODER_NOME}) são trocados antes.
 */
export type Bloco = {
  texto: string;
  fonte: 'titulo' | 'texto';
  tamanho: number;
  entrelinha?: number;
  /** a base da primeira linha; ou, com `abaixoDoAnterior`, a distância da última linha do bloco anterior */
  base: number;
  abaixoDoAnterior?: boolean;
  /** largura para quebrar; sem ela, uma linha só */
  largura?: number;
  /** centro horizontal; sem ele, o centro da página */
  centro?: number;
  cor?: Cor;
  /** largura máxima de uma linha só: diminui a letra se não couber (o nome na capa e no certificado) */
  encolher?: number;
};

export type ModeloA5 = {
  fontes: { titulo: string; texto: string };
  /** PDF com duas páginas tiradas do modelo do dono: [0] o fundo da dedicatória, [1] a contracapa */
  paginasFixas: string;
  capa: { arte: Caixa; blocos: Bloco[] };
  dedicatoria: { blocos: Bloco[] };
  historia: {
    arte: Caixa;
    artePorPagina: Record<number, Caixa>;
    texto: {
      fonte: 'titulo' | 'texto';
      tamanho: number;
      entrelinha: number;
      primeiraBase: number;
      x: number;
      largura: number;
      cor?: Cor;
      /** no basquete o parêntese da brincadeira de achar começa linha nova; no futebol, não */
      parenteseNovaLinha: boolean;
    };
    numero: { fonte: 'titulo' | 'texto'; tamanho: number; base: number; doisDigitos: boolean };
  };
  certificado: { arte: Caixa; blocos: Bloco[] };
};

export type EntradaDoLivro = {
  modelo: ModeloA5;
  /** os valores dos marcadores: NOME, QUEM_PRESENTEIA, DEDICATORIA, SUPERPODER_NOME */
  valores: Record<string, string>;
  titulo: string;
  autores: string;
  capa: Uint8Array;
  paginas: { pagina: number; imagem: Uint8Array; texto: string }[];
  certificado: Uint8Array;
  paginasFixas: Uint8Array;
  fontes: { titulo: Uint8Array; texto: Uint8Array };
};

const PRETO: Cor = [0, 0, 0];

/**
 * Quebra o texto em linhas que cabem na largura, como o Paragraph do ReportLab (por palavras).
 * "\n" força linha nova; o parêntese da brincadeira de achar ("(Psiu… quem está lá?)") também,
 * como no modelo do basquete. O espaço que não quebra ("Little Paws") mantém as palavras juntas.
 */
export function quebrarLinhas(texto: string, fonte: PDFFont, tamanho: number, largura: number, parenteseNovaLinha = true): string[] {
  if (texto.includes('\n')) return texto.split('\n').flatMap((p) => quebrarLinhas(p, fonte, tamanho, largura, parenteseNovaLinha));
  if (parenteseNovaLinha) {
    const partes = texto.split(/\s+(?=\()/);
    if (partes.length > 1) return partes.flatMap((p) => quebrarLinhas(p, fonte, tamanho, largura, false));
  }
  const linhas: string[] = [];
  const medir = (t: string) => fonte.widthOfTextAtSize(t.replaceAll(' ', ' '), tamanho);
  let atual = '';
  // \s inclui o espaço que não quebra; por isso a quebra é só no espaço comum
  for (const palavra of texto.split(/[ \t]+/).filter(Boolean)) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    // folga de 0,5%: as medidas da fonte estática diferem um fio das do ReportLab
    if (atual && medir(tentativa) > largura * 1.005) {
      linhas.push(atual);
      atual = palavra;
    } else atual = tentativa;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

function centrado(pagina: PDFPage, textoComNbsp: string, fonte: PDFFont, tamanho: number, base: number, cor: Cor = PRETO, centro = PAGINA_A5.largura / 2) {
  const texto = textoComNbsp.replaceAll(' ', ' ');
  pagina.drawText(texto, { x: centro - fonte.widthOfTextAtSize(texto, tamanho) / 2, y: base, size: tamanho, font: fonte, color: rgb(...cor) });
}

export const preencher = (texto: string, valores: Record<string, string>) => texto.replace(/\{([A-Z_]+)\}/g, (inteiro, chave: string) => valores[chave] ?? inteiro);

/** Desenha os blocos de uma página; devolve a base da última linha (para o bloco seguinte). */
function desenharBlocos(pagina: PDFPage, blocos: Bloco[], fontes: { titulo: PDFFont; texto: PDFFont }, valores: Record<string, string>) {
  let ultimaBase = 0;
  for (const b of blocos) {
    const fonte = fontes[b.fonte];
    const texto = preencher(b.texto, valores);
    let tamanho = b.tamanho;
    if (b.encolher) {
      const w = fonte.widthOfTextAtSize(texto, tamanho);
      if (w > b.encolher) tamanho = Math.floor((tamanho * b.encolher) / w);
    }
    const linhas = b.largura ? quebrarLinhas(texto, fonte, tamanho, b.largura, false) : texto.split('\n');
    const primeira = b.abaixoDoAnterior ? ultimaBase - b.base : b.base;
    linhas.forEach((linha, i) => centrado(pagina, linha, fonte, tamanho, primeira - i * (b.entrelinha ?? tamanho * 1.25), b.cor, b.centro));
    ultimaBase = primeira - (linhas.length - 1) * (b.entrelinha ?? tamanho * 1.25);
  }
}

const emPontos = (c: Caixa) => ({ x: c.x, y: c.y, width: c.largura, height: c.altura });

async function imagem(doc: PDFDocument, bytes: Uint8Array) {
  // as cenas e as páginas geradas são JPEG; PNG também serve
  return bytes[0] === 0x89 ? doc.embedPng(bytes) : doc.embedJpg(bytes);
}

export async function montarLivroA5(e: EntradaDoLivro): Promise<Uint8Array> {
  const m = e.modelo;
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  // subset: o arquivo leva só as letras usadas, como o do modelo
  const fontes = { titulo: await doc.embedFont(e.fontes.titulo, { subset: true }), texto: await doc.embedFont(e.fontes.texto, { subset: true }) };
  const fixas = await PDFDocument.load(e.paginasFixas);
  const [fundoDaDedicatoria, contracapa] = await doc.copyPages(fixas, [0, 1]);
  const nova = () => doc.addPage([PAGINA_A5.largura, PAGINA_A5.altura]);
  doc.setTitle(e.titulo);
  doc.setAuthor(e.autores);
  doc.setProducer('meulivrinhodecolorir.com.br');
  doc.setCreator('meulivrinhodecolorir.com.br');

  // 1. capa: a arte colorida com a criança e os textos do modelo por cima
  const capa = nova();
  capa.drawImage(await imagem(doc, e.capa), emPontos(m.capa.arte));
  desenharBlocos(capa, m.capa.blocos, fontes, e.valores);

  // 2. dedicatória sobre o fundo do modelo (varal, moldura)
  doc.addPage(fundoDaDedicatoria);
  desenharBlocos(fundoDaDedicatoria, m.dedicatoria.blocos, fontes, e.valores);

  // 3 a 18. a história: a arte, o texto no rodapé (de cima para baixo) e o número
  const h = m.historia;
  for (const p of e.paginas) {
    const pg = nova();
    pg.drawImage(await imagem(doc, p.imagem), emPontos(h.artePorPagina[p.pagina] ?? h.arte));
    const fonte = fontes[h.texto.fonte];
    quebrarLinhas(p.texto, fonte, h.texto.tamanho, h.texto.largura, h.texto.parenteseNovaLinha).forEach((linha, i) =>
      centrado(pg, linha, fonte, h.texto.tamanho, h.texto.primeiraBase - i * h.texto.entrelinha, h.texto.cor, h.texto.x + h.texto.largura / 2),
    );
    centrado(pg, h.numero.doisDigitos ? String(p.pagina).padStart(2, '0') : String(p.pagina), fontes[h.numero.fonte], h.numero.tamanho, h.numero.base);
  }

  // 19. certificado
  const cert = nova();
  cert.drawImage(await imagem(doc, e.certificado), emPontos(m.certificado.arte));
  desenharBlocos(cert, m.certificado.blocos, fontes, e.valores);

  // 20. contracapa do modelo, inteira
  doc.addPage(contracapa);

  return doc.save();
}
