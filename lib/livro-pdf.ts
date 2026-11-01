// Monta o PDF do Livrinho Presente (A5, 20 páginas) a partir das imagens já com a
// criança. As medidas vêm do modelo do dono (basquete-presente-base-A5.pdf, gerado
// pelo script Python dele com ReportLab): mesma página, mesmas caixas, mesmas fontes
// (Baloo 2 nos títulos, Nunito Sans no texto), mesmo texto alinhado ao centro.
// Puro: recebe os bytes e devolve os bytes; quem lê arquivos e o banco é o servidor.
// Conferido por `npm run conferir:livro`.

import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';

/** A5 em pontos */
export const PAGINA_A5 = { largura: 419.528, altura: 595.276 } as const;

type Caixa = { x: number; y: number; largura: number; altura: number };

/** Medidas do modelo A5, em pontos, com a origem embaixo à esquerda (como no PDF). */
export const LAYOUT_A5 = {
  capa: {
    arte: { x: 39.118, y: 0, largura: 341.291, altura: 511.937 },
    titulo: { tamanho: 30, entrelinha: 34.5, primeiraBase: 526.58 },
    subtitulo: { tamanho: 11, base: 459.27 },
    autores: { tamanho: 8, base: 12.83 },
  },
  dedicatoria: {
    varal: { y: 523.843, x0: 50.343, x1: 369.184, primeiraBandeira: 71.32, passo: 45.309, largura: 20.976, ponta: 504.964 },
    para: { tamanho: 18, entrelinha: 24.84, primeiraBase: 398.69, largura: 310 },
    texto: { tamanho: 14, entrelinha: 19.32, primeiraBase: 277.69, largura: 285 },
  },
  historia: {
    arte: { x: 27.213, y: 47.622, largura: 365.102, altura: 547.654 },
    texto: { tamanho: 14, entrelinha: 18.62, primeiraBase: 109.22, x: 37.757, largura: 344.01 },
    numero: { tamanho: 8, base: 20.835 },
  },
  certificado: {
    arte: { x: 11.339, y: 0, largura: 396.85, altura: 595.276 },
    titulo: { tamanho: 16, base: 469.15 },
    texto: { tamanho: 13, entrelinha: 17.94, primeiraBase: 433.46, largura: 201.37 },
    superpoder: { tamanho: 10, distancia: 17.76 },
    desenhe: { tamanho: 10, base: 305.5 },
  },
} as const;

const AZUL_DA_CAPA = rgb(0.098039, 0.211765, 0.294118);
const PRETO = rgb(0, 0, 0);

export type EntradaDoLivro = {
  /** já com o nome: "Laura entra na quadra!"; a primeira linha é o nome, como no modelo */
  nome: string;
  restoDoTitulo: string;
  subtitulo: string;
  autores: string;
  /** "sua família" no modelo aprovado */
  quemPresenteia: string;
  /** a da família, ou a frase do tema quando ela não escreveu */
  dedicatoria: string;
  capa: Uint8Array;
  paginas: { pagina: number; imagem: Uint8Array; texto: string; arte?: Caixa }[];
  certificado: { arte: Uint8Array; linhas: string; superpoder: string };
  /** a contracapa do modelo, copiada inteira (não muda entre pedidos) */
  contracapa: Uint8Array;
  fontes: { titulo: Uint8Array; texto: Uint8Array };
};

/**
 * Quebra o texto em linhas que cabem na largura, como o Paragraph do ReportLab (por palavras).
 * O parêntese da brincadeira de achar ("(Psiu… quem está lá?)") começa linha nova, como no modelo.
 */
export function quebrarLinhas(texto: string, fonte: PDFFont, tamanho: number, largura: number): string[] {
  const partes = texto.split(/\s+(?=\()/);
  if (partes.length > 1) return partes.flatMap((p) => quebrarLinhas(p, fonte, tamanho, largura));
  const linhas: string[] = [];
  const medir = (t: string) => fonte.widthOfTextAtSize(t.replaceAll(' ', ' '), tamanho);
  let atual = '';
  // \s inclui o espaço que não quebra; por isso a quebra é só no espaço comum
  for (const palavra of texto.split(/[ \t\n]+/).filter(Boolean)) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    // folga de 0,5%: as medidas da fonte estática diferem um fio das do ReportLab, e sem ela
    // "queria a" desce uma palavra antes do modelo
    if (atual && medir(tentativa) > largura * 1.005) {
      linhas.push(atual);
      atual = palavra;
    } else atual = tentativa;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

/** O espaço que não quebra ("Little Paws") vira espaço comum na hora de desenhar. */
function centrado(pagina: PDFPage, textoComNbsp: string, fonte: PDFFont, tamanho: number, base: number, cor = PRETO, centro = PAGINA_A5.largura / 2) {
  const texto = textoComNbsp.replaceAll('\u00a0', ' ');
  pagina.drawText(texto, { x: centro - fonte.widthOfTextAtSize(texto, tamanho) / 2, y: base, size: tamanho, font: fonte, color: cor });
}

/** Tamanho que faz a linha caber na largura, sem passar do tamanho do modelo (nomes longos). */
function tamanhoQueCabe(texto: string, fonte: PDFFont, tamanho: number, largura: number): number {
  const w = fonte.widthOfTextAtSize(texto, tamanho);
  return w <= largura ? tamanho : Math.floor((tamanho * largura) / w);
}

const emPontos = (c: Caixa) => ({ x: c.x, y: c.y, width: c.largura, height: c.altura });

async function imagem(doc: PDFDocument, bytes: Uint8Array) {
  // as cenas e as páginas geradas são JPEG; PNG também serve
  return bytes[0] === 0x89 ? doc.embedPng(bytes) : doc.embedJpg(bytes);
}

export async function montarLivroA5(e: EntradaDoLivro): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  // subset: o arquivo leva só as letras usadas, como o do modelo
  const titulo = await doc.embedFont(e.fontes.titulo, { subset: true });
  const texto = await doc.embedFont(e.fontes.texto, { subset: true });
  const L = LAYOUT_A5;
  const nova = () => doc.addPage([PAGINA_A5.largura, PAGINA_A5.altura]);
  doc.setTitle(`${e.nome} ${e.restoDoTitulo}`);
  doc.setAuthor(e.autores);
  doc.setProducer('meulivrinhodecolorir.com.br');
  doc.setCreator('meulivrinhodecolorir.com.br');

  // 1. capa: a arte colorida com a criança, o nome em cima e o resto do título embaixo
  const capa = nova();
  capa.drawImage(await imagem(doc, e.capa), emPontos(L.capa.arte));
  const t = L.capa.titulo;
  const larguraUtil = PAGINA_A5.largura - 2 * 37.757;
  centrado(capa, e.nome, titulo, tamanhoQueCabe(e.nome, titulo, t.tamanho, larguraUtil), t.primeiraBase, AZUL_DA_CAPA);
  centrado(capa, e.restoDoTitulo, titulo, t.tamanho, t.primeiraBase - t.entrelinha, AZUL_DA_CAPA);
  centrado(capa, e.subtitulo, texto, L.capa.subtitulo.tamanho, L.capa.subtitulo.base, AZUL_DA_CAPA);
  centrado(capa, e.autores, texto, L.capa.autores.tamanho, L.capa.autores.base, AZUL_DA_CAPA);

  // 2. dedicatória, com o varal de bandeirinhas do modelo
  const ded = nova();
  const v = L.dedicatoria.varal;
  ded.drawLine({ start: { x: v.x0, y: v.y }, end: { x: v.x1, y: v.y }, thickness: 1.1, color: PRETO });
  for (let i = 0; i < 7; i++) {
    const x = v.primeiraBandeira + i * v.passo;
    ded.drawSvgPath(`M ${x} ${PAGINA_A5.altura - v.y} L ${x + v.largura} ${PAGINA_A5.altura - v.y} L ${x + v.largura / 2} ${PAGINA_A5.altura - v.ponta} Z`, {
      x: 0,
      y: PAGINA_A5.altura,
      borderColor: PRETO,
      borderWidth: 1.1,
    });
  }
  const para = L.dedicatoria.para;
  quebrarLinhas(`Para ${e.nome}, com carinho de ${e.quemPresenteia}.`, titulo, para.tamanho, para.largura).forEach((linha, i) =>
    centrado(ded, linha, titulo, para.tamanho, para.primeiraBase - i * para.entrelinha),
  );
  const dt = L.dedicatoria.texto;
  quebrarLinhas(e.dedicatoria, texto, dt.tamanho, dt.largura).forEach((linha, i) => centrado(ded, linha, texto, dt.tamanho, dt.primeiraBase - i * dt.entrelinha));

  // 3 a 18. a história: a arte, o texto no rodapé (de cima para baixo) e o número
  const h = L.historia;
  for (const p of e.paginas) {
    const pg = nova();
    pg.drawImage(await imagem(doc, p.imagem), emPontos(p.arte ?? h.arte));
    quebrarLinhas(p.texto, texto, h.texto.tamanho, h.texto.largura).forEach((linha, i) =>
      centrado(pg, linha, texto, h.texto.tamanho, h.texto.primeiraBase - i * h.texto.entrelinha, PRETO, h.texto.x + h.texto.largura / 2),
    );
    centrado(pg, String(p.pagina), texto, h.numero.tamanho, h.numero.base);
  }

  // 19. certificado
  const c = L.certificado;
  const cert = nova();
  cert.drawImage(await imagem(doc, e.certificado.arte), emPontos(c.arte));
  centrado(cert, 'Certificado oficial', titulo, c.titulo.tamanho, c.titulo.base);
  const linhas = quebrarLinhas(e.certificado.linhas, texto, c.texto.tamanho, c.texto.largura);
  linhas.forEach((linha, i) => centrado(cert, linha, texto, c.texto.tamanho, c.texto.primeiraBase - i * c.texto.entrelinha));
  const baseDoSuperpoder = c.texto.primeiraBase - (linhas.length - 1) * c.texto.entrelinha - c.superpoder.distancia;
  centrado(cert, `Superpoder: ${e.certificado.superpoder}.`, titulo, c.superpoder.tamanho, baseDoSuperpoder);
  centrado(cert, 'Desenhe você com o time aqui!', texto, c.desenhe.tamanho, c.desenhe.base);

  // 20. contracapa do modelo
  const modelo = await PDFDocument.load(e.contracapa);
  const [contracapa] = await doc.copyPages(modelo, [0]);
  doc.addPage(contracapa);

  return doc.save();
}
