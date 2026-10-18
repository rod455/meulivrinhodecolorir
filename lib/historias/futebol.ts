// "{NOME} entra em campo!": o tema de futebol com a turma Little Paws, como
// modelo de história com vaga para o personagem da criança. Fonte única:
// livros-fonte/10-personalizados/futebol-little-paws.md (seções 4, 5 e 7).
// Puro: conferido por `npm run conferir:personagem`.

import type { SuperpoderId } from '../personagem.ts';

export type Roupa = 'propria' | 'time';

export type PaginaDaHistoria = {
  pagina: number;
  /** cena base aprovada, sem a criança; gerada uma vez só na produção do tema */
  cenaBase: string;
  /** texto do rodapé, aplicado pelo script; {NOME} vira o nome */
  texto: string;
  acao: string;
  area: string;
  roupa: Roupa;
  /** legenda curta quando a página entra na Lembrancinha */
  lembrancinha: string | null;
  /** só a página 13: texto e ação mudam conforme o superpoder */
  porSuperpoder?: Record<SuperpoderId, { texto: string; acao: string }>;
};

export const ID_DO_MODELO = 'futebol-little-paws-v1';
export const TITULO = '{NOME} entra em campo!';
export const SUBTITULO = 'Uma aventura de futebol com a turma Little Paws';
/** a partir desta página a criança veste o uniforme do time */
export const PAGINA_DA_CAMISA = 10;

const base = (n: number) => `temas/futebol/base/p${String(n).padStart(2, '0')}.png`;

const INTERVALO = 'No intervalo, o time estava cabisbaixo.';

export const PAGINAS: PaginaDaHistoria[] = [
  {
    pagina: 1,
    cenaBase: base(1),
    texto: 'O Festival de Futebol da Praça seria no sábado! Cada time precisava de seis jogadores. (Psiu… tem alguém atrás da árvore!)',
    acao: 'peeking out from behind the tree trunk, only half of the body visible, curious smile, holding their own soccer ball',
    area: 'the right side, behind the tree trunk',
    roupa: 'propria',
    lembrancinha: null,
  },
  {
    pagina: 2,
    cenaBase: base(2),
    texto: 'Pip contou os amigos: um, dois, três, quatro, cinco. "Falta um!" (De trás do banco, alguém espiava…)',
    acao: 'crouching behind the bench, eyes and hair peeking over the backrest, both hands holding the bench top',
    area: 'the left background, behind the bench',
    roupa: 'propria',
    lembrancinha: null,
  },
  {
    pagina: 3,
    cenaBase: base(3),
    texto: 'Nessa hora, uma bola rolou até os pés de Pip. Logo atrás dela vinha {NOME}!',
    acao: 'walking in shyly, giving a small wave, a little embarrassed smile',
    area: 'the left third of the page',
    roupa: 'propria',
    lembrancinha: '{NOME} chegou para jogar!',
  },
  {
    pagina: 4,
    cenaBase: base(4),
    texto: '"Quer jogar com a gente?", perguntou Pip. {NOME} deu um sorriso do tamanho do campo.',
    acao: 'standing facing Pip, a huge happy smile, hands clasped in excitement',
    area: 'the right side, facing Pip',
    roupa: 'propria',
    lembrancinha: 'Pip convidou {NOME} para o time.',
  },
  {
    pagina: 5,
    cenaBase: base(5),
    texto: 'Pip apresentou todo mundo. Bo era o goleiro, Luna organizava as jogadas, Dot reparava em tudo… e Milo estava correndo atrás de uma borboleta.',
    acao: 'laughing and pointing at Milo chasing the butterfly',
    area: 'the lower left foreground',
    roupa: 'propria',
    lembrancinha: null,
  },
  {
    pagina: 6,
    cenaBase: base(6),
    texto: 'No primeiro treino, {NOME} chutou com tanta vontade que a bola foi parar em cima da árvore!',
    acao: 'standing on one leg, the kicking leg still up after a big kick, both hands on the cheeks in comic surprise, looking up at the tree',
    area: 'the center-left foreground',
    roupa: 'propria',
    lembrancinha: 'Opa! A bola foi parar na árvore!',
  },
  {
    pagina: 7,
    cenaBase: base(7),
    texto: 'Bo esticou os braços, Luna pulou, Dot apontou o galho certo… e a bola caiu bem na cabeça do Milo. Plof!',
    acao: 'laughing with both hands over the mouth',
    area: 'the right foreground',
    roupa: 'propria',
    lembrancinha: null,
  },
  {
    pagina: 8,
    cenaBase: base(8),
    texto: 'Luna ensinou o segredo do time: "A bola vai, a bola volta. Ninguém joga sozinho."',
    acao: 'getting ready to receive the pass, one foot lifted slightly to stop the ball, concentrated face',
    area: "the right side, in the ball's path",
    roupa: 'propria',
    lembrancinha: 'A bola vai, a bola volta.',
  },
  {
    pagina: 9,
    cenaBase: base(9),
    texto: 'No fim do treino, Bo trouxe uma surpresa: uma camisa com a patinha do time, do tamanho certinho de {NOME}.',
    acao: 'holding up a Little Paws soccer jersey with the outlined paw emblem in both hands, delighted, eyes sparkling',
    area: 'the right side, close to Bo',
    // ainda com a própria roupa: a camisa está nas mãos
    roupa: 'propria',
    lembrancinha: 'Uma camisa só para {NOME}!',
  },
  {
    pagina: 10,
    cenaBase: base(10),
    texto: 'Chegou o sábado! A praça estava cheia de bandeirinhas, pipoca e torcida.',
    acao: 'walking proudly with the team, chest out, big smile',
    area: 'the center of the group, between Pip and Luna',
    roupa: 'time',
    lembrancinha: 'Dia de festival na praça!',
  },
  {
    pagina: 11,
    cenaBase: base(11),
    texto: 'O outro time era o Time da Lagoa. Antes de começar, todo mundo se cumprimentou.',
    acao: 'waving hello to the little frog goalkeeper with a friendly smile',
    area: 'the left foreground',
    roupa: 'time',
    lembrancinha: null,
  },
  {
    pagina: 12,
    cenaBase: base(12),
    texto: 'Apito! Logo no começo, a lontra chutou e… gol do Time da Lagoa. Bo ficou olhando a bola na rede.',
    acao: 'standing with both hands on the head, surprised and a little worried',
    area: 'the right middle ground',
    roupa: 'time',
    lembrancinha: null,
  },
  {
    pagina: 13,
    cenaBase: base(13),
    texto: INTERVALO,
    acao: '',
    area: 'the right end of the bench / just in front of it',
    roupa: 'time',
    lembrancinha: null,
    porSuperpoder: {
      coragem: {
        texto: `${INTERVALO} Então {NOME} disse: "Eu também tô com medo… mas a gente pode tentar de novo!"`,
        acao: 'standing tall in front of the team, one fist raised, determined smile',
      },
      criatividade: {
        texto: `${INTERVALO} Então {NOME} pegou a prancheta da Luna e desenhou uma jogada novinha.`,
        acao: "holding Luna's clipboard and drawing on it with a pencil, excited idea face",
      },
      gentileza: {
        texto: `${INTERVALO} Então {NOME} sentou ao lado do Bo: "Aquele gol não foi culpa sua. Goleiro também tem time."`,
        acao: "sitting on the bench right next to Bo, a kind look, one hand gently on Bo's arm",
      },
      bom_humor: {
        texto: `${INTERVALO} Então {NOME} fez a dança mais engraçada do mundo. Até o Bo deu risada!`,
        acao: 'doing a silly dance on one foot, arms wiggling, tongue out playfully',
      },
      curiosidade: {
        texto: `${INTERVALO} Então {NOME} contou uma descoberta: "O Time da Lagoa sempre chuta para o mesmo lado!"`,
        acao: 'pointing toward the field with one hand, the other hand by the mouth as if sharing a secret, curious eyes',
      },
    },
  },
  {
    pagina: 14,
    cenaBase: base(14),
    texto: 'No segundo tempo, Milo não olhou para nenhuma borboleta. Ele tirou a bola do castor e tocou para {NOME}.',
    acao: 'running forward to receive the pass, arms swinging, focused eyes',
    area: "the right side, in the ball's path",
    roupa: 'time',
    lembrancinha: 'Milo tocou para {NOME}.',
  },
  {
    pagina: 15,
    cenaBase: base(15),
    texto: '{NOME} tocou para Luna, Luna tocou para Pip, Pip devolveu… e {NOME} chutou com toda a força!',
    acao: 'kicking the soccer ball toward the goal in a strong, balanced kick, ball just leaving the foot with motion lines (the ball has outlined white patches)',
    area: 'the left foreground',
    roupa: 'time',
    lembrancinha: '{NOME} chutou com toda a força!',
  },
  {
    pagina: 16,
    cenaBase: base(16),
    texto: 'GOOOL! O jogo terminou empatado, mas o time comemorou como se fosse final de copa. Afinal, eles tinham ganhado uma amizade nova: {NOME}!',
    acao: 'jumping in the air at the center, both arms raised, the happiest face',
    area: 'the center of the circle',
    roupa: 'time',
    lembrancinha: 'Gooool! Valeu por vir à minha festa!',
  },
];

export const CAPA = {
  cenaBase: 'temas/futebol/base/capa-contorno.png',
  cenaBaseColorida: 'temas/futebol/base/capa-colorida.png',
  acao: 'standing proudly in front center with one foot on the soccer ball, hands on hips, big confident smile',
  area: 'front and center, right behind the ball',
};

/** A arte do certificado não muda entre pedidos; só o texto. */
export const CERTIFICADO = {
  cenaBase: 'temas/futebol/base/certificado.png',
  texto: 'Certificado oficial: {NOME} faz parte do Time Little Paws! Superpoder: {SUPERPODER_NOME}.',
};

/** As nove páginas da Lembrancinha, nesta ordem (a troca de roupa continua fazendo sentido). */
export const PAGINAS_DA_LEMBRANCINHA = [3, 4, 6, 8, 9, 10, 14, 15, 16];

export const PROMPT_DE_INSERCAO = `Edit the attached base scene. Add exactly ONE new character: the child from the attached approved character sheet ({CHILD_SHORT}), {ACTION}, placed in the empty area at {AREA}. Height: {CHILD_HEIGHT}.
Outfit on this page: {OUTFIT}.
Match the child's face, hair, accessories and proportions to the character sheet exactly. Match the scene's style: same thick black outlines, white interiors, no gray, no shading, no color.
Do NOT change, move, redraw or remove anything else in the scene. Keep the bottom 22% of the page completely white. No text.`;
