// Os livros da turma vendidos no site (dono, 26/10/2026): impresso R$ 79,90,
// PDF R$ 29,90, Kindle só na Amazon. O preço sai do servidor, nunca do
// navegador, e o endereço só existe no impresso.
//
// Rode com: npm run conferir:turma
import assert from 'node:assert/strict';
import { acharEdicao, LIVROS_PUBLICADOS, lerPedidoDaTurma, linkValido, PRECO_DO_FORMATO, linksNaAmazon } from '../lib/livros-publicados.ts';

let casos = 0;
const ok = (cond: boolean, msg: string) => {
  casos++;
  assert.ok(cond, msg);
};

// 1. os preços que o dono fixou
ok(PRECO_DO_FORMATO.impresso === 7990 && PRECO_DO_FORMATO.pdf === 2990, 'impresso R$ 79,90 e PDF R$ 29,90');

// 2. o catálogo: ids únicos, Kindle só em link da Amazon e só nos ilustrados
const edicoes = LIVROS_PUBLICADOS.flatMap((l) => l.edicoes);
ok(new Set(edicoes.map((e) => e.id)).size === edicoes.length, 'cada edição tem um id só seu');
ok(edicoes.every((e) => e.kindle === null || linkValido(e.kindle)), 'todo Kindle é amazon.*/dp/ASIN');
ok(edicoes.every((e) => e.amazon === null || linkValido(e.amazon)), 'todo livro físico na Amazon é amazon.*/dp/ASIN');
// os links que o dono mandou (26/10/2026), na ordem dos prints da Amazon
const amazonDe = (id: string) => edicoes.find((e) => e.id === id)?.amazon;
ok(amazonDe('big-game-colorir') === 'https://www.amazon.com/dp/B0HLFPY4DM', 'Big Game de colorir: o link da barra do navegador no print');
ok(amazonDe('big-game-ilustrado') === 'https://www.amazon.com/dp/B0HKWG1SNH' && amazonDe('big-play-ilustrado') === 'https://www.amazon.com/dp/B0HMKMX2SY' && amazonDe('big-play-colorir') === 'https://www.amazon.com/dp/B0HMG6R5KR' && amazonDe('big-christmas-ilustrado') === 'https://www.amazon.com/dp/B0HNS52FMK', 'cada link no seu livro e formato');
ok(new Set(edicoes.flatMap((e) => [e.kindle, e.amazon]).filter(Boolean)).size === edicoes.flatMap((e) => [e.kindle, e.amazon]).filter(Boolean).length, 'nenhum link repetido em duas edições');
const bigGame = LIVROS_PUBLICADOS.find((l) => l.id === 'big-game')!;
ok(linksNaAmazon(bigGame).map((x) => x.rotulo).join('|') === 'Livro de história|E-book (Kindle)|Livro de colorir', 'o Big Game mostra os três formatos na Amazon');
ok(linksNaAmazon(LIVROS_PUBLICADOS.find((l) => l.id === 'grande-final')!).length === 0, 'livro que não está na Amazon não mostra botão');
ok(edicoes.filter((e) => e.kindle).every((e) => e.tipo === 'Livro ilustrado'), 'Kindle só nos ilustrados');
ok(!linkValido('https://golpe.example/dp/B0HKW6ZHSD') && !linkValido('http://www.amazon.com/dp/B0HKW6ZHSD'), 'link de fora da Amazon ou sem https não passa');
ok(acharEdicao('big-play-colorir')?.livro.id === 'big-play' && acharEdicao('qualquer') === null, 'acha a edição pelo id');
ok(LIVROS_PUBLICADOS.every((l) => /^(o|a) [A-Z]/.test(l.protagonista)), 'protagonista com artigo: "a Dot", nunca "o Dot"');
ok(LIVROS_PUBLICADOS.filter((l) => l.idioma === 'pt').every((l) => l.edicoes.every((e) => e.kindle === null)), 'livro em português não tem Kindle (o Kindle é da versão em inglês)');

// 3. o pedido
const endereco = { cep: '01532-001', rua: 'Rua das Flores', numero: '10', complemento: '', bairro: 'Centro', cidade: 'São Paulo', uf: 'sp' };
const impresso = lerPedidoDaTurma({ edicao: 'big-game-ilustrado', formato: 'impresso', responsavel: 'Carla', whatsapp: '(11) 91234-5678', endereco, precoCentavos: 1 });
ok(impresso.ok && impresso.pedido.precoCentavos === 7990, 'o preço vem do formato, nunca do navegador');
ok(impresso.ok && impresso.pedido.endereco?.cep === '01532001' && impresso.pedido.endereco.uf === 'SP', 'CEP só com números e UF em maiúscula');
ok(impresso.ok && impresso.pedido.whatsapp === '5511912345678', 'WhatsApp com 55 e DDD');
const pdf = lerPedidoDaTurma({ edicao: 'big-game-colorir', formato: 'pdf', responsavel: 'Carla', whatsapp: '11912345678', endereco });
ok(pdf.ok && pdf.pedido.precoCentavos === 2990 && pdf.pedido.endereco === null, 'PDF: R$ 29,90 e o endereço é descartado');
const semEndereco = lerPedidoDaTurma({ edicao: 'big-game-ilustrado', formato: 'impresso', responsavel: 'Carla', whatsapp: '11912345678' });
ok(!semEndereco.ok && Boolean(semEndereco.erros.cep && semEndereco.erros.rua && semEndereco.erros.uf), 'impresso sem endereço não passa');
ok(!lerPedidoDaTurma({ edicao: 'big-game-ilustrado', formato: 'kindle', responsavel: 'Carla', whatsapp: '11912345678' }).ok, 'Kindle não se vende aqui');
ok(!lerPedidoDaTurma({ edicao: 'livro-inventado', formato: 'pdf', responsavel: 'Carla', whatsapp: '11912345678' }).ok, 'edição que não existe não passa');
ok(!lerPedidoDaTurma({ edicao: 'big-game-colorir', formato: 'pdf', responsavel: 'Carla', whatsapp: '1234' }).ok, 'WhatsApp curto não passa');
ok(!lerPedidoDaTurma({ ...endereco, edicao: 'big-game-colorir', formato: 'impresso', responsavel: 'Carla', whatsapp: '11912345678', endereco: { ...endereco, uf: 'XX' } }).ok, 'estado inventado não passa');

console.log(`turma: ${casos} casos ok`);
