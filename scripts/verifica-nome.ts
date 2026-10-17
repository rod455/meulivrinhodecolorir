// Regras do nome da criança (seção 4.3): capitaliza, aceita acento e cedilha,
// barra palavrão sem barrar nome de verdade, e garante que até 14 letras cabem
// na capa sem cair abaixo da fonte mínima.
//
// Rode com: npm run conferir:nome
import assert from 'node:assert/strict';
import { arrumarNome, fonteDoNome, FONTE_MINIMA, LIMITE_DO_NOME, problemaDoNome } from '../lib/nome.ts';

let casos = 0;
const igual = (atual: unknown, esperado: unknown, msg: string) => {
  casos++;
  assert.deepEqual(atual, esperado, msg);
};

igual(arrumarNome('joão'), 'João', 'capitaliza com acento');
igual(arrumarNome('  maria   clara '), 'Maria Clara', 'tira espaço sobrando');
igual(arrumarNome('ANA'), 'Ana', 'baixa o resto');
igual(arrumarNome('maria da luz'), 'Maria da Luz', 'partícula fica minúscula');
igual(arrumarNome('ana-júlia'), 'Ana-Júlia', 'nome com hífen');
igual(arrumarNome('conceição'), 'Conceição', 'cedilha');
igual(arrumarNome('éric'), 'Éric', 'acento na primeira letra');

igual(problemaDoNome(''), 'vazio', 'vazio');
igual(problemaDoNome('   '), 'vazio', 'só espaço');
igual(problemaDoNome('Laura'), null, 'nome comum');
igual(problemaDoNome('Ícaro'), null, 'acento');
igual(problemaDoNome("D'Ávila"), null, 'apóstrofo');
igual(problemaDoNome('Maria Eduarda'), null, 'nome composto de 13');
igual(problemaDoNome('a'.repeat(LIMITE_DO_NOME)), null, 'exatamente no limite');
igual(problemaDoNome('a'.repeat(LIMITE_DO_NOME + 1)), 'longo', 'um acima do limite');
igual(problemaDoNome('Ana2'), 'caractere', 'número');
igual(problemaDoNome('Ana 😀'), 'caractere', 'emoji');
igual(problemaDoNome('-Ana'), 'caractere', 'começa com hífen');

// palavrão barra, com e sem acento e em qualquer caixa
igual(problemaDoNome('merda'), 'bloqueado', 'palavrão');
igual(problemaDoNome('MERDA'), 'bloqueado', 'palavrão em caixa alta');
igual(problemaDoNome('Ana Porra'), 'bloqueado', 'palavrão em nome composto');
// e não barra nome de verdade que contém um pedaço
igual(problemaDoNome('Cunha'), null, 'pedaço de palavra não barra (cu)');
igual(problemaDoNome('Rolando'), null, 'pedaço de palavra não barra (rola)');
igual(problemaDoNome('Putira'), null, 'pedaço de palavra não barra (puta)');

// fonte da capa: todo nome aceito cabe acima do mínimo legível
for (let n = 1; n <= LIMITE_DO_NOME; n++) {
  const f = fonteDoNome('M'.repeat(n));
  casos++;
  assert.ok(f !== null && f >= FONTE_MINIMA, `nome de ${n} letras cabe na capa (fonte ${f})`);
}
const curta = fonteDoNome('Bia')!;
const longa = fonteDoNome('Maria Eduarda')!;
casos++;
assert.ok(curta > longa, 'nome curto sai com fonte maior que nome longo');
igual(fonteDoNome('M'.repeat(30)), null, 'nome enorme não cabe: pede apelido');

console.log(`nome: ${casos} casos ok`);
