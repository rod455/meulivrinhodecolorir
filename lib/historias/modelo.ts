// O formato comum das histórias da turma com vaga para a criança (futebol,
// basquete...). Cada tema traz só o que muda; o prompt de inserção é um só
// (livros-fonte/10-personalizados/README.md, seção 2).
// Puro: conferido por `npm run conferir:personagem`.

import type { SuperpoderId } from '../personagem.ts';

export type Roupa = 'propria' | 'time';

export type PaginaDaHistoria = {
  pagina: number;
  /** cena base aprovada, sem a criança; gerada uma vez só na produção do tema */
  cenaBase: string;
  /** onde a criança entra, em pixels da cena base (x, y, largura, altura), do guia de inserção do dono */
  areaPx?: [number, number, number, number];
  /**
   * onde a ação da criança passa da área dela (a bola do arremesso ou do chute), em pixels:
   * a trava do livro automático deixa a OpenAI desenhar ali também (teste do Tito, 01/11/2026)
   */
  travaExtraPx?: [number, number, number, number];
  /** texto do rodapé, aplicado pelo script; {NOME} vira o nome */
  texto: string;
  acao: string;
  area: string;
  roupa: Roupa;
  /** legenda curta quando a página entra na Lembrancinha */
  lembrancinha: string | null;
  /** só a página 13: texto e ação mudam conforme o superpoder */
  porSuperpoder?: Record<
    SuperpoderId,
    {
      texto: string;
      acao: string;
      ajusteDaCena?: string;
      /** onde fica o que o ajuste muda (o rosto do Pip), em pixels: a trava do livro automático deixa mudar ali também */
      areaDoAjustePx?: [number, number, number, number];
    }
  >;
};

export type HistoriaDaTurma = {
  modelo: string;
  titulo: string;
  subtitulo: string;
  /** a partir desta página a criança veste o uniforme do time */
  paginaDaCamisa: number;
  paginas: PaginaDaHistoria[];
  capa: { cenaBase: string; cenaBaseColorida: string; acao: string; area: string; areaPx?: [number, number, number, number] };
  /** a arte do certificado não muda entre pedidos; só o texto */
  certificado: { cenaBase: string; texto: string };
  /** as nove páginas da Lembrancinha, na ordem */
  lembrancinha: number[];
  /** o uniforme do time, em inglês, para o prompt de inserção */
  roupaDoTime: string;
};

export const PROMPT_DE_INSERCAO = `Edit the attached base scene. Add exactly ONE new character: the child from the attached approved character sheet ({CHILD_SHORT}), {ACTION}, placed in the empty area at {AREA}. Height: {CHILD_HEIGHT}.
Outfit on this page: {OUTFIT}.
Match the child's face, hair, accessories and proportions to the character sheet exactly. Match the scene's style: same thick black outlines, white interiors, no gray, no shading, no color.
Do NOT change, move, redraw or remove anything else in the scene. Keep the bottom 22% of the page completely white. No text.`;
