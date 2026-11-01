// O livro automático (dono, 01/11/2026): do pedido pago ao PDF que o dono revisa.
// Aqui fica só o que é puro: quais imagens a OpenAI desenha, com que prompt, como a
// montagem recebe os dados e o texto dos e-mails. Banco e arquivos ficam em
// lib/servidor/livros.ts; as rotas em app/api/livro/.
// Conferido por `npm run conferir:livro`.

import { HISTORIAS_DA_TURMA, type PlanoDoLivro } from './geracao.ts';
import type { EntradaDoLivro } from './livro-pdf.ts';
import type { TemaId } from './temas.ts';

/** Quem revisa o livro antes de a família receber (decisão do dono, 01/11/2026). */
export const EMAIL_DO_DONO = 'appfactory.rlm@gmail.com';

/** O tamanho e a qualidade das páginas: os mesmos do teste aprovado (página 4 do basquete). */
export const PEDIDO_DA_PAGINA = { tamanho: '1024x1536', qualidade: 'medium' } as const;

/** Quanto da cena gerada entra além da área da criança, para braços e bola que passam da caixa. */
export const FOLGA_DA_AREA = 60;

type Caixa = { x: number; y: number; largura: number; altura: number };

export type LivroDoTema = {
  /** a contracapa do modelo do dono, em assets/ */
  contracapa: string;
  linhasDoCertificado: string;
  dedicatoriaPadrao: string;
  quemPresenteia: string;
  autores: string;
  /** páginas com a arte numa caixa diferente da padrão (a 13 do basquete ganhou margem) */
  artePorPagina: Record<number, Caixa>;
};

/** Os temas cujo livro já sai sozinho: só os que têm o modelo A5 do dono em assets/. */
export const LIVROS_AUTOMATICOS: Partial<Record<TemaId, LivroDoTema>> = {
  basquete: {
    contracapa: 'temas/basquete/contracapa.pdf',
    linhasDoCertificado: '{NOME} faz parte do Time Little Paws de basquete!',
    dedicatoriaPadrao: 'Que cada passe seja uma amizade e cada tentativa, uma nova aventura!',
    quemPresenteia: 'sua família',
    autores: 'Rodrigo Moraes & Luana David',
    artePorPagina: { 13: { x: 39.685, y: 85.039, largura: 340.158, altura: 510.236 } },
  },
};

export const chaveDaPagina = (n: number) => `p${String(n).padStart(2, '0')}`;

export type ItemDoLivro = {
  /** "capa" ou "p01" a "p16": também o nome do arquivo no bucket paginas */
  chave: string;
  prompt: string;
  /** a cena base, em assets/ */
  cena: string;
  /** onde a criança entra, em pixels da cena (é o que o prompt diz) */
  area: [number, number, number, number];
  /** o que a trava deixa vir da OpenAI: a área da criança e, se a página pede um ajuste na cena, o lugar do ajuste */
  trava: [number, number, number, number];
};

const juntar = (a: [number, number, number, number], b?: [number, number, number, number]): [number, number, number, number] => {
  if (!b) return a;
  const x = Math.min(a[0], b[0]);
  const y = Math.min(a[1], b[1]);
  return [x, y, Math.max(a[0] + a[2], b[0] + b[2]) - x, Math.max(a[1] + a[3], b[1] + b[3]) - y];
};

const pct = (v: number, total: number) => Math.round((100 * v) / total);

function comOrdemEArea(prompt: string, area: [number, number, number, number], ficha: 'contorno' | 'colorida'): string {
  const [x, y, w, h] = area;
  return [
    `The FIRST attached image is the base scene to edit. The SECOND attached image is the approved character sheet of the child (use the ${ficha === 'contorno' ? 'black line-art version on its right' : 'colored version on its left'}).`,
    prompt,
    `The empty area is roughly from ${pct(x, 1024)}% to ${pct(x + w, 1024)}% of the width (from the left) and from ${pct(y, 1536)}% to ${pct(y + h, 1536)}% of the height (from the top). Keep the child inside it.`,
  ].join('\n');
}

/**
 * O que a OpenAI desenha neste livro: a capa e as páginas do Presente, menos as que
 * já estão prontas (para refazer só o que falhou). O prompt é o do plano, gravado no
 * pedido; aqui só entram a ordem das imagens e a área em porcentagem.
 */
export function itensDoLivro(tema: TemaId, plano: PlanoDoLivro, prontas: readonly string[] = []): ItemDoLivro[] {
  const historia = HISTORIAS_DA_TURMA[tema];
  if (!historia || !LIVROS_AUTOMATICOS[tema]) return [];
  const itens: ItemDoLivro[] = [];
  const areaDaCapa = historia.capa.areaPx;
  if (areaDaCapa) itens.push({ chave: 'capa', cena: historia.capa.cenaBaseColorida, area: areaDaCapa, trava: areaDaCapa, prompt: comOrdemEArea(plano.capa.promptColorido, areaDaCapa, 'colorida') });
  for (const n of plano.presente ?? []) {
    const pg = plano.paginas.find((p) => p.pagina === n);
    const daHistoria = historia.paginas.find((p) => p.pagina === n);
    const area = daHistoria?.areaPx;
    if (!pg || !area) continue;
    // a variante do superpoder que mexe na cena (o Pip rindo) vem gravada no prompt do plano
    const ajuste = Object.values(daHistoria.porSuperpoder ?? {}).find((v) => v.ajusteDaCena && pg.prompt.includes(v.ajusteDaCena));
    itens.push({ chave: chaveDaPagina(n), cena: pg.cenaBase, area, trava: juntar(area, ajuste?.areaDoAjustePx), prompt: comOrdemEArea(pg.prompt, area, 'contorno') });
  }
  return itens.filter((i) => !prontas.includes(i.chave));
}

/** Todas as chaves que o livro precisa para montar. */
export const chavesDoLivro = (tema: TemaId, plano: PlanoDoLivro) => itensDoLivro(tema, plano).map((i) => i.chave);

/** A área da criança com folga, dentro da cena: é dela que a página gerada é recortada. */
export function areaComFolga(area: [number, number, number, number], folga = FOLGA_DA_AREA, largura = 1024, altura = 1536) {
  const [x, y, w, h] = area;
  const left = Math.max(0, x - folga);
  const top = Math.max(0, y - folga);
  return { left, top, width: Math.min(largura, x + w + folga) - left, height: Math.min(altura, y + h + folga) - top };
}

/** Monta a entrada do PDF a partir do plano gravado no pedido e das imagens já com a criança. */
export function entradaDoLivro(
  tema: TemaId,
  plano: PlanoDoLivro,
  dados: { nome: string; dedicatoria: string | null; superpoder: string },
  arquivos: { imagem: (chave: string) => Uint8Array; asset: (caminho: string) => Uint8Array },
): EntradaDoLivro {
  const historia = HISTORIAS_DA_TURMA[tema]!;
  const livro = LIVROS_AUTOMATICOS[tema]!;
  const comNome = (t: string) => t.replaceAll('{NOME}', dados.nome);
  return {
    nome: dados.nome,
    restoDoTitulo: historia.titulo.replace('{NOME}', '').trim(),
    subtitulo: historia.subtitulo,
    autores: livro.autores,
    quemPresenteia: livro.quemPresenteia,
    dedicatoria: dados.dedicatoria?.trim() || livro.dedicatoriaPadrao,
    capa: arquivos.imagem('capa'),
    paginas: (plano.presente ?? []).map((n) => ({
      pagina: n,
      imagem: arquivos.imagem(chaveDaPagina(n)),
      texto: plano.paginas.find((p) => p.pagina === n)!.texto,
      arte: livro.artePorPagina[n],
    })),
    certificado: { arte: arquivos.asset(historia.certificado.cenaBase), linhas: comNome(livro.linhasDoCertificado), superpoder: dados.superpoder },
    contracapa: arquivos.asset(livro.contracapa),
    fontes: { titulo: arquivos.asset('livro/fontes/Baloo2-Bold.woff'), texto: arquivos.asset('livro/fontes/NunitoSans-Regular.woff') },
  };
}

export type Email = { para: string; assunto: string; texto: string };

const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0] ?? '';

export function emailDeRevisao(d: { nome: string; tituloDoLivro: string; pedidoId: string; linkDeRevisao: string }): Email {
  return {
    para: EMAIL_DO_DONO,
    assunto: `Livro pronto para revisar: ${d.tituloDoLivro}`,
    texto: [
      `O livro "${d.tituloDoLivro}" ficou pronto e está esperando a sua revisão.`,
      '',
      `Abra o PDF e, se estiver tudo certo, libere para a família por aqui:`,
      d.linkDeRevisao,
      '',
      'A família só recebe depois que você liberar. Se alguma página não ficou boa, na mesma tela dá para pedir o livro de novo.',
      '',
      `Pedido: ${d.pedidoId}`,
    ].join('\n'),
  };
}

export function emailDeFalha(d: { nome: string; pedidoId: string; faltando: string[]; erro: string; linkDeRevisao: string }): Email {
  return {
    para: EMAIL_DO_DONO,
    assunto: `O livro de ${d.nome} não ficou pronto`,
    texto: [
      `A geração do livro de ${d.nome} parou antes do fim e nada foi enviado à família.`,
      '',
      d.faltando.length ? `Faltaram: ${d.faltando.join(', ')}.` : '',
      d.erro ? `O que o sistema anotou: ${d.erro}` : '',
      '',
      'Para tentar de novo (só as páginas que faltaram são refeitas):',
      d.linkDeRevisao,
      '',
      `Pedido: ${d.pedidoId}`,
    ]
      .filter((l, i, todas) => l !== '' || todas[i - 1] !== '')
      .join('\n'),
  };
}

export function emailParaFamilia(d: { para: string; responsavel: string; nome: string; linkDaConta: string }): Email {
  const quem = primeiroNome(d.responsavel);
  return {
    para: d.para,
    assunto: `O livrinho de ${d.nome} está pronto!`,
    texto: [
      `Oi${quem ? `, ${quem}` : ''}!`,
      '',
      `O livrinho de ${d.nome} ficou pronto. Para baixar o PDF, entre na sua conta:`,
      d.linkDaConta,
      '',
      'Dá para imprimir em casa, em folhas A5 ou A4, quantas vezes quiser.',
      '',
      'Esperamos que vocês se divirtam pintando juntos!',
      'Meu Livrinho de Colorir',
    ].join('\n'),
  };
}
