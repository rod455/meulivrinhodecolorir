// Página interna de amostra: frase com o nome e o desenho só em contorno,
// como a criança vai receber para pintar.

import { comNome, TEMAS, type TemaId } from '@/lib/temas';
import { COR, Desenho, GRAFITE } from './desenho/formas';
import { DESENHOS, DETALHE, QUADRO } from './desenho/temas';

const TEXTO = { fontFamily: 'var(--fonte-texto), system-ui, sans-serif', fontWeight: 800 };

/** Quebra a frase em até 3 linhas de ~`max` letras, sem cortar palavra. */
export function quebrarLinhas(frase: string, max = 22): string[] {
  const linhas: string[] = [];
  let atual = '';
  for (const palavra of frase.split(' ')) {
    if (atual && (atual + ' ' + palavra).length > max) {
      linhas.push(atual);
      atual = palavra;
    } else {
      atual = atual ? `${atual} ${palavra}` : palavra;
    }
  }
  if (atual) linhas.push(atual);
  return linhas.slice(0, 3);
}

export function PaginaAmostra({
  tema,
  nome,
  pagina,
  historia = false,
  className,
}: {
  tema: TemaId;
  nome: string;
  pagina: 1 | 2;
  /** no livrinho presente, a primeira página traz o começo da história */
  historia?: boolean;
  className?: string;
}) {
  const t = TEMAS[tema];
  const quem = nome || 'Nome';
  const frase = historia && pagina === 1 ? comNome(t.historia, quem) : comNome(t.amostras[pagina - 1], quem);
  const linhas = quebrarLinhas(frase, historia && pagina === 1 ? 26 : 22);
  const tamanho = historia && pagina === 1 ? 17 : 21;
  const viewBox = pagina === 1 ? `0 0 ${QUADRO.largura} ${QUADRO.altura}` : DETALHE[tema];
  return (
    <svg viewBox="0 0 296 420" className={className} role="img" aria-label={`Página de amostra: ${frase}`}>
      <rect x={4} y={4} width={288} height={412} rx={8} fill={COR.branco} stroke={GRAFITE} strokeWidth={2} opacity={0.9} />
      {linhas.map((linha, i) => (
        <text key={i} x={148} y={50 + i * (tamanho + 8)} textAnchor="middle" fontSize={tamanho} fill={GRAFITE} style={TEXTO}>
          {linha}
        </text>
      ))}
      <svg x={18} y={130} width={260} height={250} viewBox={viewBox}>
        <Desenho formas={DESENHOS[tema]} modo="traco" traco={pagina === 2 ? 1.3 : 1} />
      </svg>
      <text x={148} y={404} textAnchor="middle" fontSize={11} fill={GRAFITE} opacity={0.6} style={TEXTO}>
        {pagina + 2}
      </text>
    </svg>
  );
}
