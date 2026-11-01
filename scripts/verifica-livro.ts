// A montagem do PDF do Livrinho Presente (lib/livro-pdf.ts) e os arquivos de que
// ela depende (assets/). Quebrado aqui, o livro sai torto ou não sai, e ninguém
// vê até a família abrir o PDF.
//
// Rode com: npm run conferir:livro
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument } from 'pdf-lib';
import { HISTORIAS_DA_TURMA, planoDoLivro } from '../lib/geracao.ts';
import { areaComFolga, chaveDaPagina, chavesDoLivro, emailDeFalha, emailDeRevisao, emailParaFamilia, entradaDoLivro, itensDoLivro, LIVROS_AUTOMATICOS } from '../lib/livro.ts';
import { PERSONAGEM_INICIAL } from '../lib/personagem.ts';
import { montarLivroA5, PAGINA_A5, quebrarLinhas } from '../lib/livro-pdf.ts';

let casos = 0;
const ok = (cond: boolean, msg: string) => {
  casos++;
  assert.ok(cond, msg);
};
const A = new URL('../assets/', import.meta.url).pathname;
const ler = (c: string) => readFileSync(A + c);

/** largura e altura de um JPEG, lidas do cabeçalho (SOF) */
function tamanhoDoJpeg(b: Buffer): [number, number] | null {
  for (let i = 2; i < b.length - 9; ) {
    if (b[i] !== 0xff) return null;
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xc3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

// 1. Os arquivos de cada tema: cada cena que o plano cita existe, é JPEG 1024 x 1536, a área da
// criança cabe nela, e o modelo (fontes e páginas fixas) está em assets/.
for (const tema of ['basquete', 'futebol'] as const) {
  const H = HISTORIAS_DA_TURMA[tema]!;
  const L = LIVROS_AUTOMATICOS[tema];
  ok(Boolean(L), `${tema}: tem livro automático`);
  for (const c of [...H.paginas.map((p) => p.cenaBase), H.capa.cenaBaseColorida, H.certificado.cenaBase]) {
    ok(existsSync(A + c), `${tema}: falta a cena ${c}`);
    const t = tamanhoDoJpeg(ler(c));
    ok(t?.[0] === 1024 && t?.[1] === 1536, `${tema}: ${c} não é 1024 x 1536 (veio ${t})`);
  }
  for (const [nome, area] of [...H.paginas.map((p) => [`página ${p.pagina}`, p.areaPx] as const), ['capa', H.capa.areaPx] as const]) {
    ok(Boolean(area) && area![0] >= 0 && area![1] >= 0 && area![0] + area![2] <= 1024 && area![1] + area![3] <= 1536 && area![2] > 100 && area![3] > 200, `${tema}, ${nome}: área da criança fora da cena`);
  }
  for (const f of [L!.modelo.paginasFixas, L!.modelo.fontes.titulo, L!.modelo.fontes.texto]) ok(existsSync(A + f), `${tema}: falta ${f}`);
  ok((await PDFDocument.load(ler(L!.modelo.paginasFixas))).getPageCount() === 2, `${tema}: o modelo traz o fundo da dedicatória e a contracapa`);
}

// 2. A quebra de linha igual à dos modelos do dono (conferida contra os PDFs dele em 01/11/2026).
const fonteDo = async (tema: 'basquete' | 'futebol') => {
  const d = await PDFDocument.create();
  d.registerFontkit(fontkit);
  return d.embedFont(ler(LIVROS_AUTOMATICOS[tema]!.modelo.fontes.texto));
};
const MB = LIVROS_AUTOMATICOS.basquete!.modelo;
const nunito = await fonteDo('basquete');
const T = MB.historia.texto;
const quebra = (t: string) => quebrarLinhas(t, nunito, T.tamanho, T.largura, T.parenteseNovaLinha);
const HB = HISTORIAS_DA_TURMA.basquete!;
const p5 = quebra(HB.paginas[4].texto);
ok(p5.length === 3 && p5[1].endsWith('queria a') && p5[2] === 'bola.', `basquete, página 5 quebra como no modelo: ${JSON.stringify(p5)}`);
ok(quebra(HB.paginas[0].texto).at(-1) === '(Psiu… quem está lá na arquibancada?)', 'basquete: o parêntese da página 1 começa linha nova');
const blocoDoCert = MB.certificado.blocos[1];
const cert = quebrarLinhas(blocoDoCert.texto.replace('{NOME}', '{NOME}'), nunito, blocoDoCert.tamanho, blocoDoCert.largura!, false);
ok(cert.length === 2 && cert[1].startsWith('Little\u00a0Paws'), `basquete: no certificado, "Little Paws" não se separa: ${JSON.stringify(cert)}`);
ok(quebra('palavra '.repeat(80)).every((l) => nunito.widthOfTextAtSize(l, T.tamanho) <= T.largura * 1.005), 'nenhuma linha passa da largura');
const fredoka = await fonteDo('futebol');
const TF = LIVROS_AUTOMATICOS.futebol!.modelo.historia.texto;
const f1 = quebrarLinhas(HISTORIAS_DA_TURMA.futebol!.paginas[0].texto, fredoka, TF.tamanho, TF.largura, TF.parenteseNovaLinha);
ok(f1.length === 3 && f1[1].endsWith('(Psiu… tem alguém') && f1[2] === 'atrás da árvore!)', `futebol: no modelo o parêntese segue na mesma linha: ${JSON.stringify(f1)}`);

// 3. O livro inteiro de cada tema: 20 páginas A5, completo (capa, dedicatória, 16, certificado,
// contracapa), com nome com acento e nome comprido.
for (const tema of ['basquete', 'futebol'] as const) {
  const H = HISTORIAS_DA_TURMA[tema]!;
  const livro = async (nome: string) => {
    const plano = planoDoLivro({ tema, nome, idade: 6, produto: 'presente', personagem: PERSONAGEM_INICIAL });
    const cena = new Map([['capa', ler(H.capa.cenaBaseColorida)], ...H.paginas.map((p) => [chaveDaPagina(p.pagina), ler(p.cenaBase)] as [string, Buffer])]);
    return montarLivroA5(entradaDoLivro(tema, plano, { nome, dedicatoria: null, superpoder: 'Coragem' }, { imagem: (c) => cena.get(c)!, asset: (c) => ler(c) }));
  };
  const bytes = await livro('Ângela Conceição');
  const pdf = await PDFDocument.load(bytes);
  ok(pdf.getPageCount() === 20, `${tema}: o Presente tem 20 páginas`);
  ok(pdf.getPages().every((p) => Math.abs(p.getWidth() - PAGINA_A5.largura) < 0.1 && Math.abs(p.getHeight() - PAGINA_A5.altura) < 0.1), `${tema}: todas as páginas em A5`);
  ok(bytes.length < 15_000_000, `${tema}: o PDF cabe num e-mail e no bucket (${(bytes.length / 1e6).toFixed(1)} MB)`);
  ok(pdf.getTitle() === H.titulo.replace('{NOME}', 'Ângela Conceição'), `${tema}: o título do arquivo é o do livro`);
  ok((await PDFDocument.load(await livro('Maria Valentina Eduarda'))).getPageCount() === 20, `${tema}: nome comprido também monta`);
}

// 4. O que a OpenAI recebe: capa + 16 páginas, a ordem das imagens dita, a área em %, e nunca o nome.
const plano = planoDoLivro({ tema: 'basquete', nome: 'Maria Eduarda', idade: 6, produto: 'presente', personagem: PERSONAGEM_INICIAL });
const itens = itensDoLivro('basquete', plano);
ok(itens.length === 17 && itens[0].chave === 'capa' && itens.at(-1)!.chave === 'p16', 'capa e as 16 páginas');
ok(itens.slice(1).every((i) => /^The FIRST attached image is the base scene/.test(i.prompt)) && itens.every((i) => /SECOND attached image is the approved character sheet/.test(i.prompt)), 'todo prompt diz qual imagem é a cena e qual é a ficha');
// a capa é a publicada com a criança (dono, 01/11/2026): o título e os autores da arte não podem mudar
ok(itens[0].cena === 'temas/basquete/capa-publicada.jpg' && /published children's book cover/.test(itens[0].prompt), 'a capa parte da capa publicada');
ok(['LITTLE PAWS, BIG GAME', 'A Story About Teamwork', 'Rodrigo Moraes & Luana David'].every((t) => itens[0].prompt.includes(`"${t}"`)), 'o prompt da capa manda manter as letras da capa publicada');
ok(/wearing the Little Paws basketball uniform/.test(itens[0].prompt), 'na capa, a criança de uniforme do time');
ok(itens.slice(1).every((i) => /roughly from \d+% to \d+% of the width/.test(i.prompt)), 'todo prompt de página diz onde fica a área');
ok(itens.every((i) => !i.prompt.includes('Maria') && !i.prompt.includes('Eduarda') && !/[{}]/.test(i.prompt)), 'o nome nunca vai para o prompt e nada de variável sobrando');
ok(itens[0].prompt.includes('colored version') && itens.slice(1).every((i) => i.prompt.includes('line-art version')), 'a capa usa a ficha colorida; as páginas, a de contorno');
ok(JSON.stringify(itensDoLivro('basquete', plano, ['capa', 'p01']).map((i) => i.chave).slice(0, 2)) === '["p02","p03"]', 'refazer pula as que já estão prontas');
ok(itensDoLivro('futebol', planoDoLivro({ tema: 'futebol', nome: 'Bia', idade: 5, produto: 'presente', personagem: PERSONAGEM_INICIAL })).length === 17, 'o futebol também sai sozinho: capa e 16 páginas');
ok(chavesDoLivro('basquete', plano).length === 17, 'o livro só monta com as 17 imagens');
ok(!/bottom 22%/.test(itens[0].prompt) && itens.slice(1).every((i) => /bottom 22%/.test(i.prompt)), 'a capa não pede rodapé branco; as páginas pedem');
// no bom humor o Pip ri (o texto diz): a trava da 13 deixa o rosto dele vir da OpenAI; nos outros superpoderes, não
const p13 = (sp: 'bom_humor' | 'coragem') =>
  itensDoLivro('basquete', planoDoLivro({ tema: 'basquete', nome: 'Bia', idade: 5, produto: 'presente', personagem: { ...PERSONAGEM_INICIAL, superpoder: sp } })).find((i) => i.chave === 'p13')!;
const [px, py] = [680, 650];
const cobre = (t: number[]) => px >= t[0] && px <= t[0] + t[2] && py >= t[1] && py <= t[1] + t[3];
ok(cobre(p13('bom_humor').trava) && !cobre(p13('coragem').trava), 'a trava da 13 cobre o rosto do Pip só no bom humor');
ok(JSON.stringify(p13('bom_humor').area) === JSON.stringify(p13('coragem').area), 'e o lugar da criança no prompt não muda');
ok(itens.filter((i) => i.chave !== 'p13' && i.chave !== 'p15').every((i) => JSON.stringify(i.trava) === JSON.stringify(i.area)), 'nas outras páginas, a trava é só a área da criança');
// a bola da 15 (teste do Tito, 01/11/2026): a trava apagava a bola do arremesso; o caminho dela entra na trava
for (const tema of ['basquete', 'futebol'] as const) {
  const i15 = itensDoLivro(tema, planoDoLivro({ tema, nome: 'Bia', idade: 5, produto: 'presente', personagem: PERSONAGEM_INICIAL })).find((i) => i.chave === 'p15')!;
  const extra = HISTORIAS_DA_TURMA[tema]!.paginas[14].travaExtraPx!;
  const dentro = (t: number[], x: number, y: number) => x >= t[0] && x <= t[0] + t[2] && y >= t[1] && y <= t[1] + t[3];
  ok(dentro(i15.trava, extra[0] + extra[2] - 5, extra[1] + 5) && !dentro(i15.area, extra[0] + extra[2] - 5, extra[1] + 5), `${tema}: a trava da 15 deixa a bola aparecer fora da área da criança`);
}
const folga = areaComFolga([10, 20, 100, 200]);
ok(folga.left === 0 && folga.top === 0 && folga.width === 170 && folga.height === 280, 'a folga não sai da cena');
const g = areaComFolga([1000, 1500, 24, 36]);
ok(g.left + g.width <= 1024 && g.top + g.height <= 1536, 'nem do outro lado');

// 5. Os e-mails: sem travessão, o do dono vai para o dono, o da família para a família.
const emails = [
  emailDeRevisao({ nome: 'Bia', tituloDoLivro: 'Bia entra na quadra!', pedidoId: 'x', linkDeRevisao: 'https://a' }),
  emailDeFalha({ nome: 'Bia', pedidoId: 'x', faltando: ['p07'], erro: 'recusou', linkDeRevisao: 'https://a' }),
  emailParaFamilia({ para: 'f@x.com', responsavel: 'Carla Souza', nome: 'Bia', linkDaConta: 'https://a/conta' }),
];
ok(emails.every((e) => !/[\u2013\u2014]/.test(e.assunto + e.texto)), 'e-mails sem travessão');
ok(emails[0].para === emails[1].para && emails[2].para === 'f@x.com' && emails[2].texto.startsWith('Oi, Carla!'), 'cada e-mail para quem deve');

console.log(`livro: ${casos} casos ok`);
