// Suíte de navegador: percorre a LP, o fluxo do pedido e a conta como uma
// pessoa no celular. Roda contra o Supabase de mentira (scripts/supabase-falso.mjs),
// porque o ambiente de teste não alcança o de verdade:
//
//   npm i --no-save playwright
//   node scripts/supabase-falso.mjs 4556 /tmp/sf.jsonl &
//   F=http://127.0.0.1:4556; NEXT_PUBLIC_SUPABASE_URL=$F NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-falsa npx next build
//   NEXT_PUBLIC_SUPABASE_URL=$F NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-falsa SUPABASE_URL=$F \
//     SUPABASE_SERVICE_ROLE_KEY=chave-de-servico-falsa N8N_WEBHOOK_PEDIDO=$F/n8n CRON_SECRET=teste npx next start -p 3100 &
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
const estado = async () => (await fetch(`${FALSO}/__estado`)).json();
const ultimoAvisoAoN8n = () => JSON.parse(readFileSync(`${REGISTRO}.n8n`, 'utf8').trim().split('\n').at(-1));

const p = await novaPagina();

// LP: a prévia muda a capa enquanto digita, e o botão leva o nome para o fluxo
await p.goto(`${SITE}/?utm_source=teste&utm_campaign=suite`);
await p.fill('#nome-lp', 'joão pedro');
await p.locator('a[href*="nome=Jo%C3%A3o+Pedro"]').first().waitFor();
await p.getByRole('button', { name: /Natal/ }).first().click();
await p.getByRole('link', { name: 'Gostei! Quero esse' }).click();
await p.waitForURL(/\/criar\?/);

// sem produto no link: começa pela escolha do produto e pula o tema, que já veio
await p.getByRole('button', { name: /Livrinho presente/ }).click();
await p.getByRole('heading', { name: 'Agora, o nome' }).waitFor();
assert.equal(await p.inputValue('#nome'), 'João Pedro', 'nome veio da LP arrumado');

// palavrão não passa da personalização
await p.fill('#nome', 'merda');
await p.getByRole('button', { name: 'Continuar' }).click();
await p.getByText('Esse nome não pode ir para a capa').first().waitFor();
await p.fill('#nome', 'Laura');
await p.getByRole('button', { name: /Feliz aniversário/ }).click();
await p.getByRole('button', { name: 'Continuar' }).click();

// para comprar precisa de conta: sem ela, nem aparece o botão de pagar
await p.getByRole('heading', { name: 'Falta pouco: sua conta' }).waitFor();
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

// futebol com foto, já com a conta aberta
const foto = await sharp({ create: { width: 1200, height: 900, channels: 3, background: '#a86b48' } })
  .jpeg()
  .withExif({ IFD0: { Make: 'CelularDaFamilia' } })
  .toBuffer();
await p.goto(`${SITE}/criar?produto=presente&tema=futebol&nome=Bia&idade=6`);
await p.getByRole('heading', { name: 'Agora, o nome' }).waitFor();
assert.equal(await p.locator('.etapas li').count(), 5, 'futebol tem cinco etapas');
await p.getByRole('button', { name: 'Continuar' }).click();
await p.getByRole('heading', { name: 'Crie o personagem' }).waitFor();
await p.getByRole('button', { name: /Por uma foto/ }).click();
assert.ok(await p.locator('#foto').isDisabled(), 'sem o aceite, não dá para escolher a foto');
await p.locator('.consentimento input').check();
await p.setInputFiles('#foto', { name: 'bia.jpg', mimeType: 'image/jpeg', buffer: foto });
await p.getByText(/Foto recebida/).waitFor();
await p.getByRole('button', { name: 'Gentileza' }).click();
await p.getByRole('button', { name: 'Continuar' }).click();
await p.getByText('Superpoder: Gentileza').waitFor();
await p.fill('#responsavel', 'Carla Teste');
await p.fill('#whatsapp', '(11) 91234-5678');
await p.getByRole('button', { name: 'Pagar com Pix' }).click();
await p.waitForURL(/\/obrigado\?pedido=/, { timeout: 15000 });

({ pedido } = ultimoAvisoAoN8n());
assert.equal(pedido.modelo, 'futebol-little-paws-v1');
assert.equal(pedido.plano.paginas.length, 16, 'Presente: dezesseis páginas no plano');
assert.equal(pedido.plano.titulo, 'Bia entra em campo!');
assert.ok(pedido.plano.ficha.usaFoto, 'a ficha usa a foto');
const prompts = [pedido.plano.ficha.prompt, ...pedido.plano.paginas.map((pg) => pg.prompt)];
assert.ok(prompts.every((t) => !t.includes('Bia')), 'o nome não vai para o prompt de imagem');
assert.ok(pedido.plano.paginas.some((pg) => pg.prompt.includes("Bo's arm")), 'página 13 com a ação da gentileza');
let agora = await estado();
const fotoGuardada = agora.fotos.at(-1);
assert.equal(fotoGuardada.user_id, carla, 'a foto passa a ser da conta que comprou');
assert.equal(agora.consentimentos.at(-1).user_id, carla, 'o aceite fica ligado à conta');
assert.ok(!readFileSync(`${REGISTRO}.ultima.jpg`).includes(Buffer.from('CelularDaFamilia')), 'a foto guardada não tem o EXIF do aparelho');

// Meus livrinhos: os dois pedidos, o PDF só baixa quando existe, e as fotos apagam na hora
await fetch(`${FALSO}/__pdf?pedido=${pedido.id}`);
await p.goto(`${SITE}/conta`);
await p.getByRole('heading', { name: 'Meus livrinhos' }).waitFor();
assert.equal(await p.locator('.pedidos-da-conta li').count(), 2, 'a conta vê os dois pedidos dela');
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

// as rotas da limpeza não abrem sem o segredo
const limpeza = await fetch(`${SITE}/api/limpeza-fotos`);
assert.equal(limpeza.status, 401, 'limpeza sem o segredo do cron é recusada');

assert.deepEqual(erros, [], 'sem erro de JavaScript na página');
await navegador.close();
console.log('navegador: LP, pedido com conta, foto, Meus livrinhos e exclusão ok');
