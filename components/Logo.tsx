// Logo: um livrinho aberto cujas páginas viram um arco-íris de giz de cera,
// pintado só até a metade (a assinatura "do contorno à cor").

import { COR, GRAFITE } from './desenho/formas';

const ARCOS = [
  { r: 20, cor: COR.laranja },
  { r: 14, cor: COR.azul },
  { r: 8, cor: COR.amarelo },
];

export function SimboloLogo({ tamanho = 44, id = 'logo' }: { tamanho?: number; id?: string }) {
  return (
    <svg width={tamanho} height={(tamanho * 56) / 64} viewBox="0 0 64 56" aria-hidden="true">
      <defs>
        <clipPath id={`metade-${id}`}>
          <path d="M0 0 L38 0 L33 12 L37 22 L31 34 L34 56 L0 56 Z" />
        </clipPath>
      </defs>
      {ARCOS.map(({ r }) => (
        <path key={`t${r}`} d={`M${32 - r} 36 A${r} ${r} 0 0 1 ${32 + r} 36`} fill="none" stroke={GRAFITE} strokeWidth={7.5} strokeLinecap="round" />
      ))}
      {ARCOS.map(({ r }) => (
        <path key={`b${r}`} d={`M${32 - r} 36 A${r} ${r} 0 0 1 ${32 + r} 36`} fill="none" stroke={COR.branco} strokeWidth={3.5} strokeLinecap="round" />
      ))}
      <g clipPath={`url(#metade-${id})`}>
        {ARCOS.map(({ r, cor }) => (
          <path key={`c${r}`} d={`M${32 - r} 36 A${r} ${r} 0 0 1 ${32 + r} 36`} fill="none" stroke={cor} strokeWidth={3.5} strokeLinecap="round" />
        ))}
      </g>
      <path d="M5 36 Q19 31 32 38 L32 53 Q19 46 5 51 Z" fill={COR.branco} stroke={GRAFITE} strokeWidth={3} strokeLinejoin="round" />
      <path d="M59 36 Q45 31 32 38 L32 53 Q45 46 59 51 Z" fill={COR.branco} stroke={GRAFITE} strokeWidth={3} strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ compacto = false }: { compacto?: boolean }) {
  return (
    <span className="logo">
      <SimboloLogo tamanho={compacto ? 36 : 44} />
      <span className="logo-texto">
        <span className="logo-linha1">meu livrinho</span>
        <span className="logo-linha2">de colorir</span>
      </span>
    </span>
  );
}
