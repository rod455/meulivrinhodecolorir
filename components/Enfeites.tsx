// Rabiscos de giz de cera, estrelinhas e confete (seção 6.6 da marca).

import { COR, estrela, GRAFITE } from './desenho/formas';

/** Sublinhado de giz embaixo de uma palavra. */
export function Grifo({ children, cor = COR.amarelo }: { children: React.ReactNode; cor?: string }) {
  return (
    <span className="grifo">
      {children}
      <svg viewBox="0 0 200 16" preserveAspectRatio="none" aria-hidden="true">
        <path d="M3 10 C40 4 80 13 120 7 C150 3 176 9 197 6" fill="none" stroke={cor} strokeWidth={7} strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** Frase curta de rabisco (a assinatura da marca, por exemplo), em Baloo 2 sobre grifo amarelo (docs/identidade-visual.md seção 6). */
export function ALapis({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`a-lapis ${className}`}>{children}</span>;
}

export function GizDeCera({ cor, className, rotacao = 0 }: { cor: string; className?: string; rotacao?: number }) {
  return (
    <svg viewBox="0 0 120 26" className={className} style={{ transform: `rotate(${rotacao}deg)` }} aria-hidden="true">
      <path d="M22 4 L104 4 Q110 4 110 10 L110 16 Q110 22 104 22 L22 22 Z" fill={cor} stroke={GRAFITE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M22 4 L6 11 Q3 13 6 15 L22 22 Z" fill={cor} stroke={GRAFITE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M40 4 L40 22 M90 4 L90 22" stroke={GRAFITE} strokeWidth={2} />
      <path d="M48 10 L82 10 M48 16 L74 16" stroke={COR.branco} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
    </svg>
  );
}

export function Estrelinha({ cor = COR.amarelo, tamanho = 22, className }: { cor?: string; tamanho?: number; className?: string }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points={estrela(12, 12, 10.5, 4.6)} fill={cor} stroke={GRAFITE} strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  );
}

const PONTOS = [
  { x: 6, y: 12, c: COR.rosa, r: 5 },
  { x: 3, y: 90, c: COR.azul, r: 4 },
  { x: 88, y: 8, c: COR.verde, r: 4 },
  { x: 94, y: 64, c: COR.amarelo, r: 6 },
  { x: 52, y: 92, c: COR.laranja, r: 4 },
  { x: 72, y: 30, c: COR.rosa, r: 3 },
];

/** Pontinhos de confete espalhados no fundo de um bloco (posição em %). */
export function Confete({ className = '' }: { className?: string }) {
  return (
    <div className={`confete ${className}`} aria-hidden="true">
      {PONTOS.map((p, i) => (
        <span key={i} style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.r * 2, height: p.r * 2, background: p.c }} />
      ))}
    </div>
  );
}
