'use client';

// Eventos do funil (seção 9): início de personalização, prévia vista,
// checkout e compra. Vão para o GA4 e o Meta Pixel quando estão ligados;
// sem eles, a função não faz nada.

export type Evento =
  | 'clique_criar'
  | 'previa_digitou'
  | 'caminho_escolhido'
  | 'produto_escolhido'
  | 'tema_escolhido'
  | 'personalizacao_iniciada'
  | 'previa_vista'
  | 'checkout_iniciado'
  | 'pedido_enviado';

const NO_PIXEL: Partial<Record<Evento, string>> = {
  personalizacao_iniciada: 'CustomizeProduct',
  checkout_iniciado: 'InitiateCheckout',
  pedido_enviado: 'Lead',
};

type Janela = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
};

export function registrar(evento: Evento, dados: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined') return;
  const w = window as Janela;
  try {
    w.gtag?.('event', evento, dados);
    const doPixel = NO_PIXEL[evento];
    if (doPixel) w.fbq?.('track', doPixel, dados);
  } catch {
    // medição nunca derruba a tela
  }
}
