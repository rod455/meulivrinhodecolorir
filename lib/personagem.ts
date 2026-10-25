// O personagem da criança (livros-fonte/00-produto/personalizacao-spec.md):
// as escolhas do formulário, a validação e as descrições em inglês que vão
// para os prompts de imagem. Puro: conferido por `npm run conferir:personagem`.
//
// Duas formas no lançamento (decisão do dono, 18/10/2026): pelas características
// (botões) ou por foto. A foto só serve para gerar a ficha; dali em diante a
// referência é sempre a ficha desenhada, e a foto é apagada em 7 dias.

export type Opcao = { id: string; rotulo: string; prompt: string };

const opcoes = <T extends readonly Opcao[]>(lista: T) => lista;

export const APARENCIAS = opcoes([
  { id: 'menina', rotulo: 'Menina', prompt: 'girl' },
  { id: 'menino', rotulo: 'Menino', prompt: 'boy' },
  { id: 'crianca', rotulo: 'Prefiro não dizer', prompt: 'child' },
] as const);

export const ALTURAS = opcoes([
  { id: 'baixinha', rotulo: 'Mais baixinha', prompt: 'a little shorter than average' },
  { id: 'media', rotulo: 'Na média', prompt: 'average height' },
  { id: 'alta', rotulo: 'Mais alta', prompt: 'a little taller than average' },
] as const);

/** O tom de pele só pinta a capa colorida; no miolo a criança pinta. */
export const PELES = [
  { id: 'p1', rotulo: 'Tom 1', prompt: 'very light skin', cor: '#F6DCC6' },
  { id: 'p2', rotulo: 'Tom 2', prompt: 'light skin', cor: '#EBC3A2' },
  { id: 'p3', rotulo: 'Tom 3', prompt: 'light-medium skin', cor: '#D9A27E' },
  { id: 'p4', rotulo: 'Tom 4', prompt: 'medium skin', cor: '#C38662' },
  { id: 'p5', rotulo: 'Tom 5', prompt: 'medium-tan skin', cor: '#A86B48' },
  { id: 'p6', rotulo: 'Tom 6', prompt: 'brown skin', cor: '#8A5235' },
  { id: 'p7', rotulo: 'Tom 7', prompt: 'dark brown skin', cor: '#6B3C26' },
  { id: 'p8', rotulo: 'Tom 8', prompt: 'deep dark brown skin', cor: '#4A2A1C' },
] as const;

/**
 * No jeito "foto", a família também pode escolher o tom de pele (25/10/2026):
 * na primeira ficha por foto, o modelo estimou sozinho e escureceu a pele.
 * "Como na foto" fica de padrão, para quem não quiser escolher.
 */
export const PELE_DA_FOTO = 'foto';
export const PELES_COM_FOTO = [{ id: PELE_DA_FOTO, rotulo: 'Como na foto', prompt: '' }, ...PELES] as const;

export const CABELO_TIPOS = opcoes([
  { id: 'liso', rotulo: 'Liso', prompt: 'straight' },
  { id: 'ondulado', rotulo: 'Ondulado', prompt: 'wavy' },
  { id: 'cacheado', rotulo: 'Cacheado', prompt: 'curly' },
  { id: 'crespo', rotulo: 'Crespo', prompt: 'coily afro-textured' },
  { id: 'raspado', rotulo: 'Raspado ou bem curto', prompt: 'buzz-cut' },
] as const);

export const CABELO_COMPRIMENTOS = opcoes([
  { id: 'curto', rotulo: 'Curto', prompt: 'short' },
  { id: 'medio', rotulo: 'Médio', prompt: 'shoulder-length' },
  { id: 'longo', rotulo: 'Longo', prompt: 'long' },
] as const);

export const PENTEADOS = opcoes([
  { id: 'solto', rotulo: 'Solto', prompt: 'worn loose' },
  { id: 'rabo', rotulo: 'Rabo de cavalo', prompt: 'in a ponytail' },
  { id: 'chiquinhas', rotulo: 'Maria-chiquinha', prompt: 'in two pigtails' },
  { id: 'tranca', rotulo: 'Trança', prompt: 'in a braid' },
  { id: 'coque', rotulo: 'Coque', prompt: 'in a bun' },
  { id: 'black', rotulo: 'Black power', prompt: 'in a big rounded afro' },
] as const);

export const CABELO_CORES = opcoes([
  { id: 'preto', rotulo: 'Preto', prompt: 'black' },
  { id: 'castanho-escuro', rotulo: 'Castanho escuro', prompt: 'dark brown' },
  { id: 'castanho-claro', rotulo: 'Castanho claro', prompt: 'light brown' },
  { id: 'loiro', rotulo: 'Loiro', prompt: 'blond' },
  { id: 'ruivo', rotulo: 'Ruivo', prompt: 'red' },
] as const);

export const OCULOS = opcoes([
  { id: 'nao', rotulo: 'Sem óculos', prompt: '' },
  { id: 'redondos', rotulo: 'Óculos redondos', prompt: 'round glasses' },
  { id: 'retangulares', rotulo: 'Óculos retangulares', prompt: 'rectangular glasses' },
] as const);

/** Cadeira de rodas e aparelho auditivo pedem cenas próprias: fase 2 da spec. */
export const DETALHES = opcoes([
  { id: 'sardas', rotulo: 'Sardas', prompt: 'freckles' },
  { id: 'covinhas', rotulo: 'Covinhas', prompt: 'dimples' },
  { id: 'aparelho', rotulo: 'Aparelho nos dentes', prompt: 'dental braces' },
] as const);

export const ROUPAS = opcoes([
  { id: 'camiseta', rotulo: 'Camiseta e bermuda', prompt: 'T-shirt, shorts and sneakers' },
  { id: 'vestido', rotulo: 'Vestido', prompt: 'a simple dress and sneakers' },
  { id: 'macacao', rotulo: 'Macacão', prompt: 'overalls, T-shirt and sneakers' },
  { id: 'time', rotulo: 'Camiseta de time', prompt: 'a plain sports jersey, shorts and sneakers' },
] as const);

/** A cor favorita só pinta a roupa na capa colorida. */
export const CORES = [
  { id: 'vermelho', rotulo: 'Vermelho', prompt: 'red', cor: '#E5484D' },
  { id: 'laranja', rotulo: 'Laranja', prompt: 'orange', cor: '#FF8A3D' },
  { id: 'amarelo', rotulo: 'Amarelo', prompt: 'yellow', cor: '#FFD23F' },
  { id: 'verde', rotulo: 'Verde', prompt: 'green', cor: '#6CC26A' },
  { id: 'azul', rotulo: 'Azul', prompt: 'blue', cor: '#4FB3E8' },
  { id: 'roxo', rotulo: 'Roxo', prompt: 'purple', cor: '#8E6CD8' },
  { id: 'rosa', rotulo: 'Rosa', prompt: 'pink', cor: '#FF7EB6' },
  { id: 'branco', rotulo: 'Branco', prompt: 'white', cor: '#FFFFFF' },
] as const;

export const SUPERPODERES = [
  { id: 'coragem', rotulo: 'Coragem' },
  { id: 'criatividade', rotulo: 'Criatividade' },
  { id: 'gentileza', rotulo: 'Gentileza' },
  { id: 'bom_humor', rotulo: 'Bom humor' },
  { id: 'curiosidade', rotulo: 'Curiosidade' },
] as const;

export type SuperpoderId = (typeof SUPERPODERES)[number]['id'];
export type JeitoDoPersonagem = 'caracteristicas' | 'foto';

/** Versão do texto de consentimento da foto; muda junto com o texto em `TEXTO_DO_CONSENTIMENTO`. */
export const VERSAO_DO_CONSENTIMENTO = 'foto-crianca-v1';
export const TEXTO_DO_CONSENTIMENTO =
  'Sou mãe, pai ou responsável legal por esta criança e autorizo o uso desta foto apenas para criar o personagem desenhado do livro. A foto original será apagada automaticamente em 7 dias. O personagem desenhado fica guardado só para o meu pedido.';

export type Personagem = {
  jeito: JeitoDoPersonagem;
  aparencia: string;
  altura: string;
  pele: string;
  cabeloTipo: string;
  cabeloComprimento: string;
  penteado: string;
  cabeloCor: string;
  oculos: string;
  detalhes: string[];
  roupa: string;
  cor: string;
  superpoder: SuperpoderId;
  /** só no jeito "foto": caminho no armazenamento privado e o aceite do consentimento */
  foto: { caminho: string; consentimento: string } | null;
};

export const PERSONAGEM_INICIAL: Personagem = {
  jeito: 'caracteristicas',
  aparencia: 'crianca',
  altura: 'media',
  pele: 'p3',
  cabeloTipo: 'ondulado',
  cabeloComprimento: 'medio',
  penteado: 'solto',
  cabeloCor: 'castanho-escuro',
  oculos: 'nao',
  detalhes: [],
  roupa: 'camiseta',
  cor: 'azul',
  superpoder: 'coragem',
  foto: null,
};

const acha = <T extends { id: string }>(lista: readonly T[], id: unknown): T | undefined => lista.find((o) => o.id === id);

/** Valida o que veio do navegador campo a campo; nada de texto livre chega aos prompts. */
export function lerPersonagem(entrada: unknown): { ok: true; personagem: Personagem } | { ok: false; erro: string } {
  if (!entrada || typeof entrada !== 'object') return { ok: false, erro: 'Crie o personagem antes de continuar.' };
  const e = entrada as Record<string, unknown>;
  const jeito = e.jeito === 'foto' ? 'foto' : e.jeito === 'caracteristicas' ? 'caracteristicas' : null;
  if (!jeito) return { ok: false, erro: 'Escolha como criar o personagem.' };
  const superpoder = acha(SUPERPODERES, e.superpoder);
  if (!superpoder) return { ok: false, erro: 'Escolha o superpoder.' };
  const aparencia = acha(APARENCIAS, e.aparencia);
  const roupa = acha(ROUPAS, e.roupa);
  const cor = acha(CORES, e.cor);
  if (!aparencia || !roupa || !cor) return { ok: false, erro: 'Complete o personagem.' };

  let foto: Personagem['foto'] = null;
  if (jeito === 'foto') {
    const f = e.foto as Record<string, unknown> | null;
    const caminho = f && typeof f.caminho === 'string' ? f.caminho : '';
    // o caminho é sempre o que a rota de envio devolveu: fotos/<uuid>.jpg
    if (!/^fotos\/[0-9a-f-]{36}\.jpg$/.test(caminho)) return { ok: false, erro: 'Envie a foto da criança.' };
    if (!f || f.consentimento !== VERSAO_DO_CONSENTIMENTO) return { ok: false, erro: 'Marque a autorização para usar a foto.' };
    foto = { caminho, consentimento: VERSAO_DO_CONSENTIMENTO };
    return {
      ok: true,
      personagem: { ...PERSONAGEM_INICIAL, jeito, aparencia: aparencia.id, pele: acha(PELES, e.pele)?.id ?? PELE_DA_FOTO, roupa: roupa.id, cor: cor.id, superpoder: superpoder.id, foto },
    };
  }

  const campos = {
    altura: acha(ALTURAS, e.altura),
    pele: acha(PELES, e.pele),
    cabeloTipo: acha(CABELO_TIPOS, e.cabeloTipo),
    cabeloComprimento: acha(CABELO_COMPRIMENTOS, e.cabeloComprimento),
    penteado: acha(PENTEADOS, e.penteado),
    cabeloCor: acha(CABELO_CORES, e.cabeloCor),
    oculos: acha(OCULOS, e.oculos),
  };
  if (Object.values(campos).some((v) => !v)) return { ok: false, erro: 'Complete o personagem.' };
  const detalhes = Array.isArray(e.detalhes) ? [...new Set(e.detalhes.filter((d) => acha(DETALHES, d)))] as string[] : [];
  return {
    ok: true,
    personagem: {
      jeito,
      aparencia: aparencia.id,
      altura: campos.altura!.id,
      pele: campos.pele!.id,
      cabeloTipo: campos.cabeloTipo!.id,
      cabeloComprimento: campos.cabeloComprimento!.id,
      penteado: campos.penteado!.id,
      cabeloCor: campos.cabeloCor!.id,
      oculos: campos.oculos!.id,
      detalhes,
      roupa: roupa.id,
      cor: cor.id,
      superpoder: superpoder.id,
      foto: null,
    },
  };
}

const p = <T extends { id: string; prompt: string }>(lista: readonly T[], id: string) => acha(lista, id)?.prompt ?? '';

/** Altura relativa ao Bo nas cenas (spec do tema, seção 3.2). */
export function alturaNaCena(personagem: Personagem): string {
  if (personagem.altura === 'baixinha') return "about 82% of Bo's height";
  if (personagem.altura === 'alta') return "about 98% of Bo's height";
  return "about 90% of Bo's height";
}

/** {CHILD_SHORT}: curto, em inglês simples, só com o que se vê. */
export function descreverCrianca(personagem: Personagem, idade: number): string {
  const quem = `a ${idade}-year-old ${p(APARENCIAS, personagem.aparencia)}`;
  if (personagem.jeito === 'foto') return `${quem} exactly as drawn in the attached character sheet`;
  const raspado = personagem.cabeloTipo === 'raspado';
  const cabelo = raspado
    ? `${p(CABELO_CORES, personagem.cabeloCor)} buzz-cut hair`
    : `${p(CABELO_COMPRIMENTOS, personagem.cabeloComprimento)} ${p(CABELO_TIPOS, personagem.cabeloTipo)} ${p(CABELO_CORES, personagem.cabeloCor)} hair ${p(PENTEADOS, personagem.penteado)}`;
  const extras = [p(OCULOS, personagem.oculos), ...personagem.detalhes.map((d) => p(DETALHES, d))].filter(Boolean);
  return [`${quem} with ${cabelo}`, ...extras].join(', ');
}

export function roupaPropria(personagem: Personagem): string {
  return `the favorite outfit from the character sheet: ${p(ROUPAS, personagem.roupa)}`;
}

export const ROUPA_DO_TIME =
  'the Little Paws soccer uniform: short-sleeve jersey with the outlined paw emblem, shorts, long socks and cleats, plus the same glasses and hair accessories from the sheet';

/**
 * Prompt da ficha do personagem (spec, seção 7.2), com as escolhas já traduzidas.
 * O modelo não conhece o "Little Paws" pelo nome: o estilo vem da arte da turma,
 * que o fluxo do n8n anexa sempre como PRIMEIRA imagem (REFERENCIA_DE_ESTILO em
 * lib/ficha.ts). Sem ela, a ficha saía um desenho animado genérico (25/10/2026).
 */
export function promptDaFicha(personagem: Personagem, idade: number): string {
  const corpo = `${alturaNaCena(personagem).replace("of Bo's height", 'of the bear')}`;
  const linhas = [
    'The FIRST attached image is the STYLE REFERENCE: the Little Paws team (a bunny, a bear, a fox, a raccoon and a turtle). Create ONE character sheet of a NEW human child who looks like a new member of this team, drawn in EXACTLY the same art style as the reference.',
    'Copy the style precisely: hand-drawn children\'s picture-book cartoon (never clean vector clip art), slightly sketchy hand-inked dark brown outlines of medium-thick weight like the reference, big round head (about one third of the total height), short chunky body, short rounded arms and legs, small rounded hands, oversized chunky white sneakers. Same face style: large simple dark oval eyes with one small white highlight, tiny nose, wide open happy smile, small soft rosy cheeks. Soft colored-pencil and crayon coloring with visible light texture and very gentle shading, exactly like the reference.',
    `The child is ${idade} years old, ${p(ALTURAS, personagem.altura) || 'average height'} for the age (${corpo}).`,
  ];
  if (personagem.jeito === 'foto') {
    linhas.push(
      `Appearance: a ${p(APARENCIAS, personagem.aparencia)} wearing ${p(ROUPAS, personagem.roupa)}.`,
      'The SECOND attached image is a photo of the child. Use it ONLY as a loose reference for hairstyle, hair color, skin tone, glasses and general face shape, turning the child into a cartoon in the Little Paws style. Do not copy the photo realistically. If other people appear in the photo, ignore them.',
    );
  } else {
    linhas.push(`Appearance: ${descreverCrianca(personagem, idade)}; wearing ${p(ROUPAS, personagem.roupa)}.`);
  }
  const peleEscolhida = p(PELES, personagem.pele);
  const pele =
    personagem.jeito !== 'foto'
      ? `skin ${peleEscolhida}`
      : peleEscolhida
        ? `skin ${peleEscolhida}, chosen by the family: follow it exactly, even if the photo lighting looks different`
        : 'skin tone as in the photo, judged as in neutral daylight: do not darken it because of shadows, cold or warm light';
  const cabelo = personagem.jeito === 'foto' ? 'hair as in the photo' : `hair ${p(CABELO_CORES, personagem.cabeloCor)}`;
  linhas.push(
    'Take NO colors from the style reference for the child: the animals\' brown, orange and gray fur must never tint the skin, hair or clothes. The child\'s colors come only from this description.',
    'The outfit is the child\'s own clothes: plain, with NO paw emblem, logo or print (the paw emblem belongs only to the team uniform).',
    'Show ONLY this child, twice, side by side, standing, full body, friendly happy pose, on a plain white background. Do not draw any of the animals and do not copy the park background.',
    `Left: full color version, front view (${pele}, ${cabelo}, outfit in ${p(CORES, personagem.cor)}).`,
    'Right: the same child in three-quarter view as coloring-book line art: the same outlines in black, every area white, no gray, no shading, no color.',
    'No text, no labels.',
  );
  return linhas.join('\n');
}
