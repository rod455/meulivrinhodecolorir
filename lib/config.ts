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

/**
 * O endereço e a chave anon do Supabase são públicos por natureza: vão para o
 * navegador de qualquer visitante e só abrem o que as políticas de RLS deixam.
 * A chave de serviço, que abre tudo, mora só na Vercel (SUPABASE_SERVICE_ROLE_KEY).
 */
export const SUPABASE_PUBLICO = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nkqxydwnarxjfypbeqji.supabase.co',
  chave:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcXh5ZHduYXJ4amZ5cGJlcWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMDAxODEsImV4cCI6MjEwNzg3NjE4MX0.mnG3qqgwSPIDIZ8akq-bU4mYscIeH8IaVRCsWj0_jCM',
};
