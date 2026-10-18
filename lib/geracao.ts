// O plano do livro de um pedido: tudo o que o n8n precisa para gerar as imagens
// e montar o PDF, já com as variáveis preenchidas. O site só monta o plano; quem
// chama a API de imagem é o n8n, porque o livro leva minutos e a Vercel corta.
// Puro: conferido por `npm run conferir:personagem`.

import {
  CAPA,
  CERTIFICADO,
  ID_DO_MODELO,
  PAGINA_DA_CAMISA,
  PAGINAS,
  PAGINAS_DA_LEMBRANCINHA,
  PROMPT_DE_INSERCAO,
  SUBTITULO,
  TITULO,
} from './historias/futebol.ts';
import { alturaNaCena, descreverCrianca, promptDaFicha, ROUPA_DO_TIME, roupaPropria, SUPERPODERES, type Personagem } from './personagem.ts';
import type { ProdutoId } from './produtos.ts';

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
  ficha: { prompt: string; usaFoto: boolean; caminhoDaFoto: string | null };
  capa: { cenaBase: string; cenaBaseColorida: string; prompt: string; promptColorido: string };
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

export function planoDoLivro(entrada: { nome: string; idade: number; produto: ProdutoId; personagem: Personagem }): PlanoDoLivro {
  const { nome, idade, produto, personagem } = entrada;
  const crianca = descreverCrianca(personagem, idade);
  const altura = alturaNaCena(personagem);

  const paginas = PAGINAS.map((p): PaginaDoPlano => {
    const variante = p.porSuperpoder?.[personagem.superpoder];
    const acao = variante?.acao ?? p.acao;
    const roupa = p.pagina >= PAGINA_DA_CAMISA ? ROUPA_DO_TIME : roupaPropria(personagem);
    return {
      pagina: p.pagina,
      cenaBase: p.cenaBase,
      prompt: preencher(PROMPT_DE_INSERCAO, { CHILD_SHORT: crianca, ACTION: acao, AREA: p.area, CHILD_HEIGHT: altura, OUTFIT: roupa }),
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
  });
  const querLembrancinha = produto === 'lembrancinha' || produto === 'combo';
  const querPresente = produto === 'presente' || produto === 'combo';
  const superpoder = SUPERPODERES.find((s) => s.id === personagem.superpoder)!;

  const usadas = new Set<number>([...(querLembrancinha ? PAGINAS_DA_LEMBRANCINHA : []), ...(querPresente ? PAGINAS.map((p) => p.pagina) : [])]);

  return {
    modelo: ID_DO_MODELO,
    titulo: comNomeNoTexto(TITULO, nome),
    subtitulo: SUBTITULO,
    ficha: {
      prompt: promptDaFicha(personagem, idade),
      usaFoto: personagem.jeito === 'foto',
      caminhoDaFoto: personagem.foto?.caminho ?? null,
    },
    capa: {
      cenaBase: CAPA.cenaBase,
      cenaBaseColorida: CAPA.cenaBaseColorida,
      prompt: promptDaCapa,
      promptColorido: `${promptDaCapa}\nColor the child exactly as in the color version of the character sheet (skin, hair, eyes); the jersey uses the team colors of the cover.`.replace(
        'no gray, no shading, no color.',
        'same soft crayon-like flat colors as the scene.',
      ),
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
