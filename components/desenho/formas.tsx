// A assinatura da marca, "do contorno à cor": cada ilustração é uma lista de
// formas desenhada duas vezes. Primeiro inteira em branco com contorno (a página
// de colorir); por cima, a versão pintada, recortada por uma borda de giz de cera.
// Como cada camada tem seu próprio branco, uma forma esconde a de trás nas duas.

import type { SVGProps } from 'react';

export const GRAFITE = '#2B2D42';
export const COR = {
  laranja: '#FF8A3D',
  azul: '#4FB3E8',
  amarelo: '#FFD23F',
  verde: '#6CC26A',
  rosa: '#FF7EB6',
  nuvem: '#F1EDE6',
  branco: '#FFFFFF',
  caramelo: '#F4C28B',
  marrom: '#C98A4B',
  grafite: GRAFITE,
} as const;

type Atributos = SVGProps<SVGElement> & Record<string, unknown>;

export type Forma = {
  el: 'circle' | 'ellipse' | 'rect' | 'path' | 'polygon' | 'line';
  a: Atributos;
  /** preenchimento no modo colorido; sem cor = branco; null = só traço, sem preenchimento (redes, sorrisos) */
  cor?: string | null;
  /** espessura do traço; padrão 3.5 */
  traco?: number;
};

export type Modo = 'cor' | 'traco';

export function Desenho({ formas, modo, traco = 1 }: { formas: Forma[]; modo: Modo; traco?: number }) {
  return (
    <>
      {formas.map((f, i) => {
        const Tag = f.el as 'path';
        const soLinha = f.cor === null || f.el === 'line';
        const preenchimento = soLinha ? 'none' : modo === 'cor' ? (f.cor ?? COR.branco) : COR.branco;
        return (
          <Tag
            key={i}
            {...(f.a as SVGProps<SVGPathElement>)}
            fill={preenchimento}
            stroke={GRAFITE}
            strokeWidth={(f.traco ?? 3.5) * traco}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

/** Borda de giz de cera: um zigue-zague irregular na vertical, um pouco inclinado. */
export function bordaDeGiz(largura: number, altura: number, corte: number, semente = 1): string {
  const x0 = largura * corte;
  let caminho = `M -10 -10 L ${x0 + 14} -10`;
  let s = semente;
  const aleatorio = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let y = 0; y <= altura + 10; y += 7) {
    const inclinacao = (y / altura) * -28;
    const x = x0 + inclinacao + (aleatorio() - 0.5) * 12;
    caminho += ` L ${x.toFixed(1)} ${y}`;
  }
  caminho += ` L -10 ${altura + 10} Z`;
  return caminho;
}

/**
 * A ilustração parte colorida e parte em contorno, como um desenho sendo pintado.
 * `corte` é a fração da largura onde a cor termina (0 = tudo contorno, 1 = tudo cor).
 */
export function DoContornoACor({
  id,
  formas,
  largura,
  altura,
  corte = 0.55,
  traco = 1,
  semente = 7,
}: {
  id: string;
  formas: Forma[];
  largura: number;
  altura: number;
  corte?: number;
  traco?: number;
  semente?: number;
}) {
  const recorte = `giz-${id}`;
  return (
    <>
      <defs>
        <clipPath id={recorte}>
          <path d={bordaDeGiz(largura, altura, corte, semente)} />
        </clipPath>
      </defs>
      <Desenho formas={formas} modo="traco" traco={traco} />
      {corte > 0 && (
        <g clipPath={`url(#${recorte})`}>
          <Desenho formas={formas} modo="cor" traco={traco} />
        </g>
      )}
    </>
  );
}

/** Pontos de uma estrela de `n` pontas, para `polygon`. */
export function estrela(cx: number, cy: number, raioFora: number, raioDentro: number, n = 5): string {
  const pontos: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? raioFora : raioDentro;
    const ang = (Math.PI / n) * i - Math.PI / 2;
    pontos.push(`${(cx + r * Math.cos(ang)).toFixed(1)},${(cy + r * Math.sin(ang)).toFixed(1)}`);
  }
  return pontos.join(' ');
}
