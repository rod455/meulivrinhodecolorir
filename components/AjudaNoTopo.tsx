'use client';

// O "?" no topo, ao lado do "Entrar" (dono, 02/11/2026): no celular, nas telas do
// pedido, o "?" flutuante cobria o campo em que a família digita. Ele abre o mesmo
// "Fale direto com a gente" do BotaoAjuda; o CSS decide qual dos dois aparece.

import { ABRIR_AJUDA_DO_TOPO } from './BotaoAjuda';

export function AjudaNoTopo() {
  return (
    <button type="button" className="ajuda-no-topo" aria-label="Fale com a gente" onClick={() => window.dispatchEvent(new Event(ABRIR_AJUDA_DO_TOPO))}>
      ?
    </button>
  );
}
