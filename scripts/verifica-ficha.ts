// A ficha antes de pagar: o limite de 3 desenhos por dia (decisão do dono,
// 25/10/2026), o que conta como tentativa e o bilhete do n8n. Se o limite
// quebrar, um robô com conta gasta os créditos da OpenAI à vontade.
//
// Rode com: npm run conferir:ficha
// sem fonte nenhuma, como na Vercel (precisa vir antes do sharp carregar)
process.env.FONTCONFIG_FILE = new URL('./sem-fonte.conf', import.meta.url).pathname;
import assert from 'node:assert/strict';
import { bilheteConfere, chaveDoDesenho, desenhosParaEscolher, desistiu, ehUuid, fichasRestantes, LIMITE_DE_FICHAS, novoBilhete, type FichaNoBanco } from '../lib/ficha.ts';
import { FRASE_DA_MARCA, svgDaMarca, tracosDoTexto } from '../lib/marca.ts';
import { lerPedido } from '../lib/pedido.ts';
import { PERSONAGEM_INICIAL } from '../lib/personagem.ts';

let casos = 0;
const ok = (cond: boolean, msg: string) => {
  casos++;
  assert.ok(cond, msg);
};

const agora = new Date('2026-10-25T15:00:00Z');
const horasAtras = (h: number) => new Date(agora.getTime() - h * 3600 * 1000).toISOString();
const ficha = (h: number, status: FichaNoBanco['status'] = 'pronta', pedido_id: string | null = null): FichaNoBanco => ({
  id: crypto.randomUUID(),
  criada_em: horasAtras(h),
  status,
  pedido_id,
});

// 1. o limite: 3 por 24 horas
ok(LIMITE_DE_FICHAS === 3, 'a primeira e 2 ajustes');
ok(fichasRestantes([], agora) === 3, 'sem ficha, 3 desenhos');
ok(fichasRestantes([ficha(1), ficha(2)], agora) === 1, 'duas prontas, resta 1');
ok(fichasRestantes([ficha(1), ficha(2), ficha(3)], agora) === 0, 'três prontas, acabou');
ok(fichasRestantes([ficha(1), ficha(2), ficha(3), ficha(4)], agora) === 0, 'nunca fica negativo');
ok(fichasRestantes([ficha(25), ficha(26), ficha(30)], agora) === 3, 'as de ontem não contam');
// o que não conta como tentativa
ok(fichasRestantes([ficha(1, 'falhou'), ficha(2, 'falhou'), ficha(3, 'falhou')], agora) === 3, 'falha não gasta tentativa');
ok(fichasRestantes([ficha(1, 'pronta', crypto.randomUUID()), ficha(2, 'pronta', crypto.randomUUID())], agora) === 3, 'ficha que virou pedido não conta');
ok(fichasRestantes([ficha(0.05, 'gerando')], agora) === 2, 'a que está desenhando conta');
ok(fichasRestantes([ficha(0.5, 'gerando')], agora) === 3, 'a que travou em "gerando" (mais de 10 minutos) não conta');
ok(desistiu({ status: 'gerando', criada_em: horasAtras(0.5) }, agora) && !desistiu({ status: 'gerando', criada_em: horasAtras(0.1) }, agora), 'desiste depois de 10 minutos');
ok(!desistiu({ status: 'pronta', criada_em: horasAtras(5) }, agora), 'ficha pronta nunca "desiste"');

// 2. o que muda o desenho: o superpoder não, o resto sim
const base = PERSONAGEM_INICIAL;
ok(chaveDoDesenho(base, 6) === chaveDoDesenho({ ...base, superpoder: 'gentileza' }, 6), 'trocar o superpoder não pede ficha nova');
ok(chaveDoDesenho(base, 6) !== chaveDoDesenho({ ...base, cabeloTipo: 'cacheado' }, 6), 'mudar o cabelo pede ficha nova');
ok(chaveDoDesenho(base, 6) !== chaveDoDesenho(base, 7), 'mudar a idade pede ficha nova');

// os desenhos que a família já viu (25/10/2026): mesma idade, sem repetir o atual, os mais novos primeiro
const desenho = (id: string, h: number, idade = 6) => ({ id, criada_em: horasAtras(h), idade, personagem: base });
const lista = desenhosParaEscolher([desenho('a', 3), desenho('b', 1), desenho('c', 2), desenho('d', 1, 7)], 6, 'c');
ok(lista.map((d) => d.id).join() === 'b,a', 'lista: outra idade e o atual ficam de fora, o mais novo primeiro');
ok(desenhosParaEscolher(Array.from({ length: 9 }, (_, i) => desenho(`x${i}`, i)), 6, null).length === 6, 'lista: no máximo 6');

// 3. o bilhete do n8n
const bilhete = novoBilhete();
ok(/^[0-9a-f]{64}$/.test(bilhete) && bilhete !== novoBilhete(), 'bilhete de 256 bits, um diferente a cada ficha');
ok(bilheteConfere(bilhete, bilhete), 'bilhete certo passa');
ok(!bilheteConfere(bilhete, bilhete.slice(0, -1) + (bilhete.endsWith('0') ? '1' : '0')), 'um caractere errado barra');
ok(!bilheteConfere(bilhete, ''), 'vazio barra');
ok(!bilheteConfere(null, bilhete), 'ficha sem bilhete (já usado) barra');
ok(!bilheteConfere(bilhete, undefined) && !bilheteConfere(bilhete, 123), 'sem bilhete ou de outro tipo barra');
ok(ehUuid(crypto.randomUUID()) && !ehUuid('../fichas') && !ehUuid("x' or 1=1"), 'id só no formato uuid');

// 4. o pedido de tema com personagem exige a ficha aprovada
const pedido = {
  produto: 'presente',
  tema: 'futebol',
  nome: 'Bia',
  idade: 6,
  responsavel: 'Carla',
  email: 'carla@exemplo.com.br',
  whatsapp: '11912345678',
  pagamento: 'pix',
  personagem: PERSONAGEM_INICIAL,
};
const semFicha = lerPedido(pedido);
ok(!semFicha.ok && Boolean(semFicha.erros.personagem), 'futebol sem ficha não passa');
const comFicha = lerPedido({ ...pedido, fichaId: crypto.randomUUID() });
ok(comFicha.ok && Boolean(comFicha.pedido.fichaId), 'futebol com ficha passa');
ok(!lerPedido({ ...pedido, fichaId: 'qualquer-coisa' }).ok, 'ficha com id inválido não passa');
const natal = lerPedido({ ...pedido, tema: 'natal', fichaId: crypto.randomUUID() });
ok(natal.ok && natal.pedido.fichaId === null, 'Natal ignora a ficha');

// 5. a marca d'água da prévia: em traços, nunca em texto. Na Vercel não há
// fonte, e o <text> da primeira versão saiu como quadradinhos (25/10/2026).
// Aqui o sharp roda sem fonte nenhuma, como lá.
const { default: sharp } = await import('sharp');
const svg = svgDaMarca(640, 427);
ok(!/<text/i.test(svg), 'a marca não usa <text> (sem fonte, vira quadradinho)');
ok(Array.from(FRASE_DA_MARCA).every((letra) => { try { tracosDoTexto(letra, 0, 0, 10); return true; } catch { return false; } }), 'toda letra da frase tem desenho');
let semLetra = false;
try { tracosDoTexto('PRÉVIA X', 0, 0, 10); } catch { semLetra = true; }
ok(semLetra, 'letra sem desenho grita em vez de sumir');
const fundo = await sharp({ create: { width: 640, height: 427, channels: 3, background: '#ffffff' } }).png().toBuffer();
const comMarca = await sharp(fundo).composite([{ input: Buffer.from(svg) }]).raw().toBuffer();
let marcados = 0;
for (let i = 0; i < comMarca.length; i += 3) if (comMarca[i] < 235) marcados++;
const fracao = marcados / (640 * 427);
ok(fracao > 0.04 && fracao < 0.35, `a marca cobre a prévia sem esconder o desenho (${(fracao * 100).toFixed(1)}% dos pontos)`);

console.log(`ficha: ${casos} casos ok`);
