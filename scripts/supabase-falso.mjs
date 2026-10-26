// Supabase de mentira para a suíte de navegador: o ambiente de teste não
// alcança o Supabase de verdade. Imita só o que o site usa: Auth (cadastro,
// senha, link por e-mail, sessão), REST com a regra de RLS "cada conta lê o
// que é dela", a função anonimizar_conta, o Storage e o webhook do n8n.
//
//   node scripts/supabase-falso.mjs 4556 /caminho/registro.jsonl http://localhost:3100
//
// O terceiro argumento é o site: o n8n falso (POST /n8n-ficha) faz o que o
// fluxo "Meu Livrinho: gerar ficha" faz, buscando o trabalho com o bilhete e
// devolvendo uma imagem em /api/ficha/pronta.
//
// Cada pedido de rede vira uma linha no registro, para a suíte conferir o que
// o site mandou. GET /__estado devolve o que está guardado.
import { createHmac, randomUUID } from 'node:crypto';
import { appendFileSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import sharp from 'sharp';

const [porta = '4556', registro = '/tmp/supabase-falso.jsonl', site = 'http://localhost:3100'] = process.argv.slice(2);
const CHAVE_DE_SERVICO = 'chave-de-servico-falsa';
const usuarios = new Map(); // email -> { id, email, senha, confirmado }
const pedidos = [];
const pedidosTurma = [];
const fotos = new Map(); // caminho -> linha
const consentimentos = [];
const arquivos = new Map(); // "bucket/caminho" -> bytes
const fichas = [];
let confirmarEmail = false;
let n8nFalha = false;
const trabalhosRecebidos = [];

// o que o fluxo do n8n faz, sem a OpenAI: busca o trabalho e devolve um desenho
async function n8nFicha({ ficha_id, token }) {
  const t = await fetch(`${site}/api/ficha/trabalho?id=${ficha_id}&token=${token}`);
  const trabalho = await t.json();
  trabalhosRecebidos.push({ status: t.status, ...trabalho });
  if (!t.ok) return;
  await new Promise((r) => setTimeout(r, 1500));
  if (n8nFalha) {
    // o nó "Avisa o site que falhou" manda JSON
    await fetch(`${site}/api/ficha/pronta`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ficha_id, token, erro: 'moderação recusou a imagem (teste)' }) });
    return;
  }
  // o nó "Devolve a imagem ao site" manda a imagem como arquivo (multipart), como a OpenAI devolveu
  const dados = new FormData();
  dados.append('ficha_id', ficha_id);
  dados.append('token', token);
  const png = await sharp({ create: { width: 1536, height: 1024, channels: 3, background: '#ffd23f' } }).png().toBuffer();
  dados.append('imagem', new Blob([png], { type: 'image/png' }), 'data.png');
  await fetch(`${site}/api/ficha/pronta`, { method: 'POST', body: dados });
}

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
function jwt(usuario) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const corpo = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: usuario.id, email: usuario.email, role: 'authenticated', aud: 'authenticated', exp })}`;
  return `${corpo}.${createHmac('sha256', 'falso').update(corpo).digest('base64url')}`;
}
function quemPeloToken(cabecalho) {
  const token = (cabecalho ?? '').replace(/^Bearer /, '');
  if (token === CHAVE_DE_SERVICO) return 'servico';
  try {
    const { sub } = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return [...usuarios.values()].find((u) => u.id === sub) ?? null;
  } catch {
    return null;
  }
}
const usuarioPublico = (u) => ({ id: u.id, aud: 'authenticated', role: 'authenticated', email: u.email, app_metadata: { provider: 'email' }, user_metadata: {}, created_at: new Date().toISOString(), email_confirmed_at: u.confirmado ? new Date().toISOString() : null });
const sessao = (u) => ({ access_token: jwt(u), token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: randomUUID(), user: usuarioPublico(u) });

function responder(r, status, corpo, cabecalhos = {}) {
  r.writeHead(status, { 'content-type': 'application/json', ...cabecalhos });
  r.end(corpo === undefined ? '' : JSON.stringify(corpo));
}

function filtrar(linhas, busca) {
  return linhas.filter((l) =>
    [...busca.entries()].every(([k, v]) => {
      if (['select', 'order', 'limit'].includes(k)) return true;
      if (v.startsWith('gte.')) return l[k] >= v.slice(4);
      if (v.startsWith('eq.')) return String(l[k]) === v.slice(3);
      if (v === 'is.null') return l[k] == null;
      if (v.startsWith('lte.')) return l[k] <= v.slice(4);
      if (v.startsWith('gt.')) return l[k] > v.slice(3);
      if (v.startsWith('in.(')) return v.slice(4, -1).split(',').map((x) => x.replace(/"/g, '')).includes(String(l[k]));
      return true;
    }),
  );
}

http
  .createServer((q, r) => {
    const partes = [];
    q.on('data', (c) => partes.push(c));
    q.on('end', () => {
      const corpo = Buffer.concat(partes);
      const u = new URL(q.url, 'http://x');
      const json = () => (corpo.length ? JSON.parse(corpo.toString()) : {});
      const quem = quemPeloToken(q.headers.authorization);
      r.setHeader('access-control-allow-origin', q.headers.origin ?? '*');
      r.setHeader('access-control-allow-credentials', 'true');
      r.setHeader('access-control-allow-headers', 'authorization, apikey, content-type, x-client-info, x-supabase-api-version, prefer, range');
      r.setHeader('access-control-allow-methods', 'GET, POST, PATCH, DELETE, OPTIONS, HEAD');
      r.setHeader('access-control-expose-headers', 'content-range');
      if (q.method === 'OPTIONS') return responder(r, 204);
      appendFileSync(registro, `${JSON.stringify({ m: q.method, p: u.pathname, s: u.search, quem: quem === 'servico' ? 'servico' : quem?.email ?? null, corpo: q.headers['content-type']?.includes('json') ? corpo.toString() : corpo.length })}\n`);

      // controle da suíte
      if (u.pathname === '/__estado') return responder(r, 200, { usuarios: [...usuarios.values()].map((x) => x.email), pedidos, pedidosTurma, fotos: [...fotos.values()], consentimentos, fichas, trabalhosRecebidos, arquivos: [...arquivos.keys()] });
      if (u.pathname === '/__n8n-falha') { n8nFalha = u.searchParams.get('ligar') === '1'; return responder(r, 200, { n8nFalha }); }
      if (u.pathname === '/n8n-ficha') { n8nFicha(json()).catch((e) => console.error('n8n falso', e)); return responder(r, 200, { recebido: true }); }
      if (u.pathname === '/__confirmar-email') { confirmarEmail = u.searchParams.get('ligar') === '1'; return responder(r, 200, { confirmarEmail }); }
      if (u.pathname === '/__pdf') { const p = pedidos.find((x) => x.id === u.searchParams.get('pedido')); if (p) { p.link_pdf = `${p.id}.pdf`; p.status = 'entregue'; arquivos.set(`livros/${p.id}.pdf`, Buffer.from('%PDF')); } return responder(r, 200, { ok: Boolean(p) }); }
      if (u.pathname === '/n8n') { appendFileSync(`${registro}.n8n`, `${corpo.toString()}\n`); return responder(r, 200, { ok: true }); }

      // Auth
      if (u.pathname === '/auth/v1/settings') return responder(r, 200, { external: { google: true, email: true } });
      if (u.pathname === '/auth/v1/signup' && q.method === 'POST') {
        const { email, password } = json();
        if (usuarios.has(email)) return responder(r, 422, { code: 422, error_code: 'user_already_exists', msg: 'User already registered' });
        const novo = { id: randomUUID(), email, senha: password, confirmado: !confirmarEmail };
        usuarios.set(email, novo);
        return responder(r, 200, confirmarEmail ? usuarioPublico(novo) : sessao(novo));
      }
      if (u.pathname === '/auth/v1/token' && u.searchParams.get('grant_type') === 'password') {
        const { email, password } = json();
        const conta = usuarios.get(email);
        if (!conta || conta.senha !== password) return responder(r, 400, { error: 'invalid_grant', error_description: 'Invalid login credentials', error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
        if (!conta.confirmado) return responder(r, 400, { error_code: 'email_not_confirmed', msg: 'Email not confirmed' });
        return responder(r, 200, sessao(conta));
      }
      if (u.pathname === '/auth/v1/otp') return responder(r, 200, {});
      if (u.pathname === '/auth/v1/user' && q.method === 'GET') return quem && quem !== 'servico' ? responder(r, 200, usuarioPublico(quem)) : responder(r, 401, { msg: 'invalid JWT' });
      if (u.pathname === '/auth/v1/user' && q.method === 'PUT') { if (!quem || quem === 'servico') return responder(r, 401, {}); const { password } = json(); if (password) quem.senha = password; return responder(r, 200, usuarioPublico(quem)); }
      if (u.pathname === '/auth/v1/logout') return responder(r, 204);
      if (u.pathname.startsWith('/auth/v1/admin/users/') && q.method === 'DELETE') {
        if (quem !== 'servico') return responder(r, 403, {});
        const id = u.pathname.split('/').pop();
        for (const [email, conta] of usuarios) if (conta.id === id) usuarios.delete(email);
        return responder(r, 200, {});
      }

      // Storage
      if (u.pathname.startsWith('/storage/v1/object/sign/')) {
        if (quem !== 'servico') return responder(r, 403, {});
        const chave = u.pathname.replace('/storage/v1/object/sign/', '');
        return arquivos.has(chave) ? responder(r, 200, { signedURL: `/object/sign/${chave}?token=falso` }) : responder(r, 404, { message: 'not found' });
      }
      if (u.pathname.startsWith('/storage/v1/object/') && q.method === 'POST') {
        if (quem !== 'servico') return responder(r, 403, {});
        const chave = u.pathname.replace('/storage/v1/object/', '');
        arquivos.set(chave, corpo);
        if (chave.startsWith('fotos-criancas/')) writeFileSync(`${registro}.ultima.jpg`, corpo);
        return responder(r, 200, {});
      }
      if (u.pathname.startsWith('/storage/v1/object/') && q.method === 'GET') {
        if (quem !== 'servico') return responder(r, 403, {});
        const bytes = arquivos.get(u.pathname.replace('/storage/v1/object/', ''));
        if (!bytes) return responder(r, 404, { message: 'not found' });
        r.writeHead(200, { 'content-type': 'application/octet-stream' });
        return r.end(bytes);
      }
      if (u.pathname.startsWith('/storage/v1/object/') && q.method === 'DELETE') {
        if (quem !== 'servico') return responder(r, 403, {});
        const bucket = u.pathname.split('/').pop();
        for (const c of json().prefixes ?? []) arquivos.delete(`${bucket}/${c}`);
        return responder(r, 200, []);
      }

      // REST: a chave de serviço vê tudo; uma conta só vê o que tem o user_id dela (RLS)
      const tabela = u.pathname.replace('/rest/v1/', '');
      const fontes = { pedidos, pedidos_turma: pedidosTurma, fotos: [...fotos.values()], consentimentos, fichas };
      if (tabela === 'rpc/anonimizar_conta') {
        if (quem !== 'servico') return responder(r, 401, {});
        const { uid } = json();
        const devolver = [
          ...[...fotos.values()].filter((f) => f.user_id === uid && !f.apagada_em).map((f) => ({ bucket: 'fotos-criancas', caminho: f.caminho })),
          ...pedidos.filter((p) => p.user_id === uid && p.link_pdf).map((p) => ({ bucket: 'livros', caminho: p.link_pdf })),
        ];
        for (const f of fotos.values()) if (f.user_id === uid) Object.assign(f, { apagada_em: f.apagada_em ?? new Date().toISOString(), user_id: null });
        devolver.push(...fichas.filter((f) => f.user_id === uid && f.caminho_imagem).map((f) => ({ bucket: 'fichas', caminho: f.caminho_imagem })));
        for (let i = fichas.length - 1; i >= 0; i--) if (fichas[i].user_id === uid) fichas.splice(i, 1);
        for (const p of pedidos) if (p.user_id === uid) Object.assign(p, { nome_crianca: '(apagado)', email: '(apagado)', whatsapp: '(apagado)', responsavel: '(apagado)', personagem: null, plano: null, link_pdf: null, dedicatoria: null, user_id: null });
        return responder(r, 200, devolver);
      }
      if (!(tabela in fontes)) return responder(r, 404, {});
      if (!quem) return responder(r, 401, { message: 'sem chave' });
      // como a RLS de verdade: conta lê o que é dela em pedidos e fotos; fichas e consentimentos, só o servidor
      const visiveis = quem === 'servico' ? fontes[tabela] : fontes[tabela].filter((l) => l.user_id === quem.id && (tabela === 'pedidos' || tabela === 'pedidos_turma' || tabela === 'fotos'));
      if (q.method === 'GET' || q.method === 'HEAD') {
        const linhas = filtrar(visiveis, u.searchParams);
        return responder(r, 200, q.method === 'HEAD' ? undefined : linhas, { 'content-range': `0-${Math.max(0, linhas.length - 1)}/${linhas.length}` });
      }
      if (quem !== 'servico') return responder(r, 401, { message: 'só o servidor escreve' });
      if (q.method === 'POST') {
        const linha = json();
        if (tabela === 'pedidos') pedidos.push(linha);
        if (tabela === 'pedidos_turma') pedidosTurma.push({ criado_em: new Date().toISOString(), status: 'aguardando_pagamento', ...linha });
        if (tabela === 'fotos') fotos.set(linha.caminho, { enviada_em: new Date().toISOString(), apagada_em: null, user_id: null, pedido_id: null, ...linha });
        if (tabela === 'consentimentos') consentimentos.push({ user_id: null, ...linha });
        if (tabela === 'fichas') fichas.push({ criada_em: new Date().toISOString(), caminho_imagem: null, erro: null, aprovada_em: null, pedido_id: null, ...linha });
        return responder(r, 201);
      }
      if (q.method === 'PATCH') {
        for (const l of filtrar(fontes[tabela], u.searchParams)) Object.assign(l, json());
        return responder(r, 204);
      }
      if (q.method === 'DELETE') { for (const l of filtrar(fontes[tabela], u.searchParams)) fotos.delete(l.caminho); return responder(r, 204); }
      return responder(r, 405, {});
    });
  })
  .listen(Number(porta), () => console.log(`supabase falso na porta ${porta}`));
