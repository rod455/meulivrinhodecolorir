import 'server-only';

// O livro automático no banco e nos buckets (migração 0008). Leitura e escrita com a
// chave de serviço; quem chama já conferiu o bilhete do n8n ou a chave de revisão do dono.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { PlanoDoLivro } from '@/lib/geracao';
import { bilheteConfere, ehUuid, novoBilhete } from '@/lib/ficha';
import { areaComFolga, LIVROS_AUTOMATICOS } from '@/lib/livro';
import type { Personagem } from '@/lib/personagem';
import { apagarDoBucket, comChaveDeServico } from './fotos';

export type PedidoDoLivro = {
  id: string;
  tema: string;
  produto: string;
  /** colorir, ilustrada ou combo (0011); pedidos antigos chegam sem, e são de colorir */
  versao?: string;
  status: string;
  nome_crianca: string;
  dedicatoria: string | null;
  responsavel: string;
  email: string;
  personagem: Personagem | null;
  plano: PlanoDoLivro | null;
  link_pdf: string | null;
  livro_status: 'gerando' | 'montado' | 'falhou' | 'liberado' | null;
  livro_token: string | null;
  livro_revisao: string | null;
  livro_pdf: string | null;
  livro_paginas: string[];
  livro_erro: string | null;
  livro_avisos: string[];
};

const json = { 'content-type': 'application/json' };
const CAMPOS =
  'id,tema,produto,versao,status,nome_crianca,dedicatoria,responsavel,email,personagem,plano,link_pdf,livro_status,livro_token,livro_revisao,livro_pdf,livro_paginas,livro_erro,livro_avisos';

export async function pedidoDoLivro(id: string): Promise<PedidoDoLivro | null> {
  const r = await comChaveDeServico(`/rest/v1/pedidos?select=${CAMPOS}&id=eq.${id}`);
  if (!r.ok) throw new Error(`pedidos ${r.status}`);
  return ((await r.json()) as PedidoDoLivro[])[0] ?? null;
}

/** Muda o pedido; a condição (ex.: "&livro_status=eq.gerando") evita corrida entre dois avisos. Devolve se mudou. */
export async function mudarPedidoDoLivro(id: string, campos: Partial<PedidoDoLivro> & Record<string, unknown>, condicao = ''): Promise<boolean> {
  const r = await comChaveDeServico(`/rest/v1/pedidos?id=eq.${id}${condicao}`, {
    method: 'PATCH',
    headers: { ...json, prefer: 'return=representation' },
    body: JSON.stringify({ ...campos, livro_atualizado_em: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error(`pedidos ${r.status}: ${await r.text()}`);
  return ((await r.json()) as unknown[]).length > 0;
}

/** Os arquivos do modelo (cenas, fontes, contracapa), que moram em assets/ e não são publicados. */
export function lerAsset(caminho: string): Buffer {
  const raiz = path.join(process.cwd(), 'assets');
  const alvo = path.join(raiz, caminho);
  if (!alvo.startsWith(raiz + path.sep)) throw new Error('caminho fora de assets');
  return readFileSync(alvo);
}

/**
 * A trava (versão de 01/11/2026, depois do teste do Tito): a página fica inteira como a
 * OpenAI devolveu, porque colar só a área da criança sobre a cena original deixava emendas
 * que cortavam personagens. Em vez de colar, mede quanto da cena mudou fora do lugar da
 * criança (com folga): a porcentagem de pixels que mudaram de verdade, não o serrilhado.
 */
export async function mudancaForaDaArea(gerada: Buffer, cena: Buffer, area: [number, number, number, number]): Promise<number> {
  const { width = 0, height = 0 } = await sharp(cena).metadata();
  const cinza = async (b: Buffer) => sharp(b).resize(width, height, { fit: 'fill' }).greyscale().blur(1.2).raw().toBuffer();
  const [g, c] = await Promise.all([cinza(gerada), cinza(cena)]);
  const r = areaComFolga(area, undefined, width, height);
  let fora = 0;
  let mudou = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x >= r.left && x < r.left + r.width && y >= r.top && y < r.top + r.height) continue;
      fora++;
      if (Math.abs(g[y * width + x] - c[y * width + x]) > 80) mudou++;
    }
  }
  return fora ? (100 * mudou) / fora : 0;
}

/**
 * A página como vai para o livro: 1024 x 1536 (2:3, o que a OpenAI devolve), em JPEG. Não usa
 * o tamanho da cena: a capa publicada é 800 x 1280 e sairia achatada.
 */
export async function paginaDoLivro(gerada: Buffer): Promise<Buffer> {
  return sharp(gerada).resize(1024, 1536, { fit: 'fill' }).jpeg({ quality: 92 }).toBuffer();
}

/** Um aviso para o dono olhar na revisão (acréscimo atômico: as páginas chegam juntas). */
export async function anotarAviso(id: string, aviso: string): Promise<void> {
  const r = await comChaveDeServico('/rest/v1/rpc/anotar_aviso_do_livro', { method: 'POST', headers: json, body: JSON.stringify({ pid: id, aviso }) });
  if (!r.ok) throw new Error(`aviso ${r.status}: ${await r.text()}`);
}

export async function guardarPagina(pedido: PedidoDoLivro, chave: string, jpeg: Buffer): Promise<void> {
  const caminho = `${pedido.id}/${chave}.jpg`;
  const r = await comChaveDeServico(`/storage/v1/object/paginas/${caminho}`, {
    method: 'POST',
    headers: { 'content-type': 'image/jpeg', 'x-upsert': 'true' },
    body: new Uint8Array(jpeg),
  });
  if (!r.ok) throw new Error(`storage ${r.status}: ${await r.text()}`);
  // o n8n manda as páginas ao mesmo tempo: o acréscimo à lista é uma operação só no banco
  // (migração 0009), porque ler, acrescentar e regravar perdia páginas (execução 9402)
  const r2 = await comChaveDeServico('/rest/v1/rpc/anotar_pagina_do_livro', {
    method: 'POST',
    headers: json,
    body: JSON.stringify({ pid: pedido.id, caminho }),
  });
  if (!r2.ok) throw new Error(`anotar página ${r2.status}: ${await r2.text()}`);
}

export async function lerPagina(caminho: string): Promise<Buffer> {
  const r = await comChaveDeServico(`/storage/v1/object/paginas/${caminho}`);
  if (!r.ok) throw new Error(`storage ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

export const apagarPaginas = (caminhos: string[]) => (caminhos.length ? apagarDoBucket(caminhos, 'paginas') : Promise.resolve());

export async function guardarPdf(id: string, pdf: Uint8Array): Promise<string> {
  const caminho = `${id}.pdf`;
  const r = await comChaveDeServico(`/storage/v1/object/livros/${caminho}`, {
    method: 'POST',
    headers: { 'content-type': 'application/pdf', 'x-upsert': 'true' },
    body: pdf,
  });
  if (!r.ok) throw new Error(`storage ${r.status}: ${await r.text()}`);
  return caminho;
}

/** Link temporário para um arquivo privado (a ficha para o n8n, o PDF para o dono revisar). */
export async function linkAssinado(bucket: string, caminho: string, segundos: number): Promise<string> {
  const r = await comChaveDeServico(`/storage/v1/object/sign/${bucket}/${caminho}`, {
    method: 'POST',
    headers: json,
    body: JSON.stringify({ expiresIn: segundos }),
  });
  if (!r.ok) throw new Error(`storage ${r.status}`);
  const { signedURL } = (await r.json()) as { signedURL: string };
  return `${process.env.SUPABASE_URL}/storage/v1${signedURL}`;
}

/** Avisa o fluxo "Meu Livrinho | livro" do n8n; o corpo leva só id e bilhete. */
export async function avisarN8nDoLivro(corpo: { tipo: 'gerar' | 'avisar'; pedido_id: string; token: string }): Promise<boolean> {
  // o endereço não é segredo: o fluxo só aceita id e bilhete, e o site recusa o resto (os fluxos
  // do n8n também fixam o endereço do site). A variável existe para os testes apontarem ao falso.
  const destino = process.env.N8N_WEBHOOK_LIVRO || 'https://n8n.vocaboost.com.br/webhook/meu-livrinho-livro';
  const r = await fetch(destino, { method: 'POST', headers: json, body: JSON.stringify(corpo), signal: AbortSignal.timeout(15000) }).catch(() => null);
  return Boolean(r?.ok);
}

/**
 * Começa (ou recomeça) o livro de um pedido pago. Chamado pelo aviso do banco e pelo
 * "refazer" do dono; os dois podem chegar juntos, e a troca condicional garante que
 * só um começa. Nunca gasta nada com pedido que não está pago.
 */
export async function iniciarLivro(id: string): Promise<{ iniciado: boolean; motivo?: string }> {
  const pedido = await pedidoDoLivro(id);
  if (!pedido) return { iniciado: false, motivo: 'pedido não existe' };
  if (pedido.status !== 'pago') return { iniciado: false, motivo: 'pedido não está pago' };
  if (pedido.livro_status !== null) return { iniciado: false, motivo: `livro já está ${pedido.livro_status}` };
  if (pedido.produto !== 'presente' || !pedido.plano?.ficha?.aprovada || !(pedido.tema in LIVROS_AUTOMATICOS)) {
    return { iniciado: false, motivo: 'este pedido ainda não tem livro automático' };
  }
  const token = novoBilhete();
  const mudou = await mudarPedidoDoLivro(
    id,
    { livro_status: 'gerando', livro_token: token, livro_revisao: pedido.livro_revisao ?? novoBilhete(), livro_erro: null },
    '&status=eq.pago&livro_status=is.null',
  );
  if (!mudou) return { iniciado: false, motivo: 'outro aviso começou antes' };
  if (!(await avisarN8nDoLivro({ tipo: 'gerar', pedido_id: id, token }))) {
    await mudarPedidoDoLivro(id, { livro_status: 'falhou', livro_token: null, livro_erro: 'o n8n não respondeu ao pedido de gerar' }, '&livro_status=eq.gerando');
    return { iniciado: false, motivo: 'n8n não respondeu' };
  }
  return { iniciado: true };
}

/** O pedido em geração cujo bilhete confere (rotas do n8n). */
export async function pedidoComBilhete(id: unknown, token: unknown, status: PedidoDoLivro['livro_status'] = 'gerando'): Promise<PedidoDoLivro | null> {
  if (!ehUuid(id)) return null;
  const pedido = await pedidoDoLivro(id).catch(() => null);
  if (!pedido || pedido.livro_status !== status || !bilheteConfere(pedido.livro_token, token)) return null;
  return pedido;
}
