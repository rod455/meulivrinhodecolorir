// Suíte de navegador: percorre a LP e o fluxo do pedido como uma pessoa no
// celular, até o pedido chegar no destino. Precisa do site rodando:
//
//   npm i --no-save playwright
//   N8N_WEBHOOK_PEDIDO=http://127.0.0.1:4555/ npx next start -p 3100
//   SITE=http://localhost:3100 RECEBIDOS=/caminho/recebidos.jsonl npm run conferir:navegador
//
// RECEBIDOS é o arquivo onde um webhook falso grava o que a rota mandou; com
// ele, a suíte confere que o preço gravado é o da tabela e não o da tela.
import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const SITE = process.env.SITE ?? 'http://localhost:3000';
const RECEBIDOS = process.env.RECEBIDOS;
const CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const navegador = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {});
const p = await navegador.newPage({ viewport: { width: 390, height: 844 } });
const erros = [];
p.on('pageerror', (e) => erros.push(e.message));

// LP: a prévia muda a capa enquanto digita, e o botão leva o nome para o fluxo
await p.goto(`${SITE}/?utm_source=teste&utm_campaign=suite`);
await p.fill('#nome-lp', 'joão pedro');
await p.locator('svg[aria-label^="Capa: Festa de João Pedro"]').first().waitFor();
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

// dados e pagamento
await p.getByRole('heading', { name: 'Para onde mandamos?' }).waitFor();
await p.getByRole('button', { name: 'Pagar com Pix' }).click();
await p.getByText('Confira o e-mail.').waitFor();
await p.fill('#responsavel', 'Carla Teste');
await p.fill('#email', 'carla@exemplo.com.br');
await p.fill('#whatsapp', '(11) 91234-5678');
assert.ok(await p.getByText('R$ 23,65').first().isVisible(), 'total com desconto do Pix na tela');
await p.getByRole('button', { name: 'Pagar com Pix' }).click();
await p.waitForURL(/\/obrigado\?pedido=/, { timeout: 15000 });
await p.getByRole('heading', { name: 'Pedido recebido!' }).waitFor();

if (RECEBIDOS) {
  const linhas = readFileSync(RECEBIDOS, 'utf8').trim().split('\n');
  const { pedido } = JSON.parse(linhas.at(-1));
  assert.equal(pedido.nome_crianca, 'Laura');
  assert.equal(pedido.produto, 'presente');
  assert.equal(pedido.tema, 'natal');
  assert.equal(pedido.total_centavos, 2365, 'preço recalculado no servidor');
  assert.equal(pedido.whatsapp, '5511912345678');
  assert.match(pedido.dedicatoria, /^Feliz aniversário/);
  assert.equal(pedido.origem.utm_source, 'teste', 'UTM da primeira página chega no pedido');
}

assert.deepEqual(erros, [], 'sem erro de JavaScript na página');
await navegador.close();
console.log('navegador: LP e fluxo do pedido ok');
