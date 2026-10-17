// O pedido como a rota recebe: o preço é SEMPRE recalculado no servidor, o
// WhatsApp sai normalizado e a dedicatória só existe onde o produto tem.
//
// Rode com: npm run conferir:pedido
import assert from 'node:assert/strict';
import { arrumarWhatsapp, lerPedido } from '../lib/pedido.ts';
import { emReais, PRODUTOS, totalDoPedido } from '../lib/produtos.ts';

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

// recusas
ok(!lerPedido({ ...base, produto: 'kit' }).ok, 'produto desconhecido');
ok(!lerPedido({ ...base, tema: 'princesa-famosa' }).ok, 'tema desconhecido');
ok(!lerPedido({ ...base, nome: 'merda' }).ok, 'palavrão');
ok(!lerPedido({ ...base, idade: 11 }).ok, 'idade fora de 1 a 10');
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

console.log(`pedido: ${casos} casos ok`);
