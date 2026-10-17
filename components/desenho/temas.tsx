// As ilustrações de cada tema, como listas de formas (ver formas.tsx).
// Personagens próprios: nada parecido com personagem licenciado.
// Todas no mesmo quadro de 240 x 200.

import type { TemaId } from '@/lib/temas';
import { COR, estrela, type Forma } from './formas';

export const QUADRO = { largura: 240, altura: 200 };

const futebol: Forma[] = [
  { el: 'path', a: { d: 'M0 170 Q60 158 120 168 T240 164 L240 204 L0 204 Z' }, cor: COR.verde },
  // gol com rede
  { el: 'rect', a: { x: 150, y: 48, width: 82, height: 80, rx: 3 }, cor: COR.branco, traco: 5 },
  ...[166, 182, 198, 214].map((x): Forma => ({ el: 'line', a: { x1: x, y1: 52, x2: x, y2: 126 }, traco: 1.6 })),
  ...[68, 88, 108].map((y): Forma => ({ el: 'line', a: { x1: 152, y1: y, x2: 230, y2: y }, traco: 1.6 })),
  // cachorrinho craque
  { el: 'path', a: { d: 'M48 138 C30 130 28 112 38 104 C42 116 48 124 56 128 Z' }, cor: COR.caramelo },
  { el: 'rect', a: { x: 58, y: 150, width: 15, height: 26, rx: 7 }, cor: COR.caramelo },
  { el: 'rect', a: { x: 84, y: 150, width: 15, height: 26, rx: 7 }, cor: COR.caramelo },
  { el: 'ellipse', a: { cx: 78, cy: 138, rx: 33, ry: 26 }, cor: COR.laranja },
  { el: 'path', a: { d: 'M66 124 L72 150 M90 124 L84 150' }, cor: null, traco: 2.5 },
  { el: 'circle', a: { cx: 78, cy: 90, r: 30 }, cor: COR.caramelo },
  { el: 'ellipse', a: { cx: 52, cy: 78, rx: 10, ry: 19, transform: 'rotate(25 52 78)' }, cor: COR.marrom },
  { el: 'ellipse', a: { cx: 104, cy: 78, rx: 10, ry: 19, transform: 'rotate(-25 104 78)' }, cor: COR.marrom },
  { el: 'ellipse', a: { cx: 78, cy: 103, rx: 15, ry: 11 }, cor: COR.branco },
  { el: 'ellipse', a: { cx: 78, cy: 97, rx: 6, ry: 4.5 }, cor: COR.grafite },
  { el: 'path', a: { d: 'M71 107 Q78 113 85 107' }, cor: null, traco: 2.5 },
  { el: 'circle', a: { cx: 66, cy: 85, r: 3.8 }, cor: COR.grafite, traco: 1 },
  { el: 'circle', a: { cx: 90, cy: 85, r: 3.8 }, cor: COR.grafite, traco: 1 },
  // bola
  { el: 'circle', a: { cx: 140, cy: 160, r: 18 }, cor: COR.branco },
  { el: 'polygon', a: { points: estrela(140, 160, 7, 7, 5) }, cor: COR.grafite, traco: 2 },
  { el: 'path', a: { d: 'M140 153 L140 143 M147 158 L156 154 M144 166 L150 175 M136 166 L130 175 M133 158 L124 154' }, cor: null, traco: 2 },
];

const natal: Forma[] = [
  { el: 'path', a: { d: 'M0 172 Q60 162 120 170 T240 166 L240 204 L0 204 Z' }, cor: COR.branco },
  { el: 'rect', a: { x: 92, y: 150, width: 22, height: 26, rx: 3 }, cor: COR.marrom },
  { el: 'polygon', a: { points: '103,62 40,156 166,156' }, cor: COR.verde },
  { el: 'polygon', a: { points: '103,44 52,116 154,116' }, cor: COR.verde },
  { el: 'polygon', a: { points: '103,30 66,84 140,84' }, cor: COR.verde },
  { el: 'polygon', a: { points: estrela(103, 28, 15, 7) }, cor: COR.amarelo },
  { el: 'circle', a: { cx: 80, cy: 140, r: 6 }, cor: COR.rosa },
  { el: 'circle', a: { cx: 128, cy: 136, r: 6 }, cor: COR.azul },
  { el: 'circle', a: { cx: 100, cy: 104, r: 6 }, cor: COR.laranja },
  { el: 'circle', a: { cx: 92, cy: 72, r: 5 }, cor: COR.rosa },
  { el: 'circle', a: { cx: 120, cy: 98, r: 5 }, cor: COR.amarelo },
  { el: 'circle', a: { cx: 60, cy: 148, r: 5 }, cor: COR.azul },
  // presentes
  { el: 'rect', a: { x: 150, y: 140, width: 44, height: 36, rx: 3 }, cor: COR.rosa },
  { el: 'rect', a: { x: 146, y: 130, width: 52, height: 13, rx: 3 }, cor: COR.rosa },
  { el: 'rect', a: { x: 168, y: 130, width: 8, height: 46 }, cor: COR.amarelo, traco: 2.5 },
  { el: 'ellipse', a: { cx: 163, cy: 124, rx: 9, ry: 6, transform: 'rotate(-15 163 124)' }, cor: COR.amarelo },
  { el: 'ellipse', a: { cx: 181, cy: 124, rx: 9, ry: 6, transform: 'rotate(15 181 124)' }, cor: COR.amarelo },
  { el: 'rect', a: { x: 198, y: 154, width: 32, height: 22, rx: 3 }, cor: COR.azul },
  { el: 'rect', a: { x: 211, y: 154, width: 6, height: 22 }, cor: COR.amarelo, traco: 2.5 },
  // estrelinhas no céu
  { el: 'polygon', a: { points: estrela(30, 40, 9, 4) }, cor: COR.amarelo, traco: 2.5 },
  { el: 'polygon', a: { points: estrela(200, 38, 8, 3.5) }, cor: COR.amarelo, traco: 2.5 },
  { el: 'polygon', a: { points: estrela(180, 82, 6, 2.6) }, cor: COR.amarelo, traco: 2 },
];

const fundoDoMar: Forma[] = [
  { el: 'path', a: { d: 'M0 176 Q70 166 130 174 T240 170 L240 204 L0 204 Z' }, cor: COR.amarelo },
  { el: 'path', a: { d: 'M30 178 C20 150 40 135 28 110 C38 120 48 140 40 178 Z' }, cor: COR.verde },
  { el: 'path', a: { d: 'M212 178 C204 154 222 140 214 118 C226 130 230 152 222 178 Z' }, cor: COR.verde },
  // baleia
  { el: 'path', a: { d: 'M152 100 C170 92 176 74 190 68 C188 84 186 94 198 102 C184 108 170 106 156 112 Z' }, cor: COR.azul },
  { el: 'path', a: { d: 'M40 100 C40 64 80 48 120 56 C150 62 164 84 160 104 C158 124 132 134 100 134 C66 134 40 124 40 100 Z' }, cor: COR.azul },
  { el: 'path', a: { d: 'M48 110 C70 126 122 130 152 116 C140 128 118 134 98 134 C72 134 54 126 48 110 Z' }, cor: COR.branco },
  { el: 'circle', a: { cx: 72, cy: 92, r: 4 }, cor: COR.grafite, traco: 1 },
  { el: 'path', a: { d: 'M58 104 Q70 112 84 106' }, cor: null, traco: 2.5 },
  { el: 'path', a: { d: 'M94 54 C90 42 82 36 74 38 M94 54 C96 40 104 34 112 36 M94 54 L94 34' }, cor: null, traco: 2.5 },
  // peixinhos
  { el: 'polygon', a: { points: '170,142 156,132 156,152' }, cor: COR.amarelo },
  { el: 'ellipse', a: { cx: 188, cy: 142, rx: 19, ry: 11 }, cor: COR.amarelo },
  { el: 'circle', a: { cx: 197, cy: 139, r: 2.6 }, cor: COR.grafite, traco: 1 },
  { el: 'polygon', a: { points: '50,156 40,148 40,164' }, cor: COR.rosa },
  { el: 'ellipse', a: { cx: 62, cy: 156, rx: 13, ry: 8 }, cor: COR.rosa },
  { el: 'circle', a: { cx: 68, cy: 154, r: 2 }, cor: COR.grafite, traco: 1 },
  // estrela-do-mar e bolhas
  { el: 'polygon', a: { points: estrela(132, 170, 15, 6.5) }, cor: COR.laranja },
  { el: 'circle', a: { cx: 124, cy: 30, r: 6 }, cor: COR.branco, traco: 2.5 },
  { el: 'circle', a: { cx: 136, cy: 16, r: 4 }, cor: COR.branco, traco: 2.5 },
  { el: 'circle', a: { cx: 180, cy: 40, r: 5 }, cor: COR.branco, traco: 2.5 },
];

export const DESENHOS: Record<TemaId, Forma[]> = {
  futebol,
  natal,
  'fundo-do-mar': fundoDoMar,
};

/** Recorte (viewBox) da segunda página de amostra: um detalhe da cena, ampliado. */
export const DETALHE: Record<TemaId, string> = {
  futebol: '22 50 118 132',
  natal: '138 108 98 74',
  'fundo-do-mar': '32 28 170 112',
};
