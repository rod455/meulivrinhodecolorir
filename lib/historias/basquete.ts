// "{NOME} entra na quadra!": o tema de basquete com a turma Little Paws, a
// partir do livro Little Paws, Big Game. Fonte única:
// livros-fonte/10-personalizados/basquete-little-paws.md (seções 3, 5 e 7).
// O texto é o do PDF de prova aprovado pelo dono em 01/11/2026.
// Puro: conferido por `npm run conferir:personagem`.

import type { HistoriaDaTurma, PaginaDaHistoria } from './modelo.ts';

export const ID_DO_MODELO = 'basquete-little-paws-v1';
export const TITULO = '{NOME} entra na quadra!';
export const SUBTITULO = 'Uma aventura de basquete com a turma Little Paws';
/** a partir desta página a criança veste a regata do time */
export const PAGINA_DA_CAMISA = 10;

export const ROUPA_DO_TIME_BASQUETE =
  'the Little Paws basketball uniform: sleeveless tank-top jersey with the outlined paw emblem, basketball shorts, ankle socks and high-top sneakers, plus the same glasses and hair accessories from the sheet';

const base = (n: number) => `temas/basquete/base/p${String(n).padStart(2, '0')}.png`;

const INTERVALO = 'No intervalo, o time estava cabisbaixo.';

export const PAGINAS: PaginaDaHistoria[] = [
  {
    pagina: 1,
    cenaBase: base(1),
    texto: 'O Torneio de Basquete da Praça ia começar! Pip já sonhava com a cesta da vitória. (Psiu… quem está lá na arquibancada?)',
    acao: 'sitting on the top row of the bleachers, peeking over the railing with a curious smile, holding their own basketball on the lap',
    area: 'the right side, top row of the bleachers',
    roupa: 'propria',
    lembrancinha: null,
  },
  {
    pagina: 2,
    cenaBase: base(2),
    texto: 'No treino, Pip quis arremessar todas as bolas. E errou quase todas! (Da arquibancada, alguém ria baixinho…)',
    acao: 'sitting on the bleachers, covering a giggle with one hand, eyes following the ball',
    area: 'the left background, on the bleachers',
    roupa: 'propria',
    lembrancinha: null,
  },
  {
    pagina: 3,
    cenaBase: base(3),
    texto: 'Uma bola quicou para fora da quadra… e quem devolveu foi {NOME}, com um passe certeiro!',
    acao: 'having just thrown a two-handed chest pass, arms stretched forward, proud little smile',
    area: 'the left third of the page',
    roupa: 'propria',
    lembrancinha: '{NOME} chegou com um passe certeiro!',
  },
  {
    pagina: 4,
    cenaBase: base(4),
    texto: '"Joga com a gente?", perguntou Luna. {NOME} topou antes de a Luna terminar a pergunta.',
    acao: 'stepping forward with both hands out to take the ball, big excited smile',
    area: 'the right side, facing Luna',
    roupa: 'propria',
    lembrancinha: 'Luna chamou {NOME} para o time.',
  },
  {
    pagina: 5,
    cenaBase: base(5),
    texto: 'Bo pegava os rebotes, Luna pensava nas jogadas, Dot reparava em tudo e Milo fazia piada. E o Pip só queria a bola.',
    acao: 'watching Pip with a gentle, amused smile, hands on knees',
    area: 'the lower left foreground',
    roupa: 'propria',
    lembrancinha: null,
  },
  {
    pagina: 6,
    cenaBase: base(6),
    texto: 'No jogo-treino, {NOME} ficou livre, livre, livre. Mas o Pip arremessou sozinho de novo.',
    acao: 'standing completely open near the hoop, both arms raised and waving to ask for the ball',
    area: 'the right side, near the hoop',
    roupa: 'propria',
    lembrancinha: '{NOME} ficou livre!',
  },
  {
    pagina: 7,
    cenaBase: base(7),
    texto: 'A bola bateu no aro, tóin!, quicou na cabeça do Bo e caiu no colo do Milo. Todo mundo riu, menos o Pip.',
    acao: 'laughing with both hands on the belly',
    area: 'the left foreground',
    roupa: 'propria',
    lembrancinha: null,
  },
  {
    pagina: 8,
    cenaBase: base(8),
    texto: '{NOME} ensinou um truque: "Quica, olha e passa!" Luna desenhou na prancheta um lugar para cada um do time.',
    acao: 'dribbling the basketball with one hand while looking up at the team, the other hand pointing forward as if passing',
    area: 'the right side, next to the ball',
    roupa: 'propria',
    lembrancinha: 'Quica, olha e passa!',
  },
  {
    pagina: 9,
    cenaBase: base(9),
    texto: 'No fim do treino, Bo trouxe uma surpresa: uma regata com a patinha do time, do tamanho certinho de {NOME}.',
    acao: 'holding up a Little Paws basketball tank-top jersey with the outlined paw emblem in both hands, delighted, eyes sparkling',
    area: 'the right side, close to Bo',
    // ainda com a própria roupa: a regata está nas mãos
    roupa: 'propria',
    lembrancinha: 'Uma regata só para {NOME}!',
  },
  {
    pagina: 10,
    cenaBase: base(10),
    texto: 'Chegou o dia do torneio! A quadra estava cheia de bandeirinhas e de torcida, e a Vovó Ursa acenava da primeira fila.',
    acao: 'walking proudly with the team, waving to the crowd',
    area: 'the center of the group, between Pip and Luna',
    roupa: 'time',
    lembrancinha: 'Dia de torneio na praça!',
  },
  {
    pagina: 11,
    cenaBase: base(11),
    texto: 'Do outro lado estavam Zuzu e os Stripes, rapidinhos que só. Antes de começar, todo mundo se cumprimentou.',
    acao: 'giving a friendly high five to the otter of the other team',
    area: 'the left foreground',
    roupa: 'time',
    lembrancinha: null,
  },
  {
    pagina: 12,
    cenaBase: base(12),
    texto: 'Zuzu fazia cesta, cesta e mais cesta. No intervalo, os Stripes estavam na frente.',
    acao: 'watching the ball go in, a little worried but determined, fists closed',
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
        texto: `${INTERVALO} Então {NOME} disse: "Eu também tô com frio na barriga… mas a gente consegue virar!"`,
        acao: 'standing tall in front of the team, one fist raised, determined smile',
      },
      criatividade: {
        texto: `${INTERVALO} Então {NOME} pegou a prancheta da Luna e desenhou uma jogada em que todo mundo tocava na bola.`,
        acao: "holding Luna's clipboard and drawing on it with a pencil, excited idea face",
      },
      gentileza: {
        texto: `${INTERVALO} Então {NOME} sentou ao lado do Pip: "Ninguém joga sozinho. E ninguém fica sozinho também."`,
        acao: "sitting on the bench right next to Pip, a kind look, one hand gently on Pip's shoulder",
      },
      bom_humor: {
        texto: `${INTERVALO} Então {NOME} fez a dança do quica-quica. Até o Pip deu risada!`,
        acao: 'doing a silly bouncing dance, pretending to dribble an invisible ball, tongue out playfully',
        // o texto diz que o Pip riu; na cena base ele está triste (como no futebol com o Bo)
        ajusteDaCena: "change ONLY Pip's face (the rabbit sitting on the bench) to a big, happy laugh with closed eyes; keep his pose, body and everything else exactly the same",
      },
      curiosidade: {
        texto: `${INTERVALO} Então {NOME} contou uma descoberta: "A Zuzu sempre dribla para a esquerda!"`,
        acao: 'pointing toward the court with one hand, the other hand by the mouth as if sharing a secret, curious eyes',
      },
    },
  },
  {
    pagina: 14,
    cenaBase: base(14),
    texto: 'No último minuto, o Pip estava com a bola. Ele olhou para o aro… e passou para {NOME}!',
    acao: 'catching the basketball with both hands, surprised and happy',
    area: 'the right side, near the hoop',
    roupa: 'time',
    lembrancinha: 'Pip passou para {NOME}!',
  },
  {
    pagina: 15,
    cenaBase: base(15),
    texto: '{NOME} quicou, olhou e arremessou bem alto, com o time inteiro torcendo.',
    // a cena base não tem bola: a única bola é a que sai da mão da criança (checagem 8 do tema)
    acao: 'jumping and releasing a high shot toward the hoop at the top right, the basketball just leaving the fingertips with motion lines (the only ball in the scene, drawn with its curved seam lines only)',
    area: 'the left foreground',
    roupa: 'time',
    lembrancinha: '{NOME} arremessou bem alto!',
  },
  {
    pagina: 16,
    cenaBase: base(16),
    texto: 'Chuá! O time venceu por um ponto, e o Pip abraçou {NOME}: "Jogar em time é bem melhor!"',
    acao: 'jumping with both arms up in the middle of the team, being hugged by Pip, huge smile',
    area: 'the center of the circle',
    roupa: 'time',
    lembrancinha: 'Cesta! Valeu por vir à minha festa!',
  },
];

export const CAPA = {
  cenaBase: 'temas/basquete/base/capa-contorno.png',
  cenaBaseColorida: 'temas/basquete/base/capa-colorida.png',
  acao: 'standing proudly in front center, spinning the basketball on one finger, big confident smile',
  area: 'front and center, standing right behind the ball',
};

export const CERTIFICADO = {
  cenaBase: 'temas/basquete/base/certificado.png',
  texto: 'Certificado oficial: {NOME} faz parte do Time Little Paws de basquete! Superpoder: {SUPERPODER_NOME}.',
};

export const PAGINAS_DA_LEMBRANCINHA = [3, 4, 6, 8, 9, 10, 14, 15, 16];

export const HISTORIA_BASQUETE: HistoriaDaTurma = {
  modelo: ID_DO_MODELO,
  titulo: TITULO,
  subtitulo: SUBTITULO,
  paginaDaCamisa: PAGINA_DA_CAMISA,
  paginas: PAGINAS,
  capa: CAPA,
  certificado: CERTIFICADO,
  lembrancinha: PAGINAS_DA_LEMBRANCINHA,
  roupaDoTime: ROUPA_DO_TIME_BASQUETE,
};
