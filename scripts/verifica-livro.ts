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
import { areaComFolga, chavesDoLivro, emailDeFalha, emailDeRevisao, emailParaFamilia, itensDoLivro } from '../lib/livro.ts';
import { PERSONAGEM_INICIAL } from '../lib/personagem.ts';
import { LAYOUT_A5, montarLivroA5, PAGINA_A5, quebrarLinhas } from '../lib/livro-pdf.ts';

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

// 1. Os arquivos do basquete: cada cena que o plano cita existe, é JPEG 1024 x 1536 e a área da criança cabe nela.
const H = HISTORIAS_DA_TURMA.basquete!;
for (const c of [...H.paginas.map((p) => p.cenaBase), H.capa.cenaBaseColorida, H.certificado.cenaBase]) {
  ok(existsSync(A + c), `basquete: falta a cena ${c}`);
  const t = tamanhoDoJpeg(ler(c));
  ok(t?.[0] === 1024 && t?.[1] === 1536, `basquete: ${c} não é 1024 x 1536 (veio ${t})`);
}
for (const [nome, area] of [...H.paginas.map((p) => [`página ${p.pagina}`, p.areaPx] as const), ['capa', H.capa.areaPx] as const]) {
  ok(Boolean(area) && area![0] >= 0 && area![1] >= 0 && area![0] + area![2] <= 1024 && area![1] + area![3] <= 1536 && area![2] > 100 && area![3] > 200, `basquete, ${nome}: área da criança fora da cena`);
}
for (const f of ['temas/basquete/contracapa.pdf', 'livro/fontes/Baloo2-Bold.woff', 'livro/fontes/NunitoSans-Regular.woff']) ok(existsSync(A + f), `falta ${f}`);

// 2. A quebra de linha igual à do modelo do dono (conferida contra o PDF dele em 01/11/2026).
const doc = await PDFDocument.create();
doc.registerFontkit(fontkit);
const nunito = await doc.embedFont(ler('livro/fontes/NunitoSans-Regular.woff'));
const T = LAYOUT_A5.historia.texto;
const quebra = (t: string) => quebrarLinhas(t, nunito, T.tamanho, T.largura);
const p5 = quebra(H.paginas[4].texto);
ok(p5.length === 3 && p5[1].endsWith('queria a') && p5[2] === 'bola.', `página 5 quebra como no modelo: ${JSON.stringify(p5)}`);
const p1 = quebra(H.paginas[0].texto);
ok(p1.at(-1) === '(Psiu… quem está lá na arquibancada?)', `o parêntese da página 1 começa linha nova: ${JSON.stringify(p1)}`);
const C = LAYOUT_A5.certificado.texto;
const cert = quebrarLinhas('{NOME} faz parte do Time Little Paws de basquete!', nunito, C.tamanho, C.largura);
ok(cert.length === 2 && cert[1].startsWith('Little Paws'), `no certificado, "Little Paws" não se separa: ${JSON.stringify(cert)}`);
ok(quebra('palavra '.repeat(80)).every((l) => nunito.widthOfTextAtSize(l, T.tamanho) <= T.largura * 1.005), 'nenhuma linha passa da largura');

// 3. O livro inteiro: 20 páginas A5, nome com acento e nome comprido sem quebrar a montagem.
async function livro(nome: string) {
  return montarLivroA5({
    nome,
    restoDoTitulo: 'entra na quadra!',
    subtitulo: H.subtitulo,
    autores: 'Rodrigo Moraes & Luana David',
    quemPresenteia: 'sua família',
    dedicatoria: 'Que cada passe seja uma amizade e cada tentativa, uma nova aventura!',
    capa: ler(H.capa.cenaBaseColorida),
    paginas: H.paginas.map((p) => ({ pagina: p.pagina, imagem: ler(p.cenaBase), texto: (p.porSuperpoder?.coragem.texto ?? p.texto).replaceAll('{NOME}', nome) })),
    certificado: { arte: ler(H.certificado.cenaBase), linhas: `${nome} faz parte do Time Little Paws de basquete!`, superpoder: 'Coragem' },
    contracapa: ler('temas/basquete/contracapa.pdf'),
    fontes: { titulo: ler('livro/fontes/Baloo2-Bold.woff'), texto: ler('livro/fontes/NunitoSans-Regular.woff') },
  });
}
const bytes = await livro('Ângela Conceição');
const pdf = await PDFDocument.load(bytes);
ok(pdf.getPageCount() === 20, 'o Presente tem 20 páginas');
ok(pdf.getPages().every((p) => Math.abs(p.getWidth() - PAGINA_A5.largura) < 0.1 && Math.abs(p.getHeight() - PAGINA_A5.altura) < 0.1), 'todas as páginas em A5');
ok(bytes.length < 15_000_000, `o PDF cabe num e-mail e no bucket (${(bytes.length / 1e6).toFixed(1)} MB)`);
ok((await PDFDocument.load(await livro('Maria Valentina Eduarda'))).getPageCount() === 20, 'nome comprido também monta');

// 4. O que a OpenAI recebe: capa + 16 páginas, a ordem das imagens dita, a área em %, e nunca o nome.
const plano = planoDoLivro({ tema: 'basquete', nome: 'Maria Eduarda', idade: 6, produto: 'presente', personagem: PERSONAGEM_INICIAL });
const itens = itensDoLivro('basquete', plano);
ok(itens.length === 17 && itens[0].chave === 'capa' && itens.at(-1)!.chave === 'p16', 'capa e as 16 páginas');
ok(itens.every((i) => /^The FIRST attached image is the base scene/.test(i.prompt) && /SECOND attached image is the approved character sheet/.test(i.prompt)), 'todo prompt diz qual imagem é a cena e qual é a ficha');
ok(itens.every((i) => /roughly from \d+% to \d+% of the width/.test(i.prompt)), 'todo prompt diz onde fica a área');
ok(itens.every((i) => !i.prompt.includes('Maria') && !i.prompt.includes('Eduarda') && !/[{}]/.test(i.prompt)), 'o nome nunca vai para o prompt e nada de variável sobrando');
ok(itens[0].prompt.includes('colored version') && itens.slice(1).every((i) => i.prompt.includes('line-art version')), 'a capa usa a ficha colorida; as páginas, a de contorno');
ok(JSON.stringify(itensDoLivro('basquete', plano, ['capa', 'p01']).map((i) => i.chave).slice(0, 2)) === '["p02","p03"]', 'refazer pula as que já estão prontas');
ok(itensDoLivro('futebol', planoDoLivro({ tema: 'futebol', nome: 'Bia', idade: 5, produto: 'presente', personagem: PERSONAGEM_INICIAL })).length === 0, 'o futebol ainda não sai sozinho (falta o modelo A5 dele)');
ok(chavesDoLivro('basquete', plano).length === 17, 'o livro só monta com as 17 imagens');
ok(!/bottom 22%/.test(itens[0].prompt) && itens.slice(1).every((i) => /bottom 22%/.test(i.prompt)), 'a capa não pede rodapé branco; as páginas pedem');
// no bom humor o Pip ri (o texto diz): a trava da 13 deixa o rosto dele vir da OpenAI; nos outros superpoderes, não
const p13 = (sp: 'bom_humor' | 'coragem') =>
  itensDoLivro('basquete', planoDoLivro({ tema: 'basquete', nome: 'Bia', idade: 5, produto: 'presente', personagem: { ...PERSONAGEM_INICIAL, superpoder: sp } })).find((i) => i.chave === 'p13')!;
const [px, py] = [680, 650];
const cobre = (t: number[]) => px >= t[0] && px <= t[0] + t[2] && py >= t[1] && py <= t[1] + t[3];
ok(cobre(p13('bom_humor').trava) && !cobre(p13('coragem').trava), 'a trava da 13 cobre o rosto do Pip só no bom humor');
ok(JSON.stringify(p13('bom_humor').area) === JSON.stringify(p13('coragem').area), 'e o lugar da criança no prompt não muda');
ok(itens.filter((i) => i.chave !== 'p13').every((i) => JSON.stringify(i.trava) === JSON.stringify(i.area)), 'nas outras páginas, a trava é só a área da criança');
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
