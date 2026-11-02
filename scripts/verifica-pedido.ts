// O pedido como a rota recebe: o preço é SEMPRE recalculado no servidor, o
// WhatsApp sai normalizado e a dedicatória só existe onde o produto tem.
//
// Rode com: npm run conferir:pedido
import assert from 'node:assert/strict';
import { destinoSeguro } from '../lib/destino.ts';
import { arrumarWhatsapp, lerPedido } from '../lib/pedido.ts';
import { PERSONAGEM_INICIAL } from '../lib/personagem.ts';
import { economiaDoCombo, emReais, PRODUTOS, totalDoPedido } from '../lib/produtos.ts';

let casos = 0;
const ok = (cond: boolean, msg: string) => {
  casos++;
  assert.ok(cond, msg);
};

const base = {
  produto: 'lembrancinha',
  tema: 'futebol',
  nome: 'joão',
  idade: 5,
  responsavel: 'Carla',
  email: 'Carla@Exemplo.com.br',
  whatsapp: '(11) 91234-5678',
  pagamento: 'pix',
  personagem: PERSONAGEM_INICIAL,
  fichaId: '7d1c3e2a-5b4f-4a6e-9c8d-0e1f2a3b4c5d',
};

const lido = lerPedido(base);
ok(lido.ok, 'pedido válido passa');
if (lido.ok) {
  ok(lido.pedido.nome === 'João', 'nome sai arrumado');
  ok(lido.pedido.email === 'carla@exemplo.com.br', 'e-mail em minúsculas');
  ok(lido.pedido.whatsapp === '5511912345678', 'WhatsApp com 55');
  ok(lido.pedido.total === 3705, `Pix tem 5% de desconto (${lido.pedido.total})`);
  ok(lido.pedido.dedicatoria === null, 'lembrancinha não tem dedicatória');
  ok(lido.pedido.aceitaLembrete === false, 'sem data da festa, sem lembrete');
}

// o preço que vem do navegador é ignorado
const comPrecoFalso = lerPedido({ ...base, total: 1, preco: 1, pagamento: 'cartao' });
ok(comPrecoFalso.ok && comPrecoFalso.pedido.total === PRODUTOS.lembrancinha.preco, 'total vem da tabela, não do navegador');

// dedicatória
const presente = lerPedido({ ...base, produto: 'presente', dedicatoria: '  Com   amor, vovó ' });
ok(presente.ok && presente.pedido.dedicatoria === 'Com amor, vovó', 'dedicatória entra arrumada no presente');
const longa = lerPedido({ ...base, produto: 'combo', dedicatoria: 'a'.repeat(121) });
ok(!longa.ok && Boolean(longa.erros.dedicatoria), 'dedicatória acima de 120 barra');
const lembrancinhaComDedicatoria = lerPedido({ ...base, dedicatoria: 'oi' });
ok(lembrancinhaComDedicatoria.ok && lembrancinhaComDedicatoria.pedido.dedicatoria === null, 'lembrancinha descarta dedicatória');

// lembrete só com data
const comData = lerPedido({ ...base, dataDaFesta: '2026-12-05', aceitaLembrete: true });
ok(comData.ok && comData.pedido.aceitaLembrete && comData.pedido.dataDaFesta === '2026-12-05', 'lembrete com data');
ok(!lerPedido({ ...base, dataDaFesta: '2026-02-30' }).ok, 'data impossível barra');

// personagem: obrigatório no tema que tem história para ele, ignorado nos outros
const semPersonagem = lerPedido({ ...base, personagem: undefined });
ok(!semPersonagem.ok && Boolean(semPersonagem.erros.personagem), 'futebol sem personagem barra');
ok(!lerPedido({ ...base, personagem: { ...PERSONAGEM_INICIAL, superpoder: 'voar' } }).ok, 'personagem inválido barra');
const natal = lerPedido({ ...base, tema: 'natal', personagem: { lixo: 1 } });
ok(natal.ok && natal.pedido.personagem === null, 'Natal não leva personagem');
ok(lido.ok && lido.pedido.personagem?.superpoder === 'coragem', 'futebol leva o personagem validado');

// recusas
ok(!lerPedido({ ...base, produto: 'kit' }).ok, 'produto desconhecido');
ok(!lerPedido({ ...base, tema: 'princesa-famosa' }).ok, 'tema desconhecido');
ok(!lerPedido({ ...base, nome: 'merda' }).ok, 'palavrão');
// a versão do livro (dono, 02/11/2026): colorir, ilustrada ou combo; o preço é sempre o do servidor
{
  const presente = { ...base, produto: 'presente' };
  const r1 = lerPedido(presente);
  ok(r1.ok && r1.pedido.versao === 'colorir', 'sem versão, é o de colorir (rascunho antigo)');
  const r2 = lerPedido({ ...presente, versao: 'ilustrada', pagamento: 'pix', total: 1 });
  ok(r2.ok && r2.pedido.total === Math.floor(3490 * 0.95), `ilustrada no Pix: R$ 34,90 menos 5% (veio ${r2.ok ? r2.pedido.total : '-'}), e o total do navegador é ignorado`);
  const r3 = lerPedido({ ...presente, versao: 'combo', pagamento: 'cartao' });
  ok(r3.ok && r3.pedido.total === 4990, 'combo da turma no cartão: R$ 49,90');
  ok(!lerPedido({ ...presente, versao: 'dourada' }).ok, 'versão desconhecida recusa');
  ok(!lerPedido({ ...base, produto: 'lembrancinha', versao: 'combo' }).ok, 'a lembrancinha só tem a de colorir');
}
ok(totalDoPedido('sob-medida', 'cartao', 'combo') === 6990 && totalDoPedido('sob-medida', 'cartao', 'ilustrada') === 4990 && totalDoPedido('sob-medida', 'cartao') === 3990, 'sob medida: 39,90 / 49,90 / combo 69,90');
ok(economiaDoCombo('sob-medida') === 1990 && economiaDoCombo('presente') === 990, 'o combo economiza R$ 19,90 na sob medida e R$ 9,90 na turma');
// "Outra" idade abre a caixa, de 1 a 12 (dono, 02/11/2026)
ok(lerPedido({ ...base, idade: 12 }).ok, 'idade 12, pela caixa do "Outra", passa');
ok(lerPedido({ ...base, idade: 2 }).ok, 'idade 2, pela caixa do "Outra", passa');
ok(!lerPedido({ ...base, idade: 13 }).ok, 'idade acima de 12 recusa');
ok(!lerPedido({ ...base, idade: 0 }).ok, 'idade 0 recusa');
ok(!lerPedido({ ...base, idade: 4.5 }).ok, 'idade quebrada recusa');
ok(!lerPedido({ ...base, idade: 2.5 }).ok, 'idade quebrada');
ok(!lerPedido({ ...base, email: 'carla@' }).ok, 'e-mail ruim');
ok(!lerPedido({ ...base, responsavel: '' }).ok, 'sem responsável');

// WhatsApp
ok(arrumarWhatsapp('11 91234-5678') === '5511912345678', 'celular com 9');
ok(arrumarWhatsapp('+55 (21) 3456-7890') === '552134567890', 'fixo com +55');
ok(arrumarWhatsapp('91234-5678') === null, 'sem DDD');
ok(arrumarWhatsapp('011912345678') === null, 'DDD com zero');

// preços da vitrine (decisão do dono; se mudar, muda aqui junto e com ele)
ok(emReais(PRODUTOS.lembrancinha.preco) === 'R$ 39', 'lembrancinha R$ 39');
ok(emReais(PRODUTOS.presente.preco) === 'R$ 24,90', 'presente R$ 24,90');
ok(emReais(PRODUTOS.combo.preco) === 'R$ 54', 'combo R$ 54');
ok(totalDoPedido('presente', 'pix') === 2365, 'presente no Pix arredonda a favor de quem compra');
ok(PRODUTOS.combo.preco < PRODUTOS.lembrancinha.preco + PRODUTOS.presente.preco, 'combo sai mais barato que os dois separados');

// a volta do login só vai para caminho do próprio site (senão vira redirecionador de golpe)
ok(destinoSeguro('/criar?etapa=pagar') === '/criar?etapa=pagar', 'caminho do site passa');
for (const ruim of ['//golpe.example', 'https://golpe.example', '/\\golpe.example', 'javascript:alert(1)', '', null]) {
  ok(destinoSeguro(ruim) === '/conta', `destino para fora barrado: ${String(ruim)}`);
}

console.log(`pedido: ${casos} casos ok`);
