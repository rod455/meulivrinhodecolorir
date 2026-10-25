import 'server-only';

// As fichas no Supabase (migração 0005). Toda leitura aqui é com a chave de
// serviço; quem chama já conferiu a conta (rotas da família) ou o bilhete
// de uso único (rotas do n8n).

import sharp from 'sharp';
import type { FichaNoBanco } from '@/lib/ficha';
import type { Personagem } from '@/lib/personagem';
import { svgDaMarca } from '@/lib/marca';
import { comChaveDeServico } from './fotos';

const BUCKET = 'fichas';

export type Ficha = FichaNoBanco & {
  user_id: string;
  personagem: Personagem;
  idade: number;
  prompt: string;
  caminho_foto: string | null;
  token: string | null;
  caminho_imagem: string | null;
  erro: string | null;
  aprovada_em: string | null;
};

const json = { 'content-type': 'application/json' };

export async function fichaPorId(id: string): Promise<Ficha | null> {
  const r = await comChaveDeServico(`/rest/v1/fichas?select=*&id=eq.${id}`);
  if (!r.ok) throw new Error(`fichas ${r.status}`);
  return ((await r.json()) as Ficha[])[0] ?? null;
}

/** As fichas da conta nas últimas 48 horas: base do limite e da ficha em andamento. */
export async function fichasRecentes(userId: string): Promise<Ficha[]> {
  const desde = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const r = await comChaveDeServico(`/rest/v1/fichas?select=*&user_id=eq.${userId}&criada_em=gte.${desde}&order=criada_em.desc`);
  if (!r.ok) throw new Error(`fichas ${r.status}`);
  return (await r.json()) as Ficha[];
}

export async function criarFicha(linha: Omit<Ficha, 'criada_em' | 'caminho_imagem' | 'erro' | 'aprovada_em' | 'pedido_id' | 'status'>): Promise<void> {
  const r = await comChaveDeServico('/rest/v1/fichas', {
    method: 'POST',
    headers: { ...json, prefer: 'return=minimal' },
    body: JSON.stringify({ ...linha, status: 'gerando' }),
  });
  if (!r.ok) throw new Error(`fichas ${r.status}: ${await r.text()}`);
}

export async function mudarFicha(id: string, campos: Partial<Ficha>, condicao = ''): Promise<void> {
  const r = await comChaveDeServico(`/rest/v1/fichas?id=eq.${id}${condicao}`, {
    method: 'PATCH',
    headers: { ...json, prefer: 'return=minimal' },
    body: JSON.stringify(campos),
  });
  if (!r.ok) throw new Error(`fichas ${r.status}`);
}

/** A foto e o aceite passam a ser da conta já na ficha (antes só no pedido): é ela que pode apagar. */
export async function tomarFoto(caminho: string, userId: string): Promise<boolean> {
  const r = await comChaveDeServico(`/rest/v1/fotos?select=user_id&caminho=eq.${encodeURIComponent(caminho)}`);
  if (!r.ok) throw new Error(`fotos ${r.status}`);
  const [foto] = (await r.json()) as { user_id: string | null }[];
  if (!foto || (foto.user_id && foto.user_id !== userId)) return false;
  if (!foto.user_id) {
    const p = await comChaveDeServico(`/rest/v1/fotos?caminho=eq.${encodeURIComponent(caminho)}&user_id=is.null`, {
      method: 'PATCH',
      headers: { ...json, prefer: 'return=minimal' },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!p.ok) throw new Error(`fotos ${p.status}`);
    // o aceite da foto também passa a ser da conta, mesmo que a ficha final venha sem foto
    const c = await comChaveDeServico(`/rest/v1/consentimentos?caminho=eq.${encodeURIComponent(caminho)}&user_id=is.null`, {
      method: 'PATCH',
      headers: { ...json, prefer: 'return=minimal' },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!c.ok) throw new Error(`consentimentos ${c.status}`);
  }
  return true;
}

/** Link de 10 minutos para o n8n baixar a foto; a foto nunca sai do bucket de outro jeito. */
export async function linkDaFoto(caminho: string): Promise<string> {
  const r = await comChaveDeServico(`/storage/v1/object/sign/fotos-criancas/${caminho}`, {
    method: 'POST',
    headers: json,
    body: JSON.stringify({ expiresIn: 600 }),
  });
  if (!r.ok) throw new Error(`storage ${r.status}`);
  const { signedURL } = (await r.json()) as { signedURL: string };
  return `${process.env.SUPABASE_URL}/storage/v1${signedURL}`;
}

export async function guardarImagemDaFicha(id: string, imagem: Buffer): Promise<string> {
  const caminho = `${id}.jpg`;
  const jpeg = await sharp(imagem).jpeg({ quality: 90 }).toBuffer();
  const r = await comChaveDeServico(`/storage/v1/object/${BUCKET}/${caminho}`, {
    method: 'POST',
    headers: { 'content-type': 'image/jpeg', 'x-upsert': 'true' },
    body: new Uint8Array(jpeg),
  });
  if (!r.ok) throw new Error(`storage ${r.status}: ${await r.text()}`);
  return caminho;
}

export async function lerImagemDaFicha(caminho: string): Promise<Buffer> {
  const r = await comChaveDeServico(`/storage/v1/object/${BUCKET}/${caminho}`);
  if (!r.ok) throw new Error(`storage ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

/** Os arquivos das fichas da conta, para apagar junto com ela. */
export async function imagensDasFichas(userId: string): Promise<string[]> {
  const r = await comChaveDeServico(`/rest/v1/fichas?select=caminho_imagem&user_id=eq.${userId}`);
  if (!r.ok) throw new Error(`fichas ${r.status}`);
  return ((await r.json()) as { caminho_imagem: string | null }[]).map((f) => f.caminho_imagem).filter((c): c is string => Boolean(c));
}

/**
 * A prévia que a família vê antes de pagar: pequena e com marca d'água em
 * diagonal, para um print não servir de arte. A imagem limpa só vai no livro.
 */
export async function previaComMarca(imagem: Buffer): Promise<Buffer> {
  const largura = 640;
  const base = sharp(imagem).resize({ width: largura, withoutEnlargement: true });
  const { width = largura, height = 427 } = await base.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info);
  const marca = Buffer.from(svgDaMarca(width, height));
  return base.composite([{ input: marca, top: 0, left: 0 }]).jpeg({ quality: 68 }).toBuffer();
}
