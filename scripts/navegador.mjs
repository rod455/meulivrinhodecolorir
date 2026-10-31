// Suíte de navegador: percorre a LP, o fluxo do pedido e a conta como uma
// pessoa no celular. Roda contra o Supabase de mentira (scripts/supabase-falso.mjs),
// porque o ambiente de teste não alcança o de verdade:
//
//   npm i --no-save playwright
//   node scripts/supabase-falso.mjs 4556 /tmp/sf.jsonl http://localhost:3100 &
//   F=http://127.0.0.1:4556; NEXT_PUBLIC_SUPABASE_URL=$F NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-falsa npx next build
//   NEXT_PUBLIC_SUPABASE_URL=$F NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-falsa SUPABASE_URL=$F \
//     SUPABASE_SERVICE_ROLE_KEY=chave-de-servico-falsa N8N_WEBHOOK_PEDIDO=$F/n8n \
//     N8N_WEBHOOK_FICHA=$F/n8n-ficha N8N_WEBHOOK_TURMA=$F/n8n-turma \
//     N8N_WEBHOOK_HISTORIA=$F/n8n-historia CRON_SECRET=teste npx next start -p 3100 &
//   SITE=http://localhost:3100 FALSO=$F REGISTRO=/tmp/sf.jsonl npm run conferir:navegador
import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import sharp from 'sharp';

const SITE = process.env.SITE ?? 'http://localhost:3000';
const FALSO = process.env.FALSO ?? 'http://127.0.0.1:4556';
const REGISTRO = process.env.REGISTRO ?? '/tmp/sf.jsonl';
const CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const navegador = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {});
const erros = [];
const novaPagina = async () => {
  const contexto = await navegador.newContext({ viewport: { width: 390, height: 844 } });
  const pagina = await contexto.newPage();
  pagina.on('pageerror', (e) => erros.push(e.message));
  return pagina;
};
// o personagem tem telinhas curtas (quem é, cabelo, roupa e cor, superpoder; pela foto, sem a do cabelo)
const ateOCabelo = async (pg) => {
  await pg.getByRole('heading', { name: 'Quem é' }).waitFor();
  await pg.getByRole('button', { name: 'Continuar' }).click();
  await pg.getByRole('heading', { name: 'Cabelo', exact: true }).waitFor();
};
const ateOSuperpoder = async (pg) => {
  const titulo = pg.locator('h2.parte-titulo');
  for (let i = 0; i < 4 && (await titulo.textContent()) !== 'Superpoder'; i++) {
    const antes = await titulo.textContent();
    await pg.getByRole('button', { name: 'Continuar' }).click();
    await pg.waitForFunction((t) => document.querySelector('h2.parte-titulo')?.textContent !== t, antes);
  }
  assert.equal(await titulo.textContent(), 'Superpoder', 'chegou à telinha do superpoder');
};
const estado = async () => (await fetch(`${FALSO}/__estado`)).json();
const ultimoAvisoAoN8n = () => JSON.parse(readFileSync(`${REGISTRO}.n8n`, 'utf8').trim().split('\n').at(-1));

const p = await novaPagina();

// LP redesenhada (31/10/2026): os dois caminhos (o filho na história da turma ou uma história só dele), e o nome
// digitado no topo acompanha a página inteira
await p.goto(`${SITE}/?utm_source=teste&utm_campaign=suite`);
// SEO e IAs (31/10/2026): dados estruturados válidos, imagem de compartilhamento, canônico só onde deve e o /llms.txt
const ld = JSON.parse(await p.locator('script[type="application/ld+json"]').textContent());
const tipos = ld['@graph'].map((x) => x['@type']);
assert.equal(tipos.filter((t) => t === 'Book').length, 4, 'os quatro livros publicados nos dados estruturados');
assert.equal(tipos.filter((t) => t === 'Service').length, 2, 'os dois caminhos como serviços');
assert.ok(['Organization', 'WebSite', 'BookSeries', 'FAQPage'].every((t) => tipos.includes(t)), 'organização, site, série e FAQ');
assert.ok(!JSON.stringify(ld).includes('R$') && !JSON.stringify(ld).includes('price'), 'sem preço nos dados estruturados (por enquanto)');
assert.match(await p.locator('meta[property="og:image"]').getAttribute('content'), /opengraph-image/, 'a página tem imagem de compartilhamento');
assert.equal(await p.locator('link[rel="canonical"]').getAttribute('href'), `https://meulivrinhodecolorir.com.br`, 'a página inicial é canônica dela mesma');
const paraIas = await fetch(`${SITE}/llms.txt`);
assert.equal(paraIas.status, 200, 'o /llms.txt existe');
const textoParaIas = await paraIas.text();
assert.ok(['# Meu Livrinho de Colorir', 'Faça parte da história', 'Crie a sua própria história', 'Kiko (porco-espinho)', 'O que é a turma Little Paws?'].every((t) => textoParaIas.includes(t)), 'o /llms.txt explica os caminhos, a turma e o FAQ');
assert.ok(!textoParaIas.includes('R$'), 'o /llms.txt não fala de preço');
const entrarHtml = await (await fetch(`${SITE}/entrar`)).text();
assert.ok(!/rel="canonical" href="https:\/\/meulivrinhodecolorir\.com\.br"/.test(entrarHtml), 'o canônico da página inicial não vaza para outras páginas');

// o topo tem as três portas (dono, 31/10/2026), cada uma para uma seção da página
const portas = p.locator('.topo .porta');
assert.equal(await portas.count(), 3, 'o topo oferece as três portas');
assert.deepEqual(await portas.evaluateAll((as) => as.map((a) => a.getAttribute('href'))), ['#turma', '#fazer-parte', '#propria'], 'cada porta leva à sua seção');
for (const id of ['turma', 'fazer-parte', 'propria']) assert.equal(await p.locator(`#${id}`).count(), 1, `a seção #${id} existe`);
assert.equal(await p.locator('#fazer-parte a.botao').getAttribute('href'), '/criar?caminho=turma&tema=futebol', 'faça parte leva ao futebol da turma');
assert.equal(await p.locator('#propria a.botao').getAttribute('href'), '/criar?caminho=sob-medida', 'a sua própria história leva à sob medida');
assert.equal(await p.locator('a[href*="caminho=zero"]').count(), 0, 'o caminho do zero saiu da página (o objetivo são os dois caminhos)');
assert.equal(await p.locator('#turma .amigo-cartao').count(), 6, 'a turma inteira se apresenta');
const retratos = await p.locator('#turma .amigo-cartao img.amigo-retrato').evaluateAll((imgs) => imgs.map((i) => i.getAttribute('src') ?? ''));
assert.equal(new Set(retratos).size, 6, 'cada amigo tem o próprio retrato, inclusive o Kiko');
assert.equal(await p.locator('#little-paws').getByText(/R\$/).filter({ visible: true }).count(), 0, 'preço só aparece se a pessoa abrir o livro original');
const colocar = p.locator('#little-paws').getByRole('link', { name: 'Colocar meu filho' });
assert.equal(await colocar.count(), 1, 'só a história com personalizado pronto oferece colocar o filho');
assert.equal(await colocar.getAttribute('href'), '/criar?caminho=turma&tema=futebol', 'e leva ao futebol pela turma');
assert.equal(await p.locator('#little-paws').getByText(/Em breve: seu filho jogando com/).count(), 3, 'as outras histórias dizem em breve');
assert.equal(await p.locator('#little-paws img[alt^="Capa do livro"]').count(), 4, 'cada livro com a capa de verdade');
// as capas aparecem inteiras (sem corte) e todas na mesma altura (dono, 31/10/2026)
const capas = await p.locator('#little-paws img.aventura-capa').evaluateAll((imgs) => imgs.map((i) => ({ h: Math.round(i.getBoundingClientRect().height), corte: getComputedStyle(i).objectFit })));
assert.ok(capas.every((c) => c.corte === 'contain'), 'nenhuma capa cortada');
assert.ok(Math.max(...capas.map((c) => c.h)) - Math.min(...capas.map((c) => c.h)) <= 2, `capas na mesma altura: ${capas.map((c) => c.h).join(', ')}`);
// os livros publicados da turma, em inglês: os três aparecem, e sem link de verdade não há botão
const publicados = p.locator('#little-paws article');
assert.equal(await publicados.count(), 4, 'os quatro livros publicados da turma aparecem na LP');
assert.equal(await publicados.filter({ hasText: 'Em inglês' }).count(), 3, 'os três primeiros dizem que são em inglês');
assert.equal(await publicados.filter({ hasText: 'Em português' }).count(), 1, 'o de futebol diz que é em português');
// na Amazon, à vista em cada livro: o de história, o e-book e o de colorir (dono, 31/10/2026)
const naAmazon = p.locator('#little-paws a[target="_blank"]');
assert.equal(await naAmazon.count(), 8, 'cinco livros físicos e três Kindle na Amazon');
assert.equal(await naAmazon.evaluateAll((as) => as.filter((a) => !/^https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]{10}$/.test(a.href)).length), 0, 'só links da Amazon');
const botoesDo = async (titulo) => (await p.locator('#little-paws article').filter({ hasText: titulo }).locator('.na-amazon a').allTextContents()).join('|');
assert.equal(await botoesDo('Big Game'), 'Livro de história|E-book (Kindle)|Livro de colorir', 'o Big Game com os três formatos, à vista');
assert.equal(await botoesDo('Big Play'), 'Livro de história|E-book (Kindle)|Livro de colorir', 'o Big Play com os três formatos');
assert.equal(await botoesDo('Big Christmas'), 'Livro de história|E-book (Kindle)', 'o Natal sem o de colorir até chegar o link');
assert.ok(await p.locator('#livro-big-game .na-amazon a', { hasText: 'Livro de colorir' }).isVisible(), 'os links da Amazon não ficam escondidos');
assert.equal(await p.locator('#little-paws a', { hasText: 'Impresso R$ 79,90' }).count(), 7, 'cada edição tem o impresso a R$ 79,90');
// "compre e imprima você mesmo": o PDF de cada edição, à vista em cada livro (dono, 31/10/2026)
const pdfs = p.locator('#little-paws .imprima-voce a');
assert.equal(await pdfs.count(), 7, 'cada edição tem o PDF para imprimir em casa');
assert.ok(await pdfs.first().isVisible(), 'o PDF fica à vista, não escondido');
assert.ok((await pdfs.evaluateAll((as) => as.map((a) => a.getAttribute('href')))).every((h) => /^\/turma\/comprar\?edicao=[a-z-]+&formato=pdf$/.test(h)), 'todo PDF leva à compra do PDF');
assert.equal(await p.locator('#livro-grande-final .imprima-voce a').textContent(), 'Livro de história em PDF', 'a Grande Final, que não está na Amazon, tem o PDF');
// todos os livros no mesmo padrão: só "Livro de história em PDF" e "Livro de colorir em PDF", numa linha cada (dono, 31/10/2026)
assert.ok((await pdfs.allTextContents()).every((t) => t === 'Livro de história em PDF' || t === 'Livro de colorir em PDF'), 'os PDFs com os mesmos dois rótulos em todos os livros');
const alturasDosBotoes = await p.locator('#little-paws .loja-linha a').evaluateAll((as) => as.map((a) => Math.round(a.getBoundingClientRect().height)));
assert.ok(Math.max(...alturasDosBotoes) - Math.min(...alturasDosBotoes) <= 2, `nenhum botão quebra em duas linhas: ${alturasDosBotoes.join(', ')}`);
// quem já tem conta acha o "Entrar" no cabeçalho, também no celular, onde o menu some
const entrarNoTopo = p.locator('header').getByRole('link', { name: 'Entrar', exact: true });
assert.ok(await entrarNoTopo.isVisible(), 'Entrar à vista no cabeçalho do celular');
assert.equal(await entrarNoTopo.getAttribute('href'), '/entrar?next=/conta', 'Entrar leva ao login e volta para os livrinhos');
await p.fill('#nome-lp', 'joão pedro');
assert.equal(await p.locator('#fazer-parte a.botao[href*="nome=Jo%C3%A3o+Pedro"], #propria a.botao[href*="nome=Jo%C3%A3o+Pedro"]').count(), 2, 'o nome arrumado vai nos dois caminhos');
assert.equal(await p.locator('.folha-capa-titulo').textContent(), 'João Pedro entra em campo!', 'o livro de exemplo leva o nome');
await p.getByRole('button', { name: 'Próxima página' }).click();
await p.locator('.folha-texto', { hasText: 'Logo atrás dela vinha João Pedro!' }).waitFor();
await p.locator('#propria').getByText('João Pedro e o mar de conchas').waitFor();
// o caminho do zero continua de pé para os links antigos (anúncios), só saiu da página
await p.goto(`${SITE}/criar?caminho=zero&tema=natal&nome=jo%C3%A3o%20pedro`);

// sem produto no link: começa pela escolha do produto e pula o tema, que já veio
await p.getByRole('button', { name: /Livrinho presente/ }).click();
await p.getByRole('heading', { name: 'Agora, o nome' }).waitFor();
assert.equal(await p.inputValue('#nome'), 'João Pedro', 'nome veio da LP arrumado');

// palavrão não passa da personalização
await p.fill('#nome', 'merda');
await p.getByRole('button', { name: 'Continuar' }).click();
await p.getByText('Esse nome não pode ir para a capa').first().waitFor();
await p.fill('#nome', 'Laura');
// a dedicatória é opcional e abre ao toque, para a etapa do nome ficar curta
assert.equal(await p.locator('#dedicatoria').count(), 0, 'dedicatória fechada até a pessoa pedir');
await p.getByRole('button', { name: /Adicionar dedicatória/ }).click();
await p.getByRole('button', { name: /Feliz aniversário/ }).click();
await p.getByRole('button', { name: 'Continuar' }).click();

// para comprar precisa de conta: sem ela, nem aparece o botão de pagar
await p.getByRole('heading', { name: 'Falta pouco: sua conta' }).waitFor();
assert.equal(await p.locator('.barra-fixa').count(), 0, 'sem botão, a barra fixa não cobre o formulário de conta');
assert.equal(await p.getByRole('button', { name: /Pagar com/ }).count(), 0, 'sem conta, sem botão de pagar');
assert.ok(await p.getByRole('button', { name: /com o Google/ }).isVisible(), 'Google aparece quando está ligado no Supabase');
await p.fill('#conta-email', 'carla@exemplo.com.br');
await p.fill('#conta-senha', '1234');
await p.getByRole('button', { name: 'Criar conta' }).last().click();
await p.getByText('A senha precisa ter pelo menos 8 caracteres.').waitFor();
await p.fill('#conta-senha', 'senha-boa-123');
await p.getByRole('button', { name: 'Criar conta' }).last().click();

// com a conta, o formulário de entrega e o pagamento
await p.getByRole('heading', { name: 'Para onde mandamos?' }).waitFor();
await p.getByText('carla@exemplo.com.br').first().waitFor();
assert.equal(await p.locator('#email').count(), 0, 'o e-mail vem da conta, não de um campo');
await p.getByRole('button', { name: 'Pagar com Pix' }).click();
await p.getByText('Digite seu nome.').waitFor();
await p.fill('#responsavel', 'Carla Teste');
await p.fill('#whatsapp', '(11) 91234-5678');
assert.ok(await p.getByText('R$ 23,65').first().isVisible(), 'total com desconto do Pix na tela');
assert.ok(await p.locator('.barra-fixa').getByText('no Pix').isVisible(), 'a barra diz que o valor é o do Pix');
await p.getByRole('button', { name: 'Pagar com Pix' }).click();
await p.waitForURL(/\/obrigado\?pedido=/, { timeout: 15000 });
await p.getByRole('heading', { name: 'Pedido recebido!' }).waitFor();

let { pedido } = ultimoAvisoAoN8n();
const carla = (await estado()).pedidos.at(-1).user_id;
assert.equal(pedido.nome_crianca, 'Laura');
assert.equal(pedido.produto, 'presente');
assert.equal(pedido.tema, 'natal');
assert.equal(pedido.total_centavos, 2365, 'preço recalculado no servidor');
assert.equal(pedido.whatsapp, '5511912345678');
assert.equal(pedido.email, 'carla@exemplo.com.br', 'e-mail do pedido é o da conta');
assert.ok(pedido.user_id && pedido.user_id === carla, 'pedido ligado à conta');
assert.match(pedido.dedicatoria, /^Feliz aniversário/);
assert.equal(pedido.origem.utm_source, 'teste', 'UTM da primeira página chega no pedido');

// o /criar começa pela mesma escolha da página: os dois caminhos
const vitrine = await novaPagina();
await vitrine.goto(`${SITE}/criar`);
await vitrine.getByRole('heading', { name: 'Como você quer começar?' }).waitFor();
assert.equal(await vitrine.locator('.escolhas-caminho .escolha').count(), 2, 'o começo tem os dois caminhos');
await vitrine.getByRole('button', { name: /Com a turma Little Paws/ }).click();
await vitrine.getByRole('heading', { name: /Em que história/ }).waitFor();
assert.equal(await vitrine.locator('.selo-personagem').count(), 1, 'na turma, o futebol com personagem');
assert.equal(await vitrine.locator('.escolha-em-breve').count(), 3, 'e as outras histórias em breve');
await vitrine.getByRole('button', { name: /Voltar/ }).click();
await vitrine.getByRole('button', { name: /História 100% personalizada/ }).click();
await vitrine.getByRole('heading', { name: 'Agora, o nome' }).waitFor();
await vitrine.getByText('Passo 2 de 6').waitFor();
assert.equal(await vitrine.locator('.barra-fixa').getByText(/R\$/).count(), 0, 'antes de pagar, a barra fala do livro e não do preço');

// futebol com foto, já com a conta aberta
const foto = await sharp({ create: { width: 1200, height: 900, channels: 3, background: '#a86b48' } })
  .jpeg()
  .withExif({ IFD0: { Make: 'CelularDaFamilia' } })
  .toBuffer();
await p.goto(`${SITE}/criar?produto=presente&tema=futebol&nome=Bia&idade=6`);
await p.getByRole('heading', { name: 'Agora, o nome' }).waitFor();
assert.equal(await p.locator('.etapas li').count(), 7, 'futebol tem sete etapas (o começo, a história, o livrinho, o nome, o personagem, o desenho e pagar)');
await p.getByRole('button', { name: 'Continuar' }).click();
await p.getByRole('heading', { name: 'Crie o personagem' }).waitFor();
await p.getByRole('button', { name: /Por uma foto/ }).click();
assert.ok(await p.locator('#foto').isDisabled(), 'sem o aceite, não dá para escolher a foto');
await p.locator('.consentimento input').check();
await p.setInputFiles('#foto', { name: 'bia.jpg', mimeType: 'image/jpeg', buffer: foto });
await p.getByText(/Foto recebida/).waitFor();
// o tom de pele começa "como na foto"; a família pode escolher, e o desenho segue a escolha
assert.equal(await p.getByRole('button', { name: 'Como na foto' }).getAttribute('aria-pressed'), 'true', 'tom de pele começa como na foto');
await p.getByRole('button', { name: 'Tom 2' }).click();
await p.locator('.ficha-viva').getByText('Desenhado a partir da foto').waitFor();
assert.equal(await p.getByRole('button', { name: 'Gentileza' }).count(), 0, 'o superpoder fica na última telinha, não na primeira');
await ateOSuperpoder(p);
await p.getByRole('button', { name: 'Gentileza' }).click();
await p.getByRole('button', { name: 'Continuar' }).click();

// antes de pagar, a família vê só a ficha do personagem, pequena e com marca d'água
await p.getByRole('heading', { name: 'Conheça Bia' }).waitFor();
assert.equal(await p.getByRole('button', { name: /Pagar com/ }).count(), 0, 'sem ficha aprovada, sem pagar');
await p.getByText('Você pode desenhar 3 vezes hoje.').waitFor();
await p.getByRole('button', { name: 'Desenhar Bia' }).click();
await p.getByText('Desenhando Bia…').waitFor();
const previa = p.locator('img.ficha-previa');
await previa.waitFor({ timeout: 20000 });
await p.waitForFunction(() => document.querySelector('img.ficha-previa')?.complete && document.querySelector('img.ficha-previa').naturalWidth > 0);
assert.equal(await previa.evaluate((img) => img.naturalWidth), 640, 'a prévia é pequena (640 px), não a imagem limpa');
let agora = await estado();
const primeira = agora.fichas.at(-1);
assert.ok(primeira.personagem.pele === 'p2' && primeira.prompt.includes('light skin, chosen by the family'), 'a ficha por foto leva o tom escolhido');
assert.equal(primeira.user_id, carla, 'a ficha é da conta');
assert.ok(!primeira.prompt.includes('Bia'), 'o nome não vai para o prompt da ficha');
assert.equal(primeira.token, null, 'o bilhete do n8n morre quando a imagem chega');
const trabalho = agora.trabalhosRecebidos.at(-1);
assert.equal(trabalho.status, 200);
assert.match(trabalho.foto_url ?? '', /\/storage\/v1\/object\/sign\/fotos-criancas\//, 'com foto, o n8n recebe um link assinado da foto');
assert.equal(trabalho.tamanho, '1536x1024');
assert.equal(agora.fotos.at(-1).user_id, carla, 'a foto passa a ser da conta já na ficha');

// o bilhete não serve duas vezes, e sem ele o n8n não recebe nada
const repetido = await fetch(`${SITE}/api/ficha/trabalho?id=${primeira.id}&token=${'0'.repeat(64)}`);
assert.equal(repetido.status, 404, 'trabalho com bilhete errado é recusado');
const outraImagem = new FormData();
outraImagem.append('ficha_id', primeira.id);
outraImagem.append('token', 'x'.repeat(64));
outraImagem.append('imagem', new Blob([foto], { type: 'image/jpeg' }), 'troca.jpg');
const troca = await fetch(`${SITE}/api/ficha/pronta`, { method: 'POST', body: outraImagem });
assert.equal(troca.status, 404, 'ninguém troca a imagem de uma ficha pronta');

// ajustar: volta às escolhas, desenha de novo e gasta uma tentativa
await p.getByRole('button', { name: /Quero ajustar \(restam 2\)/ }).click();
await p.getByRole('heading', { name: 'Crie o personagem' }).waitFor();
await ateOSuperpoder(p);
await p.getByRole('button', { name: 'Coragem' }).click();
await p.getByRole('button', { name: 'Continuar' }).click();
// só o superpoder mudou: o desenho é o mesmo, então a prévia continua e não gasta tentativa
await previa.waitFor();
await p.getByRole('button', { name: 'Voltar' }).click();
await p.getByRole('button', { name: /Por uma foto/ }).waitFor();
await p.getByRole('button', { name: /Pelas características/ }).click();
await ateOCabelo(p);
await p.getByRole('button', { name: 'Cacheado' }).click();
await p.locator('.ficha-viva').getByText(/Cabelo cacheado/).waitFor();
await ateOSuperpoder(p);
await p.getByRole('button', { name: 'Gentileza' }).click();
await p.locator('.ficha-viva').getByText('Superpoder: Gentileza').waitFor();
await p.getByRole('button', { name: 'Continuar' }).click();
await p.getByRole('button', { name: 'Desenhar Bia' }).click();
await previa.waitFor({ timeout: 20000 });
await p.getByRole('button', { name: /Quero ajustar \(resta 1\)/ }).waitFor();

// uma falha do n8n não gasta tentativa
await fetch(`${FALSO}/__n8n-falha?ligar=1`);
await p.getByRole('button', { name: /Quero ajustar/ }).click();
await ateOCabelo(p);
await p.getByRole('button', { name: 'Ruivo' }).click();
await ateOSuperpoder(p);
await p.getByRole('button', { name: 'Continuar' }).click();
await p.getByRole('button', { name: 'Desenhar Bia' }).click();
await p.getByText('Não deu certo desta vez.').waitFor({ timeout: 20000 });
await fetch(`${FALSO}/__n8n-falha?ligar=0`);
await p.getByRole('button', { name: 'Tentar de novo' }).click();
await previa.waitFor({ timeout: 20000 });
await p.getByText('Você já usou os 3 desenhos de hoje.').waitFor();
// os desenhos anteriores continuam à vista, e dá para voltar a um deles sem gastar tentativa
const [porFoto, cacheado, ruivo] = (await estado()).fichas.filter((f) => f.status === 'pronta');
const feitos = p.locator('.ficha-feitos li');
await feitos.first().waitFor();
assert.equal(await feitos.count(), 2, 'os dois desenhos anteriores aparecem, o atual não se repete');
await feitos.filter({ has: p.locator(`img[src*="${porFoto.id}"]`) }).getByRole('button', { name: 'Usar este' }).click();
await p.locator(`img.ficha-previa[src*="${porFoto.id}"]`).waitFor();
assert.equal(await p.locator(`.ficha-feitos img[src*="${ruivo.id}"]`).count(), 1, 'o que saiu de cena vai para a lista');
await p.getByRole('button', { name: 'Voltar' }).click();
await p.getByRole('heading', { name: 'Crie o personagem' }).waitFor();
assert.equal(await p.getByRole('button', { name: /Por uma foto/ }).getAttribute('aria-pressed'), 'true', 'as escolhas voltam a ser as do desenho escolhido');
await ateOSuperpoder(p);
await p.getByRole('button', { name: 'Continuar' }).click();
await p.locator(`img.ficha-previa[src*="${porFoto.id}"]`).waitFor();
await p.locator('.ficha-feitos li').filter({ has: p.locator(`img[src*="${ruivo.id}"]`) }).getByRole('button', { name: 'Usar este' }).click();
await p.locator(`img.ficha-previa[src*="${ruivo.id}"]`).waitFor();
assert.ok(cacheado, 'três desenhos prontos no dia');
// o limite vale no servidor, não só na tela
const quarta = await p.request.post(`${SITE}/api/ficha`, { data: { personagem: { ...(await estado()).fichas.at(-1).personagem }, idade: 6 } });
assert.equal(quarta.status(), 429, 'a quarta ficha do dia é recusada');

await p.getByRole('heading', { name: 'Olha Bia!' }).waitFor();
await p.getByRole('button', { name: 'Amei, quero o livrinho' }).click();
// o personagem aprovado aparece no resumo, junto do botão de pagar
await p.getByText('Personagem aprovado por você').waitFor();
assert.equal(await p.locator('.resumo-personagem img').getAttribute('src'), `/api/ficha/${ruivo.id}/previa`, 'o resumo mostra a ficha aprovada');
await p.getByText('Superpoder: Gentileza').waitFor();
await p.fill('#responsavel', 'Carla Teste');
await p.fill('#whatsapp', '(11) 91234-5678');
await p.getByRole('button', { name: 'Pagar com Pix' }).click();
await p.waitForURL(/\/obrigado\?pedido=/, { timeout: 15000 });

({ pedido } = ultimoAvisoAoN8n());
assert.equal(pedido.modelo, 'futebol-little-paws-v1');
assert.equal(pedido.plano.paginas.length, 16, 'Presente: dezesseis páginas no plano');
assert.equal(pedido.plano.titulo, 'Bia entra em campo!');
agora = await estado();
const aprovada = agora.fichas.find((f) => f.aprovada_em);
assert.equal(pedido.plano.ficha.aprovada?.id, aprovada.id, 'o livro usa a ficha aprovada');
assert.equal(pedido.personagem.cabeloCor, 'ruivo', 'o personagem do pedido é o da ficha aprovada');
assert.equal(pedido.personagem.superpoder, 'gentileza', 'o superpoder vem da escolha');
assert.equal(aprovada.pedido_id, pedido.id, 'a ficha fica presa ao pedido');
const prompts = [pedido.plano.ficha.prompt, ...pedido.plano.paginas.map((pg) => pg.prompt)];
assert.ok(prompts.every((t) => !t.includes('Bia')), 'o nome não vai para o prompt de imagem');
assert.ok(pedido.plano.paginas.some((pg) => pg.prompt.includes("Bo's arm")), 'página 13 com a ação da gentileza');
agora = await estado();
assert.equal(agora.consentimentos.at(-1).user_id, carla, 'o aceite fica ligado à conta');
assert.ok(!readFileSync(`${REGISTRO}.ultima.jpg`).includes(Buffer.from('CelularDaFamilia')), 'a foto guardada não tem o EXIF do aparelho');

// livros da turma: o impresso pede endereço, o preço é o do servidor e o pedido aparece na conta
await p.goto(`${SITE}/`);
const bigGame = p.locator('#little-paws article').filter({ hasText: 'Big Game' });
await bigGame.getByText('Prefere impresso? A gente imprime e envia').click();
await bigGame.getByRole('link', { name: 'Impresso R$ 79,90' }).first().click();
await p.getByRole('heading', { name: 'Little Paws, Big Game' }).waitFor();
await p.fill('#responsavel', 'Carla Teste');
await p.fill('#whatsapp', '(11) 91234-5678');
await p.getByRole('button', { name: 'Pedir o impresso' }).click();
await p.getByText('O CEP tem 8 números.').waitFor();
await p.fill('#end-cep', '01532-001');
await p.fill('#end-rua', 'Rua das Flores');
await p.fill('#end-numero', '10');
await p.fill('#end-bairro', 'Centro');
await p.fill('#end-cidade', 'São Paulo');
await p.selectOption('#end-uf', 'SP');
await p.getByRole('button', { name: 'Pedir o impresso' }).click();
await p.getByText('Pedido registrado!').waitFor();
let turma = (await estado()).pedidosTurma;
const aviso = JSON.parse(readFileSync(`${REGISTRO}.turma`, 'utf8').trim().split('\n').at(-1));
assert.ok(aviso.valor === '79,90' && aviso.formato === 'Impresso sob medida' && aviso.endereco.includes('CEP 01532001') && /Big Game/.test(aviso.livro), 'o dono recebe o aviso do pedido com valor, formato e endereço');
assert.ok(turma.length === 1 && turma[0].preco_centavos === 7990 && turma[0].edicao === 'big-game-ilustrado' && turma[0].endereco.cep === '01532001' && turma[0].user_id === carla, 'impresso gravado com o preço do servidor, o endereço e a conta');
const barato = await p.request.post(`${SITE}/api/turma/pedido`, { data: { edicao: 'big-play-colorir', formato: 'pdf', responsavel: 'Carla', whatsapp: '11912345678', precoCentavos: 1, endereco: { cep: '01532001' } } });
assert.equal(barato.status(), 200);
turma = (await estado()).pedidosTurma;
assert.ok(turma[1].preco_centavos === 2990 && turma[1].endereco === null, 'PDF a R$ 29,90 mesmo pedindo R$ 0,01, e sem endereço');
assert.equal((await p.request.post(`${SITE}/api/turma/pedido`, { data: { edicao: 'big-game-ilustrado', formato: 'kindle', responsavel: 'Carla', whatsapp: '11912345678' } })).status(), 422, 'Kindle não se vende pelo site');

// Meus livrinhos: os dois pedidos, o PDF só baixa quando existe, e as fotos apagam na hora
await fetch(`${FALSO}/__pdf?pedido=${pedido.id}`);
await p.goto(`${SITE}/`);
await p.locator('header').getByRole('link', { name: 'Meus livrinhos', exact: true }).click();
assert.equal(await p.locator('header').getByRole('link', { name: 'Entrar', exact: true }).count(), 0, 'com a conta aberta, o topo não pede para entrar');
await p.waitForURL(/\/conta$/);
await p.getByRole('heading', { name: 'Meus livrinhos' }).waitFor();
assert.equal(await p.locator('.pedidos-da-conta li').count(), 2, 'a conta vê os dois pedidos dela');
assert.equal(await p.locator('.pedidos-da-turma li').count(), 2, 'e os dois livros da turma');
assert.equal(await p.getByRole('link', { name: 'Baixar' }).count(), 1, 'só o pedido entregue tem botão de baixar');
const baixar = await p.request.get(`${SITE}/api/livro/${pedido.id}`, { maxRedirects: 0 });
assert.equal(baixar.status(), 307);
assert.match(baixar.headers().location, /\/storage\/v1\/object\/sign\/livros\//, 'baixa por link assinado');
await p.getByRole('button', { name: 'Apagar fotos agora' }).click();
await p.getByText('Fotos apagadas.').waitFor();
assert.ok((await estado()).fotos.every((f) => f.apagada_em), 'a foto foi marcada como apagada');
assert.ok(!(await estado()).arquivos.some((a) => a.startsWith('fotos-criancas/')), 'e saiu do armazenamento');

// outra pessoa não vê nem baixa o que é da Carla
const intrusa = await novaPagina();
const semConta = await intrusa.request.get(`${SITE}/api/livro/${pedido.id}`, { maxRedirects: 0 });
assert.match(semConta.headers().location ?? '', /\/entrar/, 'sem conta, baixar manda entrar');
const pedidoSemConta = await intrusa.request.post(`${SITE}/api/pedido`, { data: { produto: 'presente' } });
assert.equal(pedidoSemConta.status(), 401, 'pedido sem conta é recusado');
await intrusa.goto(`${SITE}/conta`);
await intrusa.waitForURL(/\/entrar/);
await intrusa.getByRole('button', { name: 'Criar conta' }).first().click();
await intrusa.fill('#conta-email', 'outra@exemplo.com.br');
await intrusa.fill('#conta-senha', 'outra-senha-123');
await intrusa.getByRole('button', { name: 'Criar conta' }).last().click();
await intrusa.waitForURL(/\/conta/);
await intrusa.getByText('Nenhum livrinho por aqui ainda.').waitFor();
const roubo = await intrusa.request.get(`${SITE}/api/livro/${pedido.id}`, { maxRedirects: 0 });
assert.equal(roubo.status(), 404, 'pedido de outra conta não existe para quem não é dono');
const previaAlheia = await intrusa.request.get(`${SITE}/api/ficha/${aprovada.id}/previa`);
assert.equal(previaAlheia.status(), 404, 'a prévia do personagem de outra conta não abre');

// sair e entrar de novo com a senha; senha errada avisa em português
await intrusa.getByRole('button', { name: 'Sair da conta' }).click();
await intrusa.waitForURL(`${SITE}/`);
await intrusa.goto(`${SITE}/entrar`);
await intrusa.fill('#conta-email', 'outra@exemplo.com.br');
await intrusa.fill('#conta-senha', 'senha-errada-1');
await intrusa.getByRole('button', { name: 'Entrar', exact: true }).click();
await intrusa.getByText('E-mail ou senha não conferem.').waitFor();
await intrusa.fill('#conta-senha', 'outra-senha-123');
await intrusa.getByRole('button', { name: 'Entrar', exact: true }).click();
await intrusa.waitForURL(/\/conta/);

// a história 100% personalizada (31/10/2026): a IA escreve, a família aprova o texto e o desenho, e o nome nunca vai para a IA
await intrusa.goto(`${SITE}/`);
await intrusa.locator('.topo .porta-propria').click();
await intrusa.locator('#propria').getByRole('link', { name: 'Escrever a história' }).click();
await intrusa.getByRole('heading', { name: 'Agora, o nome' }).waitFor();
assert.equal(await intrusa.locator('.etapas li').count(), 6, 'a sob medida tem seis etapas (o começo, o nome, o personagem, o desenho, a história e pagar)');
await intrusa.fill('#nome', 'theo');
await intrusa.selectOption('#idade', '5');
await intrusa.getByRole('button', { name: 'Continuar' }).click();
await intrusa.getByRole('heading', { name: 'Crie o personagem' }).waitFor();
await ateOSuperpoder(intrusa);
await intrusa.getByRole('button', { name: 'Coragem' }).click();
await intrusa.getByRole('button', { name: 'Continuar' }).click();
await intrusa.getByRole('button', { name: 'Desenhar Theo' }).click();
await intrusa.locator('img.ficha-previa').waitFor({ timeout: 20000 });
await intrusa.getByRole('button', { name: 'Amei, quero o livrinho' }).click();
// depois do desenho, a história: sem texto aprovado, nada de pagar
await intrusa.getByRole('heading', { name: 'A história de Theo' }).waitFor();
assert.equal(await intrusa.getByRole('button', { name: /Pagar com/ }).count(), 0, 'sem história aprovada, sem pagar');
await intrusa.getByRole('button', { name: 'Na praia' }).click();
await intrusa.getByRole('button', { name: 'Enfrentar um medo' }).click();
await intrusa.fill('#gosta', 'O Theo adora conchas e o mar');
await intrusa.getByRole('button', { name: /Tem bichinho de estimação/ }).click();
await intrusa.fill('#bicho-especie', 'cachorro');
await intrusa.fill('#bicho-nome', 'Pipoca');
await intrusa.fill('#detalhe', 'THEO mora na rua 1234, tel (11) 91234-5678');
await intrusa.getByRole('button', { name: 'Escrever a história de Theo' }).click();
await intrusa.getByText('Escrevendo a história de Theo…').waitFor();
await intrusa.getByRole('heading', { name: 'Theo e o mar de conchas' }).waitFor({ timeout: 20000 });
const paginasDaHistoria = intrusa.locator('.historia-paginas li');
assert.equal(await paginasDaHistoria.count(), 16, 'a família lê as dezesseis páginas');
const textoNaTela = (await paginasDaHistoria.allTextContents()).join('\n');
assert.ok(textoNaTela.includes('Theo e a Lili') && !textoNaTela.includes('{NOME}'), 'o nome volta na tela');
assert.ok(!/[\u2013\u2014]/.test(textoNaTela), 'o travessão que a IA escreveu não chega na tela');
let daHistoria = (await estado()).historias.at(-1);
assert.ok(!JSON.stringify(daHistoria).match(/theo/i), 'o nome não fica guardado na história');
assert.ok(!JSON.stringify(daHistoria.briefing).includes('1234'), 'número comprido sai do briefing');
assert.equal(daHistoria.briefing.bichinho.nome, 'Pipoca', 'o bichinho entra');
assert.equal(daHistoria.token, null, 'o bilhete do n8n morre quando o texto chega');
let trabalhoDaHistoria = (await estado()).trabalhosDeHistoria.at(-1);
assert.equal(trabalhoDaHistoria.status, 200);
assert.ok(!/theo/i.test(JSON.stringify(trabalhoDaHistoria)), 'o nome não vai para a IA');
assert.ok(trabalhoDaHistoria.pedido.includes('{NOME}') && trabalhoDaHistoria.instrucoes.includes('16 pages'), 'a IA recebe {NOME} e a estrutura da turma');
const textoTrocado = await fetch(`${SITE}/api/historia/pronta`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ historia_id: daHistoria.id, token: 'x'.repeat(64), texto: '{}' }) });
assert.equal(textoTrocado.status, 404, 'ninguém troca o texto de uma história pronta');
// um ajuste: reescreve, o pedido passa pela mesma limpeza e gasta um dos dois
await intrusa.getByRole('button', { name: 'Pedir um ajuste (restam 2)' }).click();
await intrusa.fill('#ajuste', 'O Theo quer achar um tesouro no final');
await intrusa.getByRole('button', { name: 'Reescrever com o ajuste' }).click();
await intrusa.getByRole('heading', { name: 'Theo e o tesouro da praia' }).waitFor({ timeout: 20000 });
await intrusa.getByRole('button', { name: 'Pedir um ajuste (resta 1)' }).waitFor();
trabalhoDaHistoria = (await estado()).trabalhosDeHistoria.at(-1);
assert.ok(trabalhoDaHistoria.pedido.includes('{NOME} quer achar um tesouro') && !/theo/i.test(trabalhoDaHistoria.pedido), 'o ajuste vai sem o nome');
// o servidor não aceita pagar história sem aprovação, mesmo que alguém pule a tela
const fichaDoTheo = (await estado()).fichas.at(-1);
const semAprovar = await intrusa.request.post(`${SITE}/api/pedido`, {
  data: { produto: 'sob-medida', tema: 'sob-medida', nome: 'Theo', idade: 5, responsavel: 'Outra', whatsapp: '21998765432', pagamento: 'pix', personagem: fichaDoTheo.personagem, fichaId: fichaDoTheo.id, historiaId: daHistoria.id },
});
assert.equal(semAprovar.status(), 422, 'história sem aprovação não vira pedido');
assert.ok((await semAprovar.json()).erros?.historiaId, 'e o erro aponta a história');
await intrusa.getByRole('button', { name: 'Amei, aprovar a história' }).click();
await intrusa.getByText(/Theo e o tesouro da praia”, história aprovada por você/).waitFor();
await intrusa.getByText('R$ 37,90').first().waitFor();
await intrusa.fill('#responsavel', 'Outra Pessoa');
await intrusa.fill('#whatsapp', '(21) 99876-5432');
await intrusa.getByRole('button', { name: 'Pagar com Pix' }).click();
await intrusa.waitForURL(/\/obrigado\?pedido=/, { timeout: 15000 });
const { pedido: sobMedida } = ultimoAvisoAoN8n();
assert.equal(sobMedida.produto, 'sob-medida');
assert.equal(sobMedida.total_centavos, 3790, 'R$ 39,90 com o Pix, recalculado no servidor');
assert.equal(sobMedida.modelo, 'sob-medida-little-paws-v1');
assert.equal(sobMedida.plano.paginas.length, 16, 'dezesseis páginas no plano');
assert.equal(sobMedida.plano.titulo, 'Theo e o tesouro da praia', 'o livro usa a versão aprovada');
assert.equal(sobMedida.personagem.superpoder, 'coragem', 'o superpoder é o da história');
const promptsDaHistoria = [sobMedida.plano.elenco.prompt, sobMedida.plano.capa.prompt, ...sobMedida.plano.paginas.map((pg) => pg.prompt)];
assert.ok(promptsDaHistoria.every((t) => !/theo/i.test(t) && !t.includes('{NOME}')), 'o nome não vai para o prompt de imagem');
daHistoria = (await estado()).historias.find((h) => h.id === daHistoria.id);
assert.equal(daHistoria.pedido_id, sobMedida.id, 'a história fica presa ao pedido');
const deNovo = await intrusa.request.post(`${SITE}/api/historia/${daHistoria.id}/ajustar`, { data: { pedido: 'mudar tudo de novo', nome: 'Theo' } });
assert.equal(deNovo.status(), 409, 'história que virou pedido não muda mais');

// o "next" da volta do login só aceita caminho do próprio site
const desvio = await intrusa.request.get(`${SITE}/auth/callback?next=//golpe.example`, { maxRedirects: 0 });
assert.ok(!desvio.headers().location.includes('golpe.example'), 'next para fora do site é ignorado');

// com confirmação de e-mail ligada no Supabase, o cadastro avisa e não entra
await fetch(`${FALSO}/__confirmar-email?ligar=1`);
const nova = await novaPagina();
await nova.goto(`${SITE}/entrar`);
await nova.getByRole('button', { name: 'Criar conta' }).first().click();
await nova.fill('#conta-email', 'confirma@exemplo.com.br');
await nova.fill('#conta-senha', 'senha-boa-123');
await nova.getByRole('button', { name: 'Criar conta' }).last().click();
await nova.getByText(/Mandamos um link para confirma@exemplo.com.br/).waitFor();
await fetch(`${FALSO}/__confirmar-email?ligar=0`);

// excluir a conta: some o login e o que identifica, fica a venda
await p.goto(`${SITE}/conta`);
assert.ok(!(await p.locator('#confirmar-exclusao').isVisible()), 'excluir fica fechado até a pessoa abrir');
await p.getByText('Excluir conta', { exact: true }).click();
assert.ok(await p.getByRole('button', { name: /Excluir minha conta/ }).isDisabled(), 'sem digitar EXCLUIR, o botão não age');
await p.fill('#confirmar-exclusao', 'excluir');
await p.getByRole('button', { name: /Excluir minha conta/ }).click();
await p.waitForURL(/conta=excluida/);
agora = await estado();
assert.ok(!agora.usuarios.includes('carla@exemplo.com.br'), 'o login da Carla não existe mais');
const daCarla = agora.pedidos.filter((x) => x.whatsapp === '(apagado)');
assert.equal(daCarla.length, 2, 'os dois pedidos da Carla foram anonimizados');
assert.ok(daCarla.every((x) => x.nome_crianca === '(apagado)' && x.email === '(apagado)' && x.plano === null && x.total_centavos > 0), 'fica só a venda');
assert.ok(!agora.arquivos.some((a) => a.startsWith('livros/')), 'o PDF saiu do armazenamento');
// só sobram os arquivos de fichas de outras contas (a da sob medida, acima)
const fichasQueFicam = new Set(agora.fichas.map((f) => f.caminho_imagem));
assert.ok(agora.arquivos.filter((a) => a.startsWith('fichas/')).every((a) => fichasQueFicam.has(a.replace('fichas/', ''))), 'as fichas da Carla saíram do armazenamento');
assert.ok(!agora.fichas.some((f) => f.user_id === carla), 'nenhuma ficha da Carla sobrou no banco');
assert.ok(agora.pedidosTurma.every((x) => x.responsavel === '(apagado)' && x.endereco === null && x.user_id === null && x.preco_centavos > 0), 'livros da turma: some quem comprou e o endereço, fica a venda');

// as rotas da limpeza não abrem sem o segredo
const limpeza = await fetch(`${SITE}/api/limpeza-fotos`);
assert.equal(limpeza.status, 401, 'limpeza sem o segredo do cron é recusada');

assert.deepEqual(erros, [], 'sem erro de JavaScript na página');
await navegador.close();
console.log('navegador: LP, pedido com conta, foto, Meus livrinhos e exclusão ok');
