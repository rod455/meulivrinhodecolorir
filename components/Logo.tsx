// Logo do kit de marca Ateliê de Rabiscos (docs/identidade-visual.md seção 4).
// É imagem raster do kit: nunca redigitar o lettering. Originais em docs/artes/marca.

import Image from 'next/image';

/** Assinatura horizontal; `escuro` usa a versão sobre grafite, para o rodapé. */
export function Logo({ escuro = false, largura = 170 }: { escuro?: boolean; largura?: number }) {
  return (
    <Image
      src={escuro ? '/marca/logo-escuro.webp' : '/marca/logo.webp'}
      alt="meu livrinho de colorir"
      width={largura}
      height={Math.round((largura * 255) / 640)}
      className="logo-imagem"
      priority={!escuro}
    />
  );
}
