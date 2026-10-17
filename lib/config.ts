// Dados públicos do negócio. Ficam vazios até o dono preencher na Vercel;
// cada tela esconde o que não tem em vez de mostrar dado inventado.

export const SITE = {
  url: 'https://meulivrinhodecolorir.com.br',
  nome: 'Meu Livrinho de Colorir',
  /** só dígitos, com 55 e DDD */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? '',
  email: process.env.NEXT_PUBLIC_EMAIL_CONTATO ?? '',
  cnpj: process.env.NEXT_PUBLIC_CNPJ ?? '',
  razaoSocial: process.env.NEXT_PUBLIC_RAZAO_SOCIAL ?? '',
};

export function linkDoWhatsapp(texto: string): string | null {
  if (!SITE.whatsapp) return null;
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(texto)}`;
}

/** Prova social: só liga depois das primeiras vendas, com número real. */
export const FAMILIAS_ATENDIDAS: number | null = null;
