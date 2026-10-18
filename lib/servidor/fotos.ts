import 'server-only';

// A foto da criança no armazenamento privado do Supabase (bucket
// `fotos-criancas`, migração 0002). Sem Supabase ligado não há foto: o
// formulário cai para as características.

import { DIAS_ATE_APAGAR } from '@/lib/foto';

const BUCKET = 'fotos-criancas';

export function fotoLigada(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function supabase(caminho: string, init: RequestInit & { headers?: Record<string, string> } = {}) {
  return fetch(`${process.env.SUPABASE_URL}${caminho}`, {
    ...init,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      ...init.headers,
    },
    cache: 'no-store',
  });
}

/** Só o prefixo da rede: prova o aceite sem guardar o endereço de ninguém. */
export function redeDoIp(ip: string | null): string | null {
  const v4 = ip?.split(',')[0].trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/);
  return v4 ? `${v4[1]}.${v4[2]}.${v4[3]}.0/24` : null;
}

/** Guarda a foto já sem metadados e registra a foto e o consentimento. Devolve o caminho. */
export async function guardarFoto(jpeg: Buffer, consentimento: { versao: string; rede: string | null }): Promise<string> {
  const caminho = `fotos/${crypto.randomUUID()}.jpg`;
  const envio = await supabase(`/storage/v1/object/${BUCKET}/${caminho}`, {
    method: 'POST',
    headers: { 'content-type': 'image/jpeg', 'x-upsert': 'false' },
    body: new Uint8Array(jpeg),
  });
  if (!envio.ok) throw new Error(`storage ${envio.status}: ${await envio.text()}`);

  const apagarEm = new Date(Date.now() + DIAS_ATE_APAGAR * 24 * 60 * 60 * 1000).toISOString();
  const registro = await supabase('/rest/v1/fotos', {
    method: 'POST',
    headers: { 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify({ caminho, apagar_em: apagarEm }),
  });
  if (!registro.ok) {
    // foto sem registro nunca seria apagada pela limpeza: tira do bucket já
    await apagarDoBucket([caminho]).catch(() => undefined);
    throw new Error(`fotos ${registro.status}: ${await registro.text()}`);
  }
  const aceite = await supabase('/rest/v1/consentimentos', {
    method: 'POST',
    headers: { 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify({ tipo: 'foto_crianca', versao: consentimento.versao, caminho, rede: consentimento.rede }),
  });
  if (!aceite.ok) {
    await apagarDoBucket([caminho]).catch(() => undefined);
    await supabase(`/rest/v1/fotos?caminho=eq.${encodeURIComponent(caminho)}`, { method: 'DELETE' }).catch(() => undefined);
    throw new Error(`consentimentos ${aceite.status}: ${await aceite.text()}`);
  }
  return caminho;
}

/** A foto existe e ainda não foi apagada? Barra pedido com caminho inventado ou vencido. */
export async function fotoDisponivel(caminho: string): Promise<boolean> {
  const r = await supabase(`/rest/v1/fotos?select=caminho&caminho=eq.${encodeURIComponent(caminho)}&apagada_em=is.null&apagar_em=gt.${new Date().toISOString()}`);
  if (!r.ok) throw new Error(`fotos ${r.status}`);
  return ((await r.json()) as unknown[]).length === 1;
}

export async function ligarFotoAoPedido(caminho: string, pedidoId: string): Promise<void> {
  const r = await supabase(`/rest/v1/fotos?caminho=eq.${encodeURIComponent(caminho)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify({ pedido_id: pedidoId }),
  });
  if (!r.ok) throw new Error(`fotos ${r.status}`);
}

async function apagarDoBucket(caminhos: string[]): Promise<void> {
  const r = await supabase(`/storage/v1/object/${BUCKET}`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prefixes: caminhos }),
  });
  if (!r.ok) throw new Error(`storage ${r.status}: ${await r.text()}`);
}

/** Apaga do bucket as fotos vencidas e marca a hora. Roda todo dia pela Vercel Cron. */
export async function apagarFotosVencidas(): Promise<number> {
  const agora = new Date().toISOString();
  const r = await supabase(`/rest/v1/fotos?select=caminho&apagada_em=is.null&apagar_em=lte.${agora}&limit=500`);
  if (!r.ok) throw new Error(`fotos ${r.status}`);
  const caminhos = ((await r.json()) as { caminho: string }[]).map((f) => f.caminho);
  if (caminhos.length === 0) return 0;
  await apagarDoBucket(caminhos);
  const lista = caminhos.map((c) => `"${c}"`).join(',');
  const marca = await supabase(`/rest/v1/fotos?caminho=in.(${encodeURIComponent(lista)})`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify({ apagada_em: agora }),
  });
  if (!marca.ok) throw new Error(`fotos ${marca.status}`);
  return caminhos.length;
}
