'use client';

// Guarda de onde a pessoa veio (UTM do anúncio, ref do QR code da contracapa)
// na primeira página que ela abre, para o pedido levar junto. A meta de 10% dos
// pedidos vindos de QR code ou indicação só se mede assim.

import { useEffect } from 'react';
import { CAMPOS_DE_ORIGEM } from '@/lib/origem';

const CHAVE_DA_ORIGEM = 'livrinho:origem';

export function GuardaOrigem() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(CHAVE_DA_ORIGEM)) return;
      const busca = new URLSearchParams(window.location.search);
      const origem: Record<string, string> = {};
      for (const campo of CAMPOS_DE_ORIGEM) {
        const valor = busca.get(campo);
        if (valor) origem[campo] = valor.slice(0, 120);
      }
      if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
        origem.referrer = document.referrer.slice(0, 200);
      }
      sessionStorage.setItem(CHAVE_DA_ORIGEM, JSON.stringify(origem));
    } catch {
      // sem armazenamento, o pedido vai sem origem
    }
  }, []);
  return null;
}

export function lerOrigem(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE_DA_ORIGEM) ?? '{}');
  } catch {
    return {};
  }
}
