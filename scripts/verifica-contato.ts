// O "Fale com a gente" (botão "?"): o que a família manda e o e-mail que chega.
// Rode com: npm run conferir:contato
import assert from 'node:assert/strict';
import { emailDoContato, LIMITE_DA_MENSAGEM, lerContato } from '../lib/contato.ts';

let casos = 0;
const ok = (cond: boolean, msg: string) => {
  casos++;
  assert.ok(cond, msg);
};

const bom = lerContato({ tipo: 'sugestao', mensagem: '  Amei o livro!  ', email: ' Carla@Teste.com ', pagina: '/criar?nome=Bia&tema=futebol' });
ok(bom.ok, 'mensagem com e-mail passa');
if (bom.ok) {
  ok(bom.contato.email === 'carla@teste.com' && bom.contato.mensagem === 'Amei o livro!', 'e-mail e mensagem arrumados');
  ok(bom.contato.pagina === '/criar', 'da página vai só o caminho, nunca o nome da criança que está na busca');
  ok(bom.contato.tipo === 'sugestao', 'o tipo escolhido vale');
}
const semEmail = lerContato({ tipo: 'duvida', mensagem: 'Carro não pega', email: '' });
ok(!semEmail.ok && Boolean(semEmail.erros.email), 'sem e-mail não passa: é por ele que a gente responde');
ok(!lerContato({ mensagem: 'oi', email: 'carla@' }).ok, 'e-mail quebrado não passa');
ok(!lerContato({ mensagem: '   ', email: 'carla@teste.com' }).ok, 'mensagem vazia não passa');
ok(!lerContato({ mensagem: 'a'.repeat(LIMITE_DA_MENSAGEM + 1), email: 'carla@teste.com' }).ok, 'mensagem grande demais não passa');
const tipoInventado = lerContato({ tipo: 'drop table', mensagem: 'oi', email: 'carla@teste.com' });
ok(tipoInventado.ok && tipoInventado.contato.tipo === 'duvida', 'tipo desconhecido vira dúvida');

const injecao = lerContato({ mensagem: '<script>alert(1)</script> & "x"', email: 'carla@teste.com' });
if (injecao.ok) {
  const e = emailDoContato(injecao.contato);
  ok(!e.html.includes('<script>') && e.html.includes('&lt;script&gt;'), 'o que a pessoa escreve não vira HTML no e-mail');
  ok(e.responderPara === 'carla@teste.com' && e.assunto.includes('carla@teste.com'), 'o responder vai para quem escreveu');
  ok(!/[–—]/.test(e.assunto + e.html), 'e-mail sem travessão');
}

console.log(`contato: ${casos} casos ok`);
