// A capa do livrinho em SVG, no formato A5 (148 x 210 vira 296 x 420).
// É a mesma capa da prévia ao vivo, da vitrine e do hero: um desenho só.

import { fonteDoNome, FONTE_MINIMA } from '@/lib/nome';
import type { ProdutoId } from '@/lib/produtos';
import { TEMAS, type TemaId } from '@/lib/temas';
import { DoContornoACor, GRAFITE, COR } from './desenho/formas';
import { DESENHOS, QUADRO } from './desenho/temas';

const TITULO = { fontFamily: 'var(--fonte-titulo), system-ui, sans-serif', fontWeight: 800 };
const TEXTO = { fontFamily: 'var(--fonte-texto), system-ui, sans-serif', fontWeight: 800 };

export function NomeNaCapa({ nome, y, max }: { nome: string; y: number; max?: number }) {
  const vazio = !nome;
  const mostrado = vazio ? 'Nome' : nome;
  const calculado = fonteDoNome(mostrado);
  const tamanho = Math.min(calculado ?? FONTE_MINIMA, max ?? Infinity);
  return (
    <text
      x={148}
      y={y}
      textAnchor="middle"
      fontSize={tamanho}
      fill={GRAFITE}
      opacity={vazio ? 0.25 : 1}
      style={TITULO}
      {...(calculado === null ? { textLength: 260, lengthAdjust: 'spacingAndGlyphs' } : {})}
    >
      {mostrado}
    </text>
  );
}

export function CapaLivrinho({
  id,
  tema,
  produto,
  nome,
  idade,
  corte = 0.55,
  className,
}: {
  id: string;
  tema: TemaId;
  produto: ProdutoId;
  nome: string;
  idade: number;
  corte?: number;
  className?: string;
}) {
  const presente = produto === 'presente';
  const t = TEMAS[tema];
  const rotulo = presente ? `Livrinho de ${nome || 'Nome'}, tema ${t.nome}` : `Capa: Festa de ${nome || 'Nome'}, ${idade} anos, tema ${t.nome}`;
  return (
    <svg viewBox="0 0 296 420" className={className} role="img" aria-label={rotulo}>
      <rect x={4} y={4} width={288} height={412} rx={14} fill={COR.branco} stroke={GRAFITE} strokeWidth={5} />
      {presente ? (
        <>
          <NomeNaCapa nome={nome} y={96} />
          <text x={148} y={130} textAnchor="middle" fontSize={16} fill={GRAFITE} style={TEXTO}>
            {t.tituloDaHistoria}
          </text>
          <g transform="translate(28 152)">
            <DoContornoACor id={`${id}-capa`} formas={DESENHOS[tema]} {...QUADRO} corte={corte} />
          </g>
        </>
      ) : (
        <>
          <text x={148} y={50} textAnchor="middle" fontSize={22} fill={GRAFITE} style={TEXTO}>
            Festa de
          </text>
          <NomeNaCapa nome={nome} y={108} />
          <rect x={106} y={124} width={84} height={34} rx={17} fill={COR.amarelo} stroke={GRAFITE} strokeWidth={3} />
          <text x={148} y={148} textAnchor="middle" fontSize={20} fill={GRAFITE} style={TITULO}>
            {idade} {idade === 1 ? 'ano' : 'anos'}
          </text>
          <g transform="translate(28 180)">
            <DoContornoACor id={`${id}-capa`} formas={DESENHOS[tema]} {...QUADRO} corte={corte} />
          </g>
        </>
      )}
      <text x={148} y={402} textAnchor="middle" fontSize={11} fill={GRAFITE} opacity={0.7} style={TEXTO}>
        {presente ? 'um livrinho de colorir só seu' : 'meulivrinhodecolorir.com.br'}
      </text>
    </svg>
  );
}
