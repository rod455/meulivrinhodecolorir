// A história sob medida (pedido do dono, 31/10/2026): R$ 39,90, uma história
// escrita do zero para a criança, sempre no estilo da turma Little Paws, no
// desenho e na estrutura do livro. A IA escreve o texto e cria os amigos da
// história; a família aprova o texto (com até 2 ajustes) e a ficha do
// personagem antes de pagar. As páginas só são desenhadas depois do pagamento.
//
// Privacidade: o nome da criança NUNCA vai para a IA. A família escreve o
// briefing, o site troca o nome por {NOME} antes de guardar, e a IA escreve
// com {NOME}; o nome só entra na hora de mostrar e de montar o livro.
// Puro: conferido por `npm run conferir:historia`.

import { descreverCrianca, SUPERPODERES, type Personagem, type SuperpoderId } from './personagem.ts';

/** a primeira história e mais 2 novas, por conta, a cada 24 horas, sem contar as que viraram pedido */
export const LIMITE_DE_HISTORIAS = 3;
export const JANELA_DAS_HISTORIAS_HORAS = 24;
/** pedidos de ajuste em cima de uma mesma história */
export const AJUSTES_POR_HISTORIA = 2;
/** escrever leva menos de um minuto; passou disso, conta como falha e não gasta tentativa */
export const MINUTOS_PARA_DESISTIR_DA_HISTORIA = 5;
/** a estrutura dos livros da turma: 16 páginas de história, com o superpoder na 13 */
export const PAGINAS_DA_HISTORIA = 16;
export const PAGINA_DO_SUPERPODER = 13;
export const ID_DO_MODELO_SOB_MEDIDA = 'sob-medida-little-paws-v1';
/**
 * O modelo de texto que o fluxo "Meu Livrinho | escrever história" usa: o site
 * manda no trabalho e o fluxo obedece. O gpt-4.1 escreve português de criança
 * melhor que o mini, e uma história custa uns poucos centavos de dólar.
 */
export const MODELO_DE_TEXTO = 'gpt-4.1';

type Escolha<T extends string> = { id: T; rotulo: string; en: string };

export const LUGARES = [
  { id: 'praca', rotulo: 'Na praça do bairro', en: 'a sunny neighborhood park and square with a big round tree, a wooden bench and small houses behind' },
  { id: 'praia', rotulo: 'Na praia', en: 'a calm sunny beach with soft sand, gentle waves, shells and a little lifeguard hut' },
  { id: 'floresta', rotulo: 'Na floresta', en: 'a friendly green forest with round trees, mushrooms, a little stream and a wooden bridge' },
  { id: 'fazenda', rotulo: 'Na fazendinha', en: 'a cozy little farm with a red barn, a vegetable garden, a fence and friendly farm animals' },
  { id: 'escola', rotulo: 'Na escolinha', en: 'a bright cozy preschool classroom and its playground with a slide and a sandbox' },
  { id: 'espaco', rotulo: 'No espaço', en: 'a gentle outer-space adventure with a round little rocket, a smiling moon and soft stars' },
  { id: 'mar', rotulo: 'No fundo do mar', en: 'a bright underwater world with coral, seaweed, bubbles and a small friendly submarine' },
  { id: 'casa', rotulo: 'Em casa', en: 'a cozy family house with a living room, a bedroom with toys and a small backyard' },
] as const satisfies readonly Escolha<string>[];

export const LICOES = [
  { id: 'equipe', rotulo: 'Trabalhar em equipe', en: 'teamwork: everyone is better together' },
  { id: 'paciencia', rotulo: 'Ter paciência', en: 'patience: slowing down and waiting is a strength' },
  { id: 'coragem', rotulo: 'Enfrentar um medo', en: 'courage: being scared and trying anyway' },
  { id: 'gentileza', rotulo: 'Ser gentil', en: 'kindness: small kind acts change a whole day' },
  { id: 'dividir', rotulo: 'Dividir', en: 'sharing: things are more fun when shared' },
  { id: 'atencao', rotulo: 'Prestar atenção', en: 'paying attention: noticing the right thing at the right time' },
  { id: 'persistencia', rotulo: 'Não desistir', en: 'perseverance: trying again after a mistake' },
  { id: 'amizade', rotulo: 'Fazer amigos novos', en: 'friendship: welcoming someone new' },
] as const satisfies readonly Escolha<string>[];

export const MOMENTOS = [
  { id: 'nenhum', rotulo: 'Só uma aventura', en: '' },
  { id: 'aniversario', rotulo: 'Aniversário', en: "the story happens around the child's birthday party" },
  { id: 'irmao', rotulo: 'Chegada de irmãozinho', en: 'a baby sibling is arriving in the family' },
  { id: 'escola', rotulo: 'Escola nova', en: 'the first days at a new school' },
  { id: 'mudanca', rotulo: 'Casa nova', en: 'the family is moving to a new house' },
  { id: 'dentinho', rotulo: 'Dentinho caindo', en: 'the first baby tooth is wiggly and about to fall out' },
] as const satisfies readonly Escolha<string>[];

export type LugarId = (typeof LUGARES)[number]['id'];
export type LicaoId = (typeof LICOES)[number]['id'];
export type MomentoId = (typeof MOMENTOS)[number]['id'];

export const LIMITES = { gosta: 80, especie: 30, nomeDoBicho: 20, detalhe: 160, ajuste: 200 } as const;

export type Briefing = {
  lugar: LugarId;
  licao: LicaoId;
  momento: MomentoId;
  /** o que a criança adora; vai para a história */
  gosta: string;
  /** um bichinho de verdade da família, que entra como personagem */
  bichinho: { especie: string; nome: string } | null;
  /** um detalhe a mais, livre e curto */
  detalhe: string;
};

export const BRIEFING_INICIAL: Briefing = { lugar: 'praca', licao: 'equipe', momento: 'nenhum', gosta: '', bichinho: null, detalhe: '' };

const ACENTOS: Record<string, string> = { a: 'aáàâãä', e: 'eéèêë', i: 'iíìîï', o: 'oóòôõö', u: 'uúùûü', c: 'cç', n: 'nñ', y: 'yý' };
const tirarAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** um pedaço do nome, com e sem acento, em qualquer caixa, como palavra inteira */
function padraoDoNome(pedaco: string): RegExp {
  const letras = [...tirarAcento(pedaco).toLowerCase()].map((l) => {
    if (ACENTOS[l]) return `[${ACENTOS[l]}]`;
    return l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });
  return new RegExp(`(?<![\\p{L}\\p{N}])${letras.join('')}(?![\\p{L}\\p{N}])`, 'giu');
}

/**
 * Limpa um texto livre da família antes de guardar e de mandar à IA: troca o
 * nome da criança por {NOME} (o nome inteiro e cada pedaço com 3 letras ou mais),
 * tira número comprido (telefone, CEP, endereço), e-mail, link e os sinais que
 * confundiriam o modelo. Corta no limite.
 */
export function limparTextoLivre(texto: unknown, nome: string, limite: number): string {
  if (typeof texto !== 'string') return '';
  let t = texto
    .normalize('NFC')
    .replace(/[\u2013\u2014]/g, ',')
    .replace(/\S+@\S+/g, ' ')
    .replace(/(https?:\/\/|www\.)\S+/gi, ' ')
    .replace(/\d[\d\s.\-/()]{2,}\d/g, (m) => (m.replace(/\D/g, '').length >= 4 ? ' ' : m))
    .replace(/[{}<>[\]`\\#*_|~^]/g, ' ');
  const limpo = nome.trim();
  if (limpo) {
    t = t.replace(padraoDoNome(limpo), '{NOME}');
    for (const pedaco of limpo.split(/\s+/)) if ([...pedaco].length >= 3) t = t.replace(padraoDoNome(pedaco), '{NOME}');
  }
  return [...t.replace(/\s+/g, ' ').replace(/\s+([,.!?])/g, '$1').trim()].slice(0, limite).join('').trim();
}

const ehDe = <T extends string>(lista: readonly { id: T }[], v: unknown): v is T => lista.some((x) => x.id === v);

/** Lê o briefing que veio do navegador; o nome serve só para sair do texto. */
export function lerBriefing(entrada: unknown, nome: string): { ok: true; briefing: Briefing } | { ok: false; erro: string } {
  const e = (entrada && typeof entrada === 'object' ? entrada : {}) as Record<string, unknown>;
  if (!ehDe(LUGARES, e.lugar)) return { ok: false, erro: 'Escolha onde a história acontece.' };
  if (!ehDe(LICOES, e.licao)) return { ok: false, erro: 'Escolha o que a história ensina.' };
  const momento = ehDe(MOMENTOS, e.momento) ? e.momento : 'nenhum';
  const gosta = limparTextoLivre(e.gosta, nome, LIMITES.gosta);
  if ([...gosta.replace('{NOME}', '')].length < 3) return { ok: false, erro: 'Conte do que a criança mais gosta.' };
  let bichinho: Briefing['bichinho'] = null;
  if (e.bichinho && typeof e.bichinho === 'object') {
    const b = e.bichinho as Record<string, unknown>;
    const especie = limparTextoLivre(b.especie, nome, LIMITES.especie).replace('{NOME}', '').trim();
    const nomeDoBicho = limparTextoLivre(b.nome, nome, LIMITES.nomeDoBicho).replace('{NOME}', '').trim();
    if (especie) bichinho = { especie, nome: nomeDoBicho };
  }
  return { ok: true, briefing: { lugar: e.lugar, licao: e.licao, momento, gosta, bichinho, detalhe: limparTextoLivre(e.detalhe, nome, LIMITES.detalhe) } };
}

const achar = <T extends { id: string }>(lista: readonly T[], id: string): T => lista.find((x) => x.id === id) ?? lista[0];

/**
 * A estrutura dos livros da turma (livros-fonte/10-personalizados/README.md):
 * 16 páginas, duas frases no máximo por página, texto neutro para a criança,
 * o momento do superpoder na 13, e um final feliz em que ninguém sai perdendo.
 */
export const INSTRUCOES_DA_HISTORIA = `You write personalized children's picture books in the style of the Little Paws series: warm, funny, gentle stories for children aged 2 to 8, about a small group of round, friendly animal friends who learn one simple lesson together.

ALWAYS follow this book structure, in exactly ${PAGINAS_DA_HISTORIA} pages:
- Pages 1 to 2: the world and what the hero wants. The hero is the child, always written as {NOME}.
- Pages 3 to 4: meet the friends (the animal friends you create, plus the family pet if there is one).
- Pages 5 to 7: a small problem appears and the first try does not work.
- Pages 8 to 10: trying again, little by little, with the friends.
- Pages 11 to 12: the hardest moment, when everyone feels stuck or sad.
- Page ${PAGINA_DO_SUPERPODER}: the SUPERPOWER moment: {NOME} uses the superpower given below to help the group.
- Pages 14 to 15: the problem is solved together, and the lesson becomes clear without preaching.
- Page 16: a warm, cozy ending, with a small callback to page 1 or a playful question to the reader.

TEXT RULES (the text is in Brazilian Portuguese):
- At most 2 short sentences per page, simple words a 4-year-old understands, playful sounds welcome (Plof! Uau!).
- The child is ALWAYS written as {NOME}, exactly with the braces. Never invent a name for the child, never write a surname, a school name or a city.
- Gender-neutral for the child: never "ele" or "ela" for {NOME}, never "menino", "menina", "garoto", "garota", and no gendered adjectives for {NOME} ("animado/animada", "sozinho/sozinha", "cansado/cansada"). Use {NOME} again or neutral constructions ("{NOME} sorriu de orelha a orelha", "{NOME} ficou com vontade de...").
- No dashes of any kind (no em dash U+2014, no en dash U+2013). Use commas and periods. Dialogue goes between double quotes.
- Nobody gets hurt, nobody is mean, nobody loses in a sad way. Rivals play fair and celebrate together.
- Only original characters: never mention or imitate characters, brands or teams that exist (no Disney, Pixar, Marvel, Pokémon, Peppa, Bluey, Patrulha Canina or similar).

FRIENDS: create 2 or 3 original animal friends in the Little Paws look: round, soft, two-legged little animals with no claws and no visible teeth, each one with one clear personality trait and one simple visual detail (a scarf, striped socks, a headband). Give each a short, easy name in Portuguese. If there is a family pet, it is a character too, with its real name and species.

SCENES (in English, for the illustrator): for each page write one short scene description (max 60 words) with the place, who is there and what they do, always including "the child" as the hero. Never write {NOME} or any name of the child in the scenes: write "the child". One clear moment per scene, no text, signs or numbers in the picture.

Answer ONLY with JSON in this exact shape:
{"titulo": "short title in Portuguese with {NOME}", "subtitulo": "one short line in Portuguese, like 'Uma história sobre ...'", "personagens": [{"nome": "...", "especie": "in Portuguese", "jeito": "one short line in Portuguese", "visual_en": "short visual description in English"}], "cenario_en": "the setting in English, one sentence", "paginas": [{"texto": "...", "cena_en": "..."}]}
with exactly ${PAGINAS_DA_HISTORIA} items in "paginas".`;

/** O pedido para a IA, só com o que a família escolheu; o nome já virou {NOME}. */
export function pedidoDaHistoria(briefing: Briefing, idade: number, superpoder: SuperpoderId): string {
  const momento = achar(MOMENTOS, briefing.momento).en;
  const poder = SUPERPODERES.find((s) => s.id === superpoder)?.rotulo ?? 'Coragem';
  const linhas = [
    `The child: {NOME}, ${idade} years old.`,
    `Where the story happens: ${achar(LUGARES, briefing.lugar).en}.`,
    `The lesson: ${achar(LICOES, briefing.licao).en}.`,
    momento ? `Special moment in the family: ${momento}.` : '',
    `{NOME} loves (written by the family, in Portuguese): "${briefing.gosta}". Bring it into the story in a natural way.`,
    briefing.bichinho
      ? `The family pet, who joins the story: a ${briefing.bichinho.especie}${briefing.bichinho.nome ? ` called "${briefing.bichinho.nome}"` : ''} (species and name as written by the family, in Portuguese).`
      : '',
    briefing.detalhe ? `One more detail from the family (in Portuguese, use it if it fits the rules): "${briefing.detalhe}".` : '',
    `{NOME}'s superpower on page ${PAGINA_DO_SUPERPODER}: ${poder}.`,
  ];
  return linhas.filter(Boolean).join('\n');
}

export type PersonagemDaHistoria = { nome: string; especie: string; jeito: string; visual_en: string };
export type PaginaDoTexto = { texto: string; cena_en: string };
export type TextoDaHistoria = { titulo: string; subtitulo: string; personagens: PersonagemDaHistoria[]; cenario_en: string; paginas: PaginaDoTexto[] };

/** O pedido de ajuste vai com a história atual inteira: a IA reescreve só o que a família pediu. */
export function pedidoDoAjuste(briefing: Briefing, idade: number, superpoder: SuperpoderId, atual: TextoDaHistoria, ajuste: string): string {
  return [
    pedidoDaHistoria(briefing, idade, superpoder),
    '',
    'This is the current version of the story, which the family read:',
    JSON.stringify(atual),
    '',
    `The family asked for this change (in Portuguese): "${ajuste}".`,
    'Rewrite the story applying ONLY this change, keeping everything else as close as possible, and keeping every rule and the exact JSON shape.',
  ].join('\n');
}

/** Personagens que existem e que a história não pode trazer. */
const LICENCIADOS =
  /\b(disney|pixar|marvel|dc comics|pok[eé]mon|pikachu|peppa|bluey|patrulha canina|paw patrol|mickey|minnie|elsa|frozen|homem[- ]aranha|spider[- ]?man|batman|super[- ]?man|sonic|mario|barbie|hello kitty|galinha pintadinha|turma da m[oô]nica|cocomelon|patati|luccas neto)\b/i;
const GENERO_DA_CRIANCA = /\b(menino|menina|garoto|garota|garotinho|garotinha|menininho|menininha)\b/i;
const LIMITE_DO_TEXTO_DA_PAGINA = 280;

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
/** a IA adora travessão; o texto do site não tem, então vira vírgula */
const semTravessao = (t: string) => t.replace(/\s*[\u2013\u2014]\s*/g, ', ').replace(/,\s*([,.!?])/g, '$1');
/** só {NOME} fica entre chaves; qualquer outra variável é erro do modelo */
const outraVariavel = (t: string) => /[{}]/.test(t.replaceAll('{NOME}', ''));

/**
 * Confere o que a IA devolveu. Aceita o JSON puro, em texto ou embrulhado em
 * ```json. O que dá para consertar sem mudar o sentido (travessão, {NOME} nas
 * cenas) é consertado; o resto recusa, e o fluxo marca a história como falha.
 */
export function lerTextoDaHistoria(bruto: unknown): { ok: true; texto: TextoDaHistoria } | { ok: false; erro: string } {
  let dado = bruto;
  if (typeof dado === 'string') {
    const limpo = dado.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    try {
      dado = JSON.parse(limpo);
    } catch {
      return { ok: false, erro: 'a resposta não é JSON' };
    }
  }
  if (!dado || typeof dado !== 'object') return { ok: false, erro: 'resposta vazia' };
  const d = dado as Record<string, unknown>;

  const titulo = semTravessao(texto(d.titulo, 80));
  if (!titulo.includes('{NOME}')) return { ok: false, erro: 'o título não tem {NOME}' };
  const subtitulo = semTravessao(texto(d.subtitulo, 100));
  const cenario_en = texto(d.cenario_en, 400);

  const personagens = (Array.isArray(d.personagens) ? d.personagens : []).slice(0, 4).map((p) => {
    const x = (p && typeof p === 'object' ? p : {}) as Record<string, unknown>;
    return { nome: texto(x.nome, 24), especie: texto(x.especie, 30), jeito: semTravessao(texto(x.jeito, 120)), visual_en: texto(x.visual_en, 300) };
  });
  if (personagens.length === 0 || personagens.some((p) => !p.nome || !p.especie || !p.visual_en)) return { ok: false, erro: 'faltam os amigos da história' };

  const brutas = Array.isArray(d.paginas) ? d.paginas : [];
  if (brutas.length !== PAGINAS_DA_HISTORIA) return { ok: false, erro: `a história veio com ${brutas.length} páginas` };
  const paginas: PaginaDoTexto[] = [];
  for (const [i, p] of brutas.entries()) {
    const x = (p && typeof p === 'object' ? p : {}) as Record<string, unknown>;
    const t = semTravessao(texto(x.texto, 600));
    // a cena vai para a imagem: o nome nunca, nem como variável
    const cena = texto(x.cena_en, 700).replaceAll('{NOME}', 'the child');
    if (!t) return { ok: false, erro: `página ${i + 1} sem texto` };
    if ([...t].length > LIMITE_DO_TEXTO_DA_PAGINA) return { ok: false, erro: `página ${i + 1} com texto comprido demais` };
    if (!cena || !/\bthe child\b/i.test(cena)) return { ok: false, erro: `página ${i + 1} sem a criança na cena` };
    if (outraVariavel(t) || outraVariavel(cena)) return { ok: false, erro: `página ${i + 1} com variável estranha` };
    paginas.push({ texto: t, cena_en: cena });
  }
  if (!paginas.some((p) => p.texto.includes('{NOME}'))) return { ok: false, erro: 'a criança não aparece no texto' };

  const tudo = [titulo, subtitulo, cenario_en, ...personagens.flatMap((p) => [p.nome, p.especie, p.jeito, p.visual_en]), ...paginas.flatMap((p) => [p.texto, p.cena_en])].join('\n');
  if (LICENCIADOS.test(tudo)) return { ok: false, erro: 'personagem licenciado na história' };
  if (GENERO_DA_CRIANCA.test(tudo)) return { ok: false, erro: 'a história deu gênero à criança' };
  if (outraVariavel(titulo) || outraVariavel(subtitulo)) return { ok: false, erro: 'título com variável estranha' };

  return { ok: true, texto: { titulo, subtitulo, personagens, cenario_en, paginas } };
}

export const comNomeNaHistoria = (t: string, nome: string) => t.replaceAll('{NOME}', nome);

// -- a história no banco ------------------------------------------------------

export type HistoriaNoBanco = {
  id: string;
  criada_em: string;
  status: 'escrevendo' | 'pronta' | 'falhou';
  texto: TextoDaHistoria | null;
  pedido_id: string | null;
};

export function desistiuDaHistoria(h: Pick<HistoriaNoBanco, 'status' | 'criada_em'> & { pedida_em?: string | null }, agora: Date): boolean {
  const desde = new Date(h.pedida_em ?? h.criada_em).getTime();
  return h.status === 'escrevendo' && agora.getTime() - desde > MINUTOS_PARA_DESISTIR_DA_HISTORIA * 60 * 1000;
}

/** Quantas histórias novas ainda dá para pedir. Falha e história que virou pedido não contam. */
export function historiasRestantes(historias: (HistoriaNoBanco & { pedida_em?: string | null })[], agora: Date): number {
  const desde = agora.getTime() - JANELA_DAS_HISTORIAS_HORAS * 60 * 60 * 1000;
  const usadas = historias.filter(
    (h) => !h.pedido_id && new Date(h.criada_em).getTime() >= desde && (h.texto !== null || (h.status === 'escrevendo' && !desistiuDaHistoria(h, agora))),
  ).length;
  return Math.max(0, LIMITE_DE_HISTORIAS - usadas);
}

// -- o livro, depois do pagamento -----------------------------------------------

/**
 * O estilo de todas as imagens do livro sob medida: página de colorir no traço
 * da turma Little Paws. O fluxo anexa a arte da turma (REFERENCIA_DE_ESTILO),
 * a ficha aprovada da criança e a ficha dos amigos, nesta ordem.
 */
export const ESTILO_DAS_PAGINAS = `Create ONE coloring-book page for a children's picture book, portrait 2:3 canvas (1024x1536).
The FIRST attached image is the STYLE REFERENCE (the Little Paws team): draw in exactly the same hand-drawn picture-book style, round soft characters, big round heads, short chunky bodies, simple happy faces.
The SECOND attached image is the approved character sheet of the child: the child must look exactly like it on every page (face, hair, glasses, accessories, proportions, outfit).
The THIRD attached image is the cast sheet of the animal friends of this story: same faces, markings and accessories on every page.
Coloring page rules: thick clean black outlines, every area white, no gray, no shading, no color, no hatching. Keep the bottom 22% of the page plain white for the text. No text, letters, numbers or signs anywhere.`;

export type PaginaSobMedida = { pagina: number; texto: string; prompt: string };
export type PlanoSobMedida = {
  modelo: typeof ID_DO_MODELO_SOB_MEDIDA;
  titulo: string;
  subtitulo: string;
  ficha: { aprovada: { id: string; caminho: string } | null };
  historiaId: string;
  /** a ficha dos amigos, gerada primeiro, uma vez, e anexada em todas as páginas */
  elenco: { prompt: string };
  capa: { prompt: string };
  paginas: PaginaSobMedida[];
  presente: number[];
  certificado: { texto: string };
};

export function planoDaHistoria(entrada: { historiaId: string; nome: string; idade: number; personagem: Personagem; texto: TextoDaHistoria }): PlanoSobMedida {
  const { historiaId, nome, idade, personagem, texto: t } = entrada;
  const crianca = descreverCrianca(personagem, idade);
  const elenco = t.personagens.map((p) => `- ${p.visual_en}`).join('\n');
  const superpoder = SUPERPODERES.find((s) => s.id === personagem.superpoder)?.rotulo ?? '';
  return {
    modelo: ID_DO_MODELO_SOB_MEDIDA,
    titulo: comNomeNaHistoria(t.titulo, nome),
    subtitulo: t.subtitulo,
    ficha: { aprovada: null },
    historiaId,
    elenco: {
      prompt: `The FIRST attached image is the STYLE REFERENCE (the Little Paws team). Create ONE character sheet, on a plain white background, of these NEW original animal friends, side by side, full body, friendly poses, in exactly the same art style and full soft crayon colors:\n${elenco}\nRound, soft, two-legged little animals with no claws and no visible teeth. Do not draw the animals of the reference. No text, no labels.`,
    },
    capa: {
      prompt: `${ESTILO_DAS_PAGINAS}\nThis is the FRONT COVER, in full soft crayon colors instead of line art: the child (${crianca}) in the center, happy, with the friends around, in ${t.cenario_en} Keep the top 30% calm sky or plain background for the title.`,
    },
    paginas: t.paginas.map((p, i) => ({
      pagina: i + 1,
      texto: comNomeNaHistoria(p.texto, nome),
      prompt: `${ESTILO_DAS_PAGINAS}\nSetting: ${t.cenario_en}\nThe child: ${crianca}.\nScene: ${p.cena_en}`,
    })),
    presente: t.paginas.map((_, i) => i + 1),
    certificado: { texto: `Certificado oficial: ${nome} é a estrela desta história! Superpoder: ${superpoder}.` },
  };
}
