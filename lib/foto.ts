// A foto da criança antes de ser guardada (decisão do dono, 18/10/2026; regra
// de LGPD do CLAUDE.md): só JPG, PNG ou WebP de verdade, até 10 MB, e sempre
// redesenhada do zero em JPEG. Redesenhar é o que tira os metadados (GPS,
// aparelho, data): o arquivo guardado não carrega nada além dos pixels.
// Conferido por `npm run conferir:foto`.

import sharp from 'sharp';

export const LIMITE_DA_FOTO = 10 * 1024 * 1024;
/** a ficha só precisa do rosto e do cabelo; maior que isso é dado à toa */
export const LADO_MAXIMO = 1600;
export const DIAS_ATE_APAGAR = 7;

export type FotoPreparada = { jpeg: Buffer; largura: number; altura: number };

export async function prepararFoto(bruto: Buffer): Promise<{ ok: true; foto: FotoPreparada } | { ok: false; erro: string }> {
  if (bruto.length === 0) return { ok: false, erro: 'Escolha uma foto.' };
  if (bruto.length > LIMITE_DA_FOTO) return { ok: false, erro: 'A foto pode ter até 10 MB.' };
  let formato: string | undefined;
  try {
    formato = (await sharp(bruto).metadata()).format;
  } catch {
    return { ok: false, erro: 'Não conseguimos abrir essa foto. Tente uma em JPG ou PNG.' };
  }
  // o tipo vem do conteúdo, nunca do nome do arquivo nem do que o navegador diz
  if (formato !== 'jpeg' && formato !== 'png' && formato !== 'webp') {
    return { ok: false, erro: 'Envie a foto em JPG ou PNG.' };
  }
  try {
    const { data, info } = await sharp(bruto)
      .rotate() // aplica a orientação da câmera antes de jogar o EXIF fora
      .resize(LADO_MAXIMO, LADO_MAXIMO, { fit: 'inside', withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 85 })
      .toBuffer({ resolveWithObject: true });
    return { ok: true, foto: { jpeg: data, largura: info.width, altura: info.height } };
  } catch {
    return { ok: false, erro: 'Não conseguimos abrir essa foto. Tente uma em JPG ou PNG.' };
  }
}
