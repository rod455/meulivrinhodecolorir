// O plano do livro de um pedido: tudo o que o n8n precisa para gerar as imagens
// e montar o PDF, já com as variáveis preenchidas. O site só monta o plano; quem
// chama a API de imagem é o n8n, porque o livro leva minutos e a Vercel corta.
// Puro: conferido por `npm run conferir:personagem`.

import { HISTORIA_BASQUETE } from './historias/basquete.ts';
import { HISTORIA_FUTEBOL } from './historias/futebol.ts';
import { PROMPT_DE_INSERCAO, type HistoriaDaTurma } from './historias/modelo.ts';
import { alturaNaCena, descreverCrianca, promptDaFicha, roupaPropria, SUPERPODERES, type Personagem } from './personagem.ts';
import type { ProdutoId } from './produtos.ts';
import type { TemaId } from './temas.ts';

/** As histórias da turma com vaga para a criança, por tema (o tema precisa de comPersonagem em lib/temas.ts). */
export const HISTORIAS_DA_TURMA: Partial<Record<TemaId, HistoriaDaTurma>> = {
  futebol: HISTORIA_FUTEBOL,
  basquete: HISTORIA_BASQUETE,
};

export type PaginaDoPlano = {
  pagina: number;
  cenaBase: string;
  prompt: string;
  /** texto do rodapé no Livrinho Presente */
  texto: string;
  /** legenda curta na Lembrancinha, ou null se a página não entra nela */
  legenda: string | null;
};

export type PlanoDoLivro = {
  modelo: string;
  titulo: string;
  subtitulo: string;
  /** aprovada: a ficha que a família aprovou antes de pagar; o livro usa ela e não gera outra */
  ficha: { prompt: string; usaFoto: boolean; caminhoDaFoto: string | null; aprovada: { id: string; caminho: string } | null };
  /** publicada: a capa do livro publicado com a criança (o livro automático usa esta quando existe) */
  capa: { cenaBase: string; cenaBaseColorida: string; prompt: string; promptColorido: string; publicada?: { cenaBase: string; prompt: string } };
  paginas: PaginaDoPlano[];
  /** quais páginas entram em cada arquivo do pedido */
  lembrancinha: number[] | null;
  presente: number[] | null;
  certificado: { cenaBase: string; texto: string } | null;
};

export const comNomeNoTexto = (texto: string, nome: string) => texto.replaceAll('{NOME}', nome);

function preencher(modelo: string, valores: Record<string, string>): string {
  return modelo.replace(/\{([A-Z_]+)\}/g, (inteiro, chave: string) => valores[chave] ?? inteiro);
}

export function planoDoLivro(entrada: { tema: TemaId; nome: string; idade: number; produto: ProdutoId; personagem: Personagem }): PlanoDoLivro {
  const { tema, nome, idade, produto, personagem } = entrada;
  const historia = HISTORIAS_DA_TURMA[tema];
  if (!historia) throw new Error(`o tema ${tema} não tem história com personagem`);
  const { paginas: PAGINAS, paginaDaCamisa: PAGINA_DA_CAMISA, roupaDoTime: ROUPA_DO_TIME, capa: CAPA, certificado: CERTIFICADO, lembrancinha: PAGINAS_DA_LEMBRANCINHA } = historia;
  const crianca = descreverCrianca(personagem, idade);
  const altura = alturaNaCena(personagem);

  const paginas = PAGINAS.map((p): PaginaDoPlano => {
    const variante = p.porSuperpoder?.[personagem.superpoder];
    const acao = variante?.acao ?? p.acao;
    const roupa = p.pagina >= PAGINA_DA_CAMISA ? ROUPA_DO_TIME : roupaPropria(personagem);
    return {
      pagina: p.pagina,
      cenaBase: p.cenaBase,
      prompt:
        preencher(PROMPT_DE_INSERCAO, { CHILD_SHORT: crianca, ACTION: acao, AREA: p.area, CHILD_HEIGHT: altura, OUTFIT: roupa }) +
        // a única exceção ao "não mude nada na cena", quando o texto pede
        (variante?.ajusteDaCena ? `\nOne exception to the rule above: ${variante.ajusteDaCena}.` : ''),
      texto: comNomeNoTexto(variante?.texto ?? p.texto, nome),
      legenda: p.lembrancinha ? comNomeNoTexto(p.lembrancinha, nome) : null,
    };
  });

  const promptDaCapa = preencher(PROMPT_DE_INSERCAO, {
    CHILD_SHORT: crianca,
    ACTION: CAPA.acao,
    AREA: CAPA.area,
    CHILD_HEIGHT: altura,
    OUTFIT: ROUPA_DO_TIME,
  })
    // a capa tem arte até embaixo (o título vai em cima): o rodapé branco é só das páginas
    .replace(' Keep the bottom 22% of the page completely white.', '');
  // a capa publicada com a criança (dono, 01/11/2026): o título e os autores são letras da arte,
  // então o prompt pede para não mexer nelas; o nome da criança nunca entra aqui
  const publicada = historia.capaPublicada
    ? {
        cenaBase: historia.capaPublicada.arte,
        prompt: [
          `Add exactly ONE new character to the cover illustration: the child (${crianca}), wearing ${ROUPA_DO_TIME}, ${historia.capaPublicada.acao}. Height: ${altura}. Fully visible, in the same soft crayon-like flat colors and outlines as the cover; color the child exactly as in the color version of the character sheet (skin, hair, eyes).`,
          `Keep EVERYTHING else as it is. These texts must stay identical, letter by letter, in the same place, font and color: ${historia.capaPublicada.textos.map((t) => `"${t}"`).join(', ')}. Do not add any other text.`,
          'Do not move or redraw the other characters more than needed to fit the child. Fill the whole canvas: extend the sky at the top and the ground at the bottom naturally, leaving a little margin above the top text and below the authors\' names.',
        ].join('\n'),
      }
    : undefined;
  const querLembrancinha = produto === 'lembrancinha' || produto === 'combo';
  const querPresente = produto === 'presente' || produto === 'combo';
  const superpoder = SUPERPODERES.find((s) => s.id === personagem.superpoder)!;

  const usadas = new Set<number>([...(querLembrancinha ? PAGINAS_DA_LEMBRANCINHA : []), ...(querPresente ? PAGINAS.map((p) => p.pagina) : [])]);

  return {
    modelo: historia.modelo,
    titulo: comNomeNoTexto(historia.titulo, nome),
    subtitulo: historia.subtitulo,
    ficha: {
      prompt: promptDaFicha(personagem, idade),
      usaFoto: personagem.jeito === 'foto',
      caminhoDaFoto: personagem.foto?.caminho ?? null,
      aprovada: null,
    },
    capa: {
      cenaBase: CAPA.cenaBase,
      cenaBaseColorida: CAPA.cenaBaseColorida,
      prompt: promptDaCapa,
      promptColorido: `${promptDaCapa}\nColor the child exactly as in the color version of the character sheet (skin, hair, eyes); the jersey uses the team colors of the cover.`.replace(
        'no gray, no shading, no color.',
        'same soft crayon-like flat colors as the scene.',
      ),
      publicada,
    },
    // só gera as páginas que algum arquivo do pedido usa
    paginas: paginas.filter((p) => usadas.has(p.pagina)),
    lembrancinha: querLembrancinha ? PAGINAS_DA_LEMBRANCINHA : null,
    presente: querPresente ? PAGINAS.map((p) => p.pagina) : null,
    certificado: querPresente
      ? { cenaBase: CERTIFICADO.cenaBase, texto: comNomeNoTexto(CERTIFICADO.texto, nome).replace('{SUPERPODER_NOME}', superpoder.rotulo) }
      : null,
  };
}
