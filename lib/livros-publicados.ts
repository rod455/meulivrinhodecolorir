// Os livros da turma Little Paws já publicados na Amazon (KDP), em inglês:
// mostram na LP que a turma tem histórias de verdade, e dão um empurrão para
// o inglês desde cedo (pedido do dono, 26/10/2026). Fonte das histórias:
// livros-fonte/ (README, com o status de cada um).
//
// Cada edição (ilustrado, de colorir) se vende de três jeitos (dono, 26/10):
// Kindle, direto na Amazon internacional; impresso sob medida, R$ 79,90; e PDF
// para imprimir em casa, R$ 29,90. Preço é decisão do dono: mudar só com ele.
// Puro: conferido por `npm run conferir:turma`.

export const PRECO_DO_FORMATO = { impresso: 7990, pdf: 2990 } as const;
export type FormatoDaTurma = keyof typeof PRECO_DO_FORMATO;
export const ROTULO_DO_FORMATO: Record<FormatoDaTurma, string> = { impresso: 'Impresso sob medida', pdf: 'PDF para imprimir em casa' };

export type Edicao = {
  /** id estável, vai para o pedido */
  id: string;
  tipo: 'Livro ilustrado' | 'Livro de colorir' | 'Livro de colorir e atividades';
  /** caminho em public/, a capa de verdade; null até o dono mandar o arquivo original */
  capa: { src: string; largura: number; altura: number } | null;
  /** página do Kindle na Amazon internacional; só os ilustrados têm */
  kindle: string | null;
};

export type LivroPublicado = {
  id: string;
  titulo: string;
  subtitulo: string | null;
  /** o que a criança vive na história, em português */
  historia: string;
  edicoes: Edicao[];
};

export const LIVROS_PUBLICADOS: LivroPublicado[] = [
  {
    id: 'big-game',
    titulo: 'Little Paws, Big Game',
    subtitulo: 'A Story About Teamwork',
    historia:
      'No basquete, Pip quer fazer a cesta decisiva sozinho. Descobrindo o que cada amigo faz de melhor, aprende a jogar em equipe, e o time termina unido, ganhando ou perdendo.',
    edicoes: [
      { id: 'big-game-ilustrado', tipo: 'Livro ilustrado', capa: null, kindle: 'https://www.amazon.com/dp/B0HKW6ZHSD' },
      { id: 'big-game-colorir', tipo: 'Livro de colorir', capa: null, kindle: null },
    ],
  },
  {
    id: 'big-play',
    titulo: 'Little Paws, Big Play',
    subtitulo: 'A Story About Gentle Strength',
    historia:
      'Bo é o maior do time, mas no flag football ninguém derruba ninguém: é preciso puxar a bandeirinha com jeito. Com a ajuda dos amigos e da Vovó Ursa, ele descobre o que é força de verdade.',
    edicoes: [
      { id: 'big-play-ilustrado', tipo: 'Livro ilustrado', capa: null, kindle: 'https://www.amazon.com/dp/B0HMHXCS84' },
      { id: 'big-play-colorir', tipo: 'Livro de colorir', capa: null, kindle: null },
    ],
  },
  {
    id: 'big-christmas',
    titulo: 'Little Paws, Big Christmas',
    subtitulo: 'A Christmas Story About Patience',
    historia:
      'Dot é a mais devagar da turma e pede ao Papai Noel para ser rápida. Mas, quando o vento leva a estrela da árvore de Natal, é ela quem para, olha com calma e encontra o caminho.',
    edicoes: [
      { id: 'big-christmas-ilustrado', tipo: 'Livro ilustrado', capa: null, kindle: 'https://www.amazon.com/dp/B0HNP3RTXB' },
      { id: 'big-christmas-colorir', tipo: 'Livro de colorir e atividades', capa: null, kindle: null },
    ],
  },
];

/** Só Kindle da Amazon, no formato amazon.*\/dp/ASIN: o que vai para a LP nunca aponta para outro lugar. */
export const linkValido = (link: string): boolean => /^https:\/\/(www\.)?amazon\.[a-z.]+\/dp\/[A-Z0-9]{10}$/.test(link);

export function acharEdicao(id: unknown): { livro: LivroPublicado; edicao: Edicao } | null {
  for (const livro of LIVROS_PUBLICADOS) {
    const edicao = livro.edicoes.find((e) => e.id === id);
    if (edicao) return { livro, edicao };
  }
  return null;
}

export const ehFormatoDaTurma = (f: unknown): f is FormatoDaTurma => f === 'impresso' || f === 'pdf';

export type Endereco = { cep: string; rua: string; numero: string; complemento: string; bairro: string; cidade: string; uf: string };
export type PedidoDaTurma = { edicao: string; formato: FormatoDaTurma; precoCentavos: number; responsavel: string; whatsapp: string; endereco: Endereco | null };
export type ErrosDaTurma = Partial<Record<'edicao' | 'formato' | 'responsavel' | 'whatsapp' | keyof Endereco, string>>;

const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '');

/**
 * Lê o pedido que veio do navegador. O preço nunca vem de lá: sai daqui, pelo
 * formato. Endereço só no impresso; no PDF, mesmo se vier, é descartado.
 */
export function lerPedidoDaTurma(entrada: unknown): { ok: true; pedido: PedidoDaTurma } | { ok: false; erros: ErrosDaTurma } {
  const e = (entrada && typeof entrada === 'object' ? entrada : {}) as Record<string, unknown>;
  const erros: ErrosDaTurma = {};
  const achado = acharEdicao(e.edicao);
  if (!achado) erros.edicao = 'Escolha o livro.';
  const formato = ehFormatoDaTurma(e.formato) ? e.formato : null;
  if (!formato) erros.formato = 'Escolha impresso ou PDF.';
  const responsavel = texto(e.responsavel, 80);
  if (responsavel.length < 2) erros.responsavel = 'Digite seu nome.';
  const digitos = typeof e.whatsapp === 'string' ? e.whatsapp.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '') : '';
  if (!/^\d{2}9?\d{8}$/.test(digitos)) erros.whatsapp = 'Confira o WhatsApp, com DDD.';

  let endereco: Endereco | null = null;
  if (formato === 'impresso') {
    const d = (e.endereco && typeof e.endereco === 'object' ? e.endereco : {}) as Record<string, unknown>;
    endereco = {
      cep: typeof d.cep === 'string' ? d.cep.replace(/\D/g, '') : '',
      rua: texto(d.rua, 120),
      numero: texto(d.numero, 12),
      complemento: texto(d.complemento, 60),
      bairro: texto(d.bairro, 60),
      cidade: texto(d.cidade, 60),
      uf: texto(d.uf, 2).toUpperCase(),
    };
    if (!/^\d{8}$/.test(endereco.cep)) erros.cep = 'O CEP tem 8 números.';
    if (!endereco.rua) erros.rua = 'Digite a rua.';
    if (!endereco.numero) erros.numero = 'Digite o número (ou "s/n").';
    if (!endereco.bairro) erros.bairro = 'Digite o bairro.';
    if (!endereco.cidade) erros.cidade = 'Digite a cidade.';
    if (!UFS.includes(endereco.uf)) erros.uf = 'Escolha o estado.';
  }

  if (Object.keys(erros).length > 0 || !achado || !formato) return { ok: false, erros };
  return {
    ok: true,
    pedido: { edicao: achado.edicao.id, formato, precoCentavos: PRECO_DO_FORMATO[formato], responsavel, whatsapp: `55${digitos}`, endereco },
  };
}

export const UFS_DO_BRASIL = UFS;
