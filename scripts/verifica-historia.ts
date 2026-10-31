// A história sob medida (31/10/2026): o nome da criança nunca vai para a IA
// nem para o prompt de imagem, o texto que a IA devolve segue as regras da
// turma (16 páginas, a criança em todas as cenas, sem gênero, sem travessão,
// sem personagem licenciado), o limite de histórias e o pedido exige a
// história aprovada. Se isto quebrar, o nome de uma criança vai para a OpenAI.
//
// Rode com: npm run conferir:historia
import assert from 'node:assert/strict';
import {
  BRIEFING_INICIAL,
  historiasRestantes,
  INSTRUCOES_DA_HISTORIA,
  lerBriefing,
  lerTextoDaHistoria,
  limparTextoLivre,
  pedidoDaHistoria,
  pedidoDoAjuste,
  PAGINAS_DA_HISTORIA,
  planoDaHistoria,
  type HistoriaNoBanco,
  type TextoDaHistoria,
} from '../lib/historia.ts';
import { lerPedido } from '../lib/pedido.ts';
import { PERSONAGEM_INICIAL } from '../lib/personagem.ts';
import { PRODUTOS, totalDoPedido } from '../lib/produtos.ts';
import { caminhoDoTema, TEMAS_DO_CAMINHO } from '../lib/temas.ts';

let casos = 0;
const ok = (cond: boolean, msg: string) => {
  casos++;
  assert.ok(cond, msg);
};

// 1. o nome sai de todo texto livre, com acento ou sem, em qualquer caixa
const NOME = 'Maria Júlia';
const limpo = limparTextoLivre('A maria julia adora dinossauros e a MARIA JÚLIA tem um gato. Júlia ri muito', NOME, 200);
ok(!/maria|j[uú]lia/i.test(limpo), `o nome saiu do texto: "${limpo}"`);
ok(limpo.includes('{NOME}'), 'virou {NOME}');
ok(limparTextoLivre('O Théo adora bolo', 'Theo', 80) === 'O {NOME} adora bolo', 'sem acento no cadastro, com acento no texto');
ok(limparTextoLivre('Teodoro é o avô do Teo', 'Teo', 80).startsWith('Teodoro'), 'só a palavra inteira');
ok(!/\d{4}/.test(limparTextoLivre('mora na rua 1234, tel (11) 91234-5678, cep 01234-000', 'Bia', 160)), 'número comprido sai (telefone, CEP, endereço)');
ok(limparTextoLivre('tem 2 gatos', 'Bia', 80) === 'tem 2 gatos', 'número curto fica');
ok(!limparTextoLivre('mande para bia@exemplo.com ou www.site.com.br', 'Ana', 80).match(/@|www/), 'e-mail e link saem');
ok(!/[{}<>]/.test(limparTextoLivre('{IDADE} <b>oi</b>', 'Ana', 80)), 'sem chaves nem tags que confundem o modelo');
ok(!/[–—]/.test(limparTextoLivre('gosta de bolo — e de pipa', 'Ana', 80)), 'sem travessão');
ok([...limparTextoLivre('a'.repeat(300), 'Ana', 80)].length <= 80, 'corta no limite');

// 2. o briefing
const briefingBom = { ...BRIEFING_INICIAL, lugar: 'praia', licao: 'coragem', gosta: 'A Bia adora conchas', bichinho: { especie: 'cachorro', nome: 'Pipoca' }, detalhe: 'Bia tem medo do mar' };
const lido = lerBriefing(briefingBom, 'Bia');
ok(lido.ok, 'briefing completo passa');
if (lido.ok) {
  ok(!JSON.stringify(lido.briefing).includes('Bia'), 'o briefing guardado não tem o nome');
  const pedido = pedidoDaHistoria(lido.briefing, 5, 'coragem');
  ok(!pedido.includes('Bia'), 'o pedido à IA não tem o nome');
  ok(pedido.includes('Pipoca') && pedido.includes('cachorro'), 'o bichinho vai junto');
  ok(pedido.includes('Coragem'), 'o superpoder vai junto');
}
ok(!lerBriefing({ ...briefingBom, lugar: 'marte' }, 'Bia').ok, 'lugar fora da lista recusa');
ok(!lerBriefing({ ...briefingBom, licao: undefined }, 'Bia').ok, 'sem lição recusa');
ok(!lerBriefing({ ...briefingBom, gosta: 'Bia' }, 'Bia').ok, 'gosta só com o nome recusa');
const semBicho = lerBriefing({ ...briefingBom, bichinho: { especie: '', nome: 'Rex' } }, 'Bia');
ok(semBicho.ok && semBicho.briefing.bichinho === null, 'bichinho sem espécie fica de fora');
ok(INSTRUCOES_DA_HISTORIA.includes(String(PAGINAS_DA_HISTORIA)) && INSTRUCOES_DA_HISTORIA.includes('{NOME}'), 'as instruções falam das 16 páginas e de {NOME}');

// 3. o texto que a IA devolve
const pagina = (i: number) => ({ texto: `{NOME} e a Lili viram a onda número ${i}. "Uau!", disse a Lili.`, cena_en: `The child and Lili the bunny look at a gentle wave on the beach, page ${i}.` });
type Bruto = { titulo: string; subtitulo: string; personagens: unknown[]; cenario_en: string; paginas: { texto: string; cena_en: string }[] };
const bom = (): Bruto => ({
  titulo: '{NOME} e o mar de conchas',
  subtitulo: 'Uma história sobre coragem',
  personagens: [{ nome: 'Lili', especie: 'coelha', jeito: 'Corajosa e risonha', visual_en: 'a small cream bunny with a blue scarf' }],
  cenario_en: 'a calm sunny beach.',
  paginas: Array.from({ length: 16 }, (_, i) => pagina(i + 1)),
});
const r1 = lerTextoDaHistoria(JSON.stringify(bom()));
ok(r1.ok, `o texto certo passa (${!r1.ok ? r1.erro : ''})`);
ok(lerTextoDaHistoria('```json\n' + JSON.stringify(bom()) + '\n```').ok, 'aceita embrulhado em ```json');
ok(!lerTextoDaHistoria('não sei').ok, 'texto que não é JSON recusa');
ok(!lerTextoDaHistoria({ ...bom(), paginas: bom().paginas.slice(0, 15) }).ok, '15 páginas recusa');
ok(!lerTextoDaHistoria({ ...bom(), titulo: 'O mar de conchas' }).ok, 'título sem {NOME} recusa');
const semCrianca = bom();
semCrianca.paginas[4].cena_en = 'Lili the bunny alone on the beach.';
ok(!lerTextoDaHistoria(semCrianca).ok, 'cena sem a criança recusa');
const nomeNaCena = bom();
nomeNaCena.paginas[2].cena_en = '{NOME} runs on the sand with Lili.';
const r2 = lerTextoDaHistoria(nomeNaCena);
ok(r2.ok && !r2.texto.paginas[2].cena_en.includes('{NOME}') && r2.texto.paginas[2].cena_en.includes('the child'), '{NOME} na cena vira "the child"');
const comTravessao = bom();
comTravessao.paginas[0].texto = '{NOME} correu — e riu muito.';
const r3 = lerTextoDaHistoria(comTravessao);
ok(r3.ok && !/[–—]/.test(r3.texto.paginas[0].texto), 'travessão vira vírgula');
const licenciado = bom();
licenciado.paginas[7].texto = '{NOME} encontrou a Peppa na praia.';
ok(!lerTextoDaHistoria(licenciado).ok, 'personagem licenciado recusa');
const comGenero = bom();
comGenero.paginas[1].texto = 'O menino {NOME} correu.';
ok(!lerTextoDaHistoria(comGenero).ok, 'gênero para a criança recusa');
const outraVar = bom();
outraVar.paginas[3].texto = '{NOME} tem {IDADE} anos.';
ok(!lerTextoDaHistoria(outraVar).ok, 'outra variável recusa');
const comprido = bom();
comprido.paginas[5].texto = '{NOME} ' + 'andou '.repeat(60);
ok(!lerTextoDaHistoria(comprido).ok, 'página comprida demais recusa');
ok(!lerTextoDaHistoria({ ...bom(), personagens: [] }).ok, 'sem amigos recusa');

// 4. o ajuste leva a história atual
if (r1.ok && lido.ok) {
  const ajuste = pedidoDoAjuste(lido.briefing, 5, 'coragem', r1.texto, 'troque a coelha por uma tartaruga');
  ok(ajuste.includes('tartaruga') && ajuste.includes('mar de conchas'), 'o ajuste vai com a história atual e o pedido');
}

// 5. o livro: o nome nos textos, nunca nos prompts de imagem
if (r1.ok) {
  const texto: TextoDaHistoria = r1.texto;
  const plano = planoDaHistoria({ historiaId: crypto.randomUUID(), nome: 'Bia', idade: 5, personagem: { ...PERSONAGEM_INICIAL, superpoder: 'coragem' }, texto });
  ok(plano.paginas.length === 16 && plano.presente.length === 16, 'dezesseis páginas no plano');
  ok(plano.titulo === 'Bia e o mar de conchas', 'o nome entra no título');
  ok(plano.paginas.every((p) => p.texto.includes('Bia') && !p.texto.includes('{NOME}')), 'o nome entra nos textos');
  const prompts = [plano.elenco.prompt, plano.capa.prompt, ...plano.paginas.map((p) => p.prompt)];
  ok(prompts.every((p) => !/\bBia\b/.test(p) && !p.includes('{NOME}')), 'o nome nunca vai para o prompt de imagem');
  ok(plano.paginas.every((p) => p.prompt.includes('STYLE REFERENCE') && p.prompt.includes('coloring')), 'toda página no estilo da turma, para colorir');
  ok(plano.certificado.texto.includes('Coragem'), 'o certificado leva o superpoder');
}

// 6. o limite: 3 histórias novas por dia; falha e pedido não contam
const agora = new Date('2026-10-31T15:00:00Z');
const h = (horas: number, status: HistoriaNoBanco['status'] = 'pronta', comTexto = true, pedido_id: string | null = null): HistoriaNoBanco => ({
  id: crypto.randomUUID(),
  criada_em: new Date(agora.getTime() - horas * 3600e3).toISOString(),
  status,
  texto: comTexto ? ({} as TextoDaHistoria) : null,
  pedido_id,
});
ok(historiasRestantes([], agora) === 3, 'sem nada, 3');
ok(historiasRestantes([h(1), h(2), h(3)], agora) === 0, 'três prontas, acabou');
ok(historiasRestantes([h(1, 'falhou', false), h(2, 'falhou', false)], agora) === 3, 'falha não conta');
ok(historiasRestantes([h(1, 'pronta', true, crypto.randomUUID())], agora) === 3, 'a que virou pedido não conta');
ok(historiasRestantes([h(25), h(30)], agora) === 3, 'as de ontem não contam');
ok(historiasRestantes([h(0.02, 'escrevendo', false)], agora) === 2, 'a que está escrevendo conta');
ok(historiasRestantes([h(0.5, 'escrevendo', false)], agora) === 3, 'a que travou não conta');
ok(historiasRestantes([h(1, 'escrevendo', true)], agora) === 2, 'um ajuste que travou não devolve a história');

// 7. o produto, o caminho e o pedido
ok(PRODUTOS['sob-medida'].preco === 3990, 'R$ 39,90 (decisão do dono, 31/10/2026)');
ok(totalDoPedido('sob-medida', 'pix') === 3790, 'Pix com 5%, arredondado para baixo');
ok(caminhoDoTema('sob-medida') === 'sob-medida' && TEMAS_DO_CAMINHO.turma.every((t) => t.id !== 'sob-medida'), 'a sob medida é um caminho só dela');
const base = {
  produto: 'sob-medida',
  tema: 'sob-medida',
  nome: 'Bia',
  idade: 5,
  responsavel: 'Ana',
  email: 'ana@exemplo.com',
  whatsapp: '11912345678',
  personagem: PERSONAGEM_INICIAL,
  fichaId: crypto.randomUUID(),
  historiaId: crypto.randomUUID(),
};
const p1 = lerPedido(base);
ok(p1.ok && p1.pedido.historiaId === base.historiaId && p1.pedido.total === 3790, 'pedido da sob medida com a história aprovada');
const p2 = lerPedido({ ...base, historiaId: null });
ok(!p2.ok && Boolean(p2.erros.historiaId), 'sem história aprovada, não paga');
ok(!lerPedido({ ...base, produto: 'presente' }).ok, 'a sob medida não sai pelo preço do Presente');
ok(!lerPedido({ ...base, tema: 'futebol' }).ok, 'nem o preço da sob medida num tema da turma');
const p3 = lerPedido({ ...base, produto: 'presente', tema: 'futebol' });
ok(p3.ok && p3.pedido.historiaId === null, 'nos outros temas a história não entra');

console.log(`conferir:historia ok, ${casos} casos`);
