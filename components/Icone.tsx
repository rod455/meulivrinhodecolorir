// Ícones de traço simples para as listas da conta. Desenhados aqui, sem
// biblioteca: são poucos e herdam a cor do texto (currentColor).

const CAMINHOS = {
  livro: 'M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5C4.7 20 4 19.3 4 18.5v-13ZM13 4h5.5c.8 0 1.5.7 1.5 1.5v13c0 .8-.7 1.5-1.5 1.5H13V4Z',
  baixar: 'M12 4v11m0 0-4-4m4 4 4-4M5 19h14',
  cadeado: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9Z',
  envelope: 'M4 6h16v12H4V6Zm0 0 8 7 8-7',
  foto: 'M4 7h4l2-2h4l2 2h4v12H4V7Zm8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  sair: 'M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10',
  alerta: 'M12 4 3 20h18L12 4Zm0 6v4m0 3v.5',
  conversa: 'M5 5h14v10H9l-4 4V5Z',
  ajuda: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-2.5-11.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6m0 3v.5',
  escudo: 'M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6l-7-3Z',
  documento: 'M7 3h7l4 4v14H7V3Zm7 0v4h4M10 12h5M10 16h5',
  seta: 'm9 6 6 6-6 6',
  mais: 'M12 5v14M5 12h14',
  certo: 'm5 12.5 4.5 4.5L19 7.5',
  coracao: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
} as const;

export type NomeDoIcone = keyof typeof CAMINHOS;

export function Icone({ nome, tamanho = 20 }: { nome: NomeDoIcone; tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={CAMINHOS[nome]} />
    </svg>
  );
}
