// A foto da criança sai sem metadados, no tamanho certo e só de formato aceito.
// Se isto quebrar, o GPS da casa da família vai junto para o armazenamento.
//
// Rode com: npm run conferir:foto
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { LADO_MAXIMO, LIMITE_DA_FOTO, prepararFoto } from '../lib/foto.ts';

let casos = 0;
const ok = (cond: boolean, msg: string) => {
  casos++;
  assert.ok(cond, msg);
};

// uma foto "de celular": grande, deitada pela orientação e com EXIF de GPS e aparelho
const comExif = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#c38662' } })
  .jpeg()
  .withMetadata({ orientation: 6 })
  .withExif({ IFD0: { Make: 'CelularDeTeste', Model: 'X1' }, IFD3: { GPSLatitudeRef: 'S', GPSLatitude: '23/1 33/1 0/1' } })
  .toBuffer();
const antes = await sharp(comExif).metadata();
ok(Boolean(antes.exif) && antes.orientation === 6, 'a foto de teste tem EXIF (senão o teste não prova nada)');

const preparada = await prepararFoto(comExif);
ok(preparada.ok, 'foto JPG passa');
if (preparada.ok) {
  const depois = await sharp(preparada.foto.jpeg).metadata();
  ok(depois.format === 'jpeg', 'sai em JPEG');
  ok(!depois.exif && !depois.xmp && !depois.iptc, 'sai sem EXIF, XMP nem IPTC');
  ok(!preparada.foto.jpeg.includes(Buffer.from('CelularDeTeste')), 'o nome do aparelho não sobra no arquivo');
  ok(Math.max(depois.width!, depois.height!) <= LADO_MAXIMO, 'lado maior até o limite');
  ok(depois.height! > depois.width!, 'a orientação da câmera foi aplicada antes de tirar o EXIF');
}

const png = await sharp({ create: { width: 400, height: 300, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer();
const dePng = await prepararFoto(png);
ok(dePng.ok && dePng.foto.largura === 400, 'PNG pequeno passa sem ser esticado');

const gif = await sharp({ create: { width: 10, height: 10, channels: 3, background: '#fff' } }).gif().toBuffer();
ok(!(await prepararFoto(gif)).ok, 'GIF é recusado');
ok(!(await prepararFoto(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))).ok, 'SVG é recusado');
ok(!(await prepararFoto(Buffer.from('não é imagem'))).ok, 'arquivo que não é imagem é recusado');
ok(!(await prepararFoto(Buffer.alloc(0))).ok, 'arquivo vazio é recusado');
ok(!(await prepararFoto(Buffer.alloc(LIMITE_DA_FOTO + 1))).ok, 'acima de 10 MB é recusado');

console.log(`foto: ${casos} casos ok`);
