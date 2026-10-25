// A marca d'água da prévia da ficha, desenhada em traços e não em texto. Na
// Vercel não há fonte nenhuma para o SVG do sharp, e um <text> sai como
// fileiras de quadradinhos (a primeira ficha real, 25/10/2026). Com as letras
// em traço, o desenho é o mesmo em qualquer máquina. Puro: conferido por
// `npm run conferir:ficha`.

export const FRASE_DA_MARCA = 'PRÉVIA · MEU LIVRINHO DE COLORIR · ';

// cada letra numa grade de 4 de largura por 6 de altura, y para baixo
const LETRAS: Record<string, string> = {
  P: 'M0 6L0 0L3 0L4 1L4 2L3 3L0 3',
  R: 'M0 6L0 0L3 0L4 1L4 2L3 3L0 3M2 3L4 6',
  E: 'M4 0L0 0L0 6L4 6M0 3L3 3',
  É: 'M4 0L0 0L0 6L4 6M0 3L3 3M1.5 -1L3 -2.2',
  V: 'M0 0L2 6L4 0',
  I: 'M2 0L2 6M1 0L3 0M1 6L3 6',
  A: 'M0 6L2 0L4 6M0.7 4L3.3 4',
  M: 'M0 6L0 0L2 3L4 0L4 6',
  U: 'M0 0L0 5L1 6L3 6L4 5L4 0',
  L: 'M0 0L0 6L4 6',
  N: 'M0 6L0 0L4 6L4 0',
  H: 'M0 0L0 6M4 0L4 6M0 3L4 3',
  O: 'M1 0L3 0L4 1L4 5L3 6L1 6L0 5L0 1Z',
  D: 'M0 0L0 6L3 6L4 5L4 1L3 0Z',
  C: 'M4 1L3 0L1 0L0 1L0 5L1 6L3 6L4 5',
  '·': 'M1.7 3L2.3 3',
  ' ': '',
};
const AVANCO = 6;

/** Uma linha de texto em traços, a partir de (x, y) no canto de cima, com a altura de letra pedida. */
export function tracosDoTexto(texto: string, x: number, y: number, altura: number): string {
  const escala = altura / 6;
  return Array.from(texto)
    .map((letra, i) => {
      const caminho = LETRAS[letra];
      if (caminho === undefined) throw new Error(`a marca d'água não tem a letra "${letra}"`);
      if (!caminho) return '';
      const dx = x + i * AVANCO * escala;
      return `<path transform="translate(${dx.toFixed(1)} ${y}) scale(${escala.toFixed(3)})" d="${caminho}"/>`;
    })
    .join('');
}

/** O SVG da marca para uma imagem de largura por altura: a frase repetida em linhas na diagonal. */
export function svgDaMarca(largura: number, altura: number): string {
  const frase = FRASE_DA_MARCA.repeat(5);
  const linhas = Array.from({ length: Math.ceil((altura * 3) / 90) }, (_, i) => tracosDoTexto(frase, -largura, -altura + i * 90, 17)).join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}">` +
    `<g transform="rotate(-24 ${largura / 2} ${altura / 2})" fill="none" stroke="#2B2D42" stroke-opacity="0.26" stroke-width="0.85" stroke-linecap="round" stroke-linejoin="round">` +
    `${linhas}</g></svg>`
  );
}
