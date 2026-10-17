// Travessão em texto que alguém lê. Regra do dono: português natural, SEM
// travessão (o traço longo, e também o meio-traço usado no lugar dele). Vale para
// site, e-mails e docs. Comentário de código fica de fora: não é frase de tela.
//
// Rode com: npm run conferir:travessao
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PASTAS = ['app', 'components', 'lib', 'docs'];
const AVULSOS = ['README.md', 'CLAUDE.md'];
const TRACOS = /[—–]/;

function arquivos(pasta) {
  let lista = [];
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) lista = lista.concat(arquivos(caminho));
    else if (/\.(tsx?|md|svg)$/.test(nome)) lista.push(caminho);
  }
  return lista;
}

/** Tira comentários de código, para sobrar só o que vira texto. */
function semComentarios(linha, emBloco) {
  let texto = linha;
  if (emBloco.dentro) {
    const fim = texto.indexOf('*/');
    if (fim === -1) return '';
    texto = texto.slice(fim + 2);
    emBloco.dentro = false;
  }
  texto = texto.replace(/\/\*.*?\*\//g, '');
  const abre = texto.indexOf('/*');
  if (abre !== -1) {
    emBloco.dentro = true;
    texto = texto.slice(0, abre);
  }
  return texto.replace(/(^|\s)\/\/.*$/, '$1');
}

const achados = [];
for (const caminho of [...PASTAS.flatMap((p) => arquivos(p)), ...AVULSOS]) {
  const codigo = /\.tsx?$/.test(caminho);
  const emBloco = { dentro: false };
  readFileSync(caminho, 'utf8')
    .split('\n')
    .forEach((linha, i) => {
      const texto = codigo ? semComentarios(linha, emBloco) : linha;
      if (TRACOS.test(texto)) achados.push(`${caminho}:${i + 1}: ${linha.trim()}`);
    });
}

if (achados.length) {
  console.error(`Travessão em texto (${achados.length}):\n${achados.join('\n')}`);
  process.exit(1);
}
console.log('travessão: nenhum em texto');
