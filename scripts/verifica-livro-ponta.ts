// O livro automático de ponta a ponta, contra o site rodando e o Supabase falso
// (scripts/supabase-falso.mjs), que também faz o papel do n8n sem a OpenAI:
// pedido pago -> páginas -> trava -> PDF -> revisão do dono -> liberar -> aviso à família,
// e o caminho da falha (uma página recusada) com o "tentar de novo só o que faltou".
//
//   SITE=http://localhost:3100 FALSO=http://127.0.0.1:4556 npm run conferir:livro-ponta
// O site precisa subir com N8N_WEBHOOK_LIVRO=$FALSO/n8n-livro (o scripts/navegador.mjs explica o resto).
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { planoDoLivro } from '../lib/geracao.ts';
import { HISTORIA_BASQUETE } from '../lib/historias/basquete.ts';
import { chavesDoLivro, EMAIL_DO_DONO } from '../lib/livro.ts';
import { PERSONAGEM_INICIAL } from '../lib/personagem.ts';

const SITE = process.env.SITE ?? 'http://localhost:3100';
const FALSO = process.env.FALSO ?? 'http://127.0.0.1:4556';
const SERVICO = { apikey: 'chave-de-servico-falsa', authorization: 'Bearer chave-de-servico-falsa' };
let casos = 0;
const ok = (cond: boolean, msg: string) => {
  casos++;
  assert.ok(cond, msg);
};
const esperar = async <T>(f: () => Promise<T | null | undefined | false>, msg: string, ms = 60000): Promise<T> => {
  const fim = Date.now() + ms;
  for (;;) {
    const v = await f();
    if (v) return v;
    if (Date.now() > fim) throw new Error(`esperei demais: ${msg}`);
    await new Promise((r) => setTimeout(r, 400));
  }
};
type Linha = Record<string, unknown> & { id: string; livro_paginas?: string[] };
const pedidoNoFalso = async (id: string): Promise<Linha> => ((await (await fetch(`${FALSO}/__estado`)).json()).pedidos as Linha[]).find((p) => p.id === id)!;
const doN8n = async (): Promise<Record<string, unknown>[]> => (await fetch(`${FALSO}/__livro`)).json();
const arquivo = async (c: string) => Buffer.from(await (await fetch(`${FALSO}/__arquivo/${c}`)).arrayBuffer());

// um pedido pago do basquete, com a ficha aprovada no bucket (personagem fictício)
async function pedidoPago(nome: string): Promise<{ id: string; plano: ReturnType<typeof planoDoLivro> }> {
  const id = crypto.randomUUID();
  const fichaId = crypto.randomUUID();
  const plano = planoDoLivro({ tema: 'basquete', nome, idade: 6, produto: 'presente', personagem: PERSONAGEM_INICIAL });
  plano.ficha.aprovada = { id: fichaId, caminho: `${fichaId}.jpg` };
  const ficha = await sharp({ create: { width: 1536, height: 1024, channels: 3, background: '#ffd23f' } }).jpeg().toBuffer();
  await fetch(`${FALSO}/storage/v1/object/fichas/${fichaId}.jpg`, { method: 'POST', headers: SERVICO, body: new Uint8Array(ficha) });
  const r = await fetch(`${FALSO}/rest/v1/pedidos`, {
    method: 'POST',
    headers: { ...SERVICO, 'content-type': 'application/json' },
    body: JSON.stringify({
      id, tema: 'basquete', produto: 'presente', status: 'pago', nome_crianca: nome, idade: 6, dedicatoria: null, responsavel: 'Carla Teste',
      email: 'carla@teste.com', personagem: PERSONAGEM_INICIAL, plano, link_pdf: null, user_id: crypto.randomUUID(),
      livro_status: null, livro_token: null, livro_revisao: null, livro_pdf: null, livro_paginas: [], livro_erro: null, livro_avisos: [],
    }),
  });
  ok(r.ok, 'pedido de teste gravado no falso');
  return { id, plano };
}
const iniciar = (id: string) => fetch(`${SITE}/api/livro-auto/iniciar`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pedido_id: id }) }).then((r) => r.json());
const formulario = (rota: string, campos: Record<string, string>) => fetch(`${SITE}${rota}`, { method: 'POST', body: new URLSearchParams(campos), redirect: 'manual' });

// 1. O caminho feliz
const { id, plano } = await pedidoPago('Teodoro');
const chaves = chavesDoLivro('basquete', plano);
ok(chaves.length === 17 && chaves[0] === 'capa', `o livro pede a capa e as 16 páginas (${chaves.length})`);
ok((await iniciar(id)).iniciado === true, 'pedido pago começa o livro');
ok((await iniciar(id)).iniciado === false, 'o segundo aviso do mesmo pedido não começa outro livro');
const montado = await esperar(async () => (await doN8n()).find((x) => x.tipo === 'montar' && x.pedido_id === id), 'montagem do livro');
const resposta = montado as unknown as { status: string; paginas: number; email: { para: string; assunto: string; texto: string } };
ok(resposta.status === 'montado', `a montagem terminou (${JSON.stringify(montado).slice(0, 200)})`);
ok(resposta.paginas === 16, 'o PDF leva as 16 páginas da história');
ok(resposta.email.para === EMAIL_DO_DONO && resposta.email.assunto.includes('Teodoro entra na quadra!'), 'o e-mail de revisão vai para o dono, com o título do livro');
const montadoNoBanco = await pedidoNoFalso(id);
ok(montadoNoBanco.livro_status === 'montado' && montadoNoBanco.status === 'pdf_gerado' && montadoNoBanco.livro_token === null, 'pedido montado, bilhete morto');
ok(montadoNoBanco.link_pdf === null, 'antes de o dono liberar, a família não vê o PDF');
const pdf = await PDFDocument.load(await arquivo(`livros/${montadoNoBanco.livro_pdf}`));
ok(pdf.getPageCount() === 20, 'o PDF montado tem 20 páginas');
ok(!resposta.email.texto.includes('—') && !resposta.email.texto.includes('–'), 'e-mail sem travessão');

// a trava (01/11/2026, depois do teste do Tito): a página fica inteira como a OpenAI devolveu,
// sem colar a área sobre a cena (as emendas cortavam a bola e a perna do esquilo); o que mudou
// fora do lugar da criança vira aviso para o dono. O n8n falso tinge tudo e põe um quadrado preto
// fora da área: a página guardada tem que ter os dois, e o aviso tem que existir.
const p04 = await arquivo(`paginas/${(montadoNoBanco.livro_paginas as string[]).find((c) => c.endsWith('/p04.jpg'))}`);
const pixel = async (img: Buffer, x: number, y: number) => {
  const { data } = await sharp(img).extract({ left: x, top: y, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
  return [...data];
};
const [ax, ay, aw, ah] = HISTORIA_BASQUETE.paginas[3].areaPx!;
const dentro = await pixel(p04, ax + Math.round(aw / 2), ay + Math.round(ah / 2));
ok(dentro[0] - dentro[1] > 60, `dentro da área fica o que a OpenAI desenhou (${dentro})`);
const quadrado = await pixel(p04, 40, 40);
ok(quadrado[0] < 60 && quadrado[1] < 60, `fora da área a página também é a da OpenAI, sem emenda (${quadrado})`);
const avisos = montadoNoBanco.livro_avisos as string[];
ok(avisos.some((a) => a.startsWith('p04: a cena mudou')), `a mudança fora da área vira aviso para o dono (${avisos.length} avisos)`);
const tela0 = await (await fetch(`${SITE}/livro/revisar/${id}?chave=${String(montadoNoBanco.livro_revisao)}`)).text();
ok(tela0.includes('Páginas para olhar com atenção'), 'a revisão mostra os avisos');

// sem o bilhete certo, nada
ok((await fetch(`${SITE}/api/livro-auto/trabalho?id=${id}&token=errado`)).status === 404, 'trabalho sem bilhete: 404');
ok((await fetch(`${SITE}/api/livro-auto/cena?id=${id}&token=errado&chave=p01`)).status === 404, 'cena sem bilhete: 404 (as cenas não são públicas)');

// a revisão do dono: chave errada não abre; liberar põe o PDF na conta da família e avisa
const chave = String(montadoNoBanco.livro_revisao);
ok((await fetch(`${SITE}/livro/revisar/${id}?chave=errada`)).status === 404, 'revisão com chave errada: 404');
const tela = await (await fetch(`${SITE}/livro/revisar/${id}?chave=${chave}`)).text();
ok(tela.includes('Liberar para a família') && tela.includes('Abrir o PDF'), 'a revisão mostra o PDF e o botão de liberar');
ok((await formulario('/api/livro-auto/liberar', { id, chave: 'errada' })).status === 404, 'liberar com chave errada: 404');
ok((await formulario('/api/livro-auto/liberar', { id, chave })).status === 303, 'liberar volta para a revisão');
const liberado = await pedidoNoFalso(id);
ok(liberado.link_pdf === liberado.livro_pdf && liberado.status === 'entregue' && liberado.livro_status === 'liberado', 'liberado: o PDF vai para Meus livrinhos');
ok((liberado.livro_paginas as string[]).length === 0, 'as páginas soltas saem do bucket ao liberar (fica só o PDF)');
const aviso = await esperar(async () => (await doN8n()).find((x) => x.tipo === 'avisar' && x.pedido_id === id), 'aviso à família');
const emailFamilia = (aviso as { email?: { para: string; texto: string } }).email;
ok(emailFamilia?.para === 'carla@teste.com' && emailFamilia.texto.startsWith('Oi, Carla!'), 'a família recebe o aviso no e-mail do pedido');
ok(!/[—–]/.test(emailFamilia?.texto ?? ''), 'e-mail da família sem travessão');
ok((await fetch(`${SITE}/api/livro-auto/aviso?id=${id}&token=${(await pedidoNoFalso(id)).livro_token}`)).status === 404, 'o aviso não sai duas vezes');
ok((await formulario('/api/livro-auto/liberar', { id, chave })).status === 303 && (await pedidoNoFalso(id)).status === 'entregue', 'liberar de novo não muda nada');

// 2. A falha: uma página recusada, o dono é avisado e refaz só o que faltou
await fetch(`${FALSO}/__n8n-livro-falha?pagina=p07`);
const falha = await pedidoPago('Iara');
ok((await iniciar(falha.id)).iniciado === true, 'segundo pedido começa');
const falhou = (await esperar(async () => (await doN8n()).find((x) => x.tipo === 'montar' && x.pedido_id === falha.id), 'montagem com falha')) as unknown as {
  status: string;
  email: { para: string; assunto: string; texto: string };
};
ok(falhou.status === 'falhou' && falhou.email.para === EMAIL_DO_DONO && falhou.email.texto.includes('p07'), 'faltou a p07: o dono é avisado e nada vai à família');
const noBanco = await pedidoNoFalso(falha.id);
ok(noBanco.livro_status === 'falhou' && !noBanco.livro_pdf && (noBanco.livro_paginas as string[]).length === 16, 'falhou sem PDF, com as outras 16 imagens guardadas');
ok((await formulario('/api/livro-auto/refazer', { id: falha.id, chave: String(noBanco.livro_revisao), o_que: 'faltantes' })).status === 303, 'tentar de novo');
const refeito = await esperar(async () => (await doN8n()).filter((x) => x.pedido_id === falha.id && x.tipo === 'gerar').at(1), 'segunda geração');
ok(JSON.stringify((refeito as { itens: string[] }).itens) === '["p07"]', 'a segunda vez pede só a página que faltou');
await esperar(async () => (await pedidoNoFalso(falha.id)).livro_status === 'montado', 'livro montado depois de refazer');

// 3. O que nunca começa: pedido não pago
const naoPago = await pedidoPago('Bento');
await fetch(`${FALSO}/rest/v1/pedidos?id=eq.${naoPago.id}`, { method: 'PATCH', headers: { ...SERVICO, 'content-type': 'application/json' }, body: JSON.stringify({ status: 'aguardando_pagamento' }) });
ok((await iniciar(naoPago.id)).iniciado === false, 'pedido não pago não gasta nada');

console.log(`livro de ponta a ponta: ${casos} casos ok`);
