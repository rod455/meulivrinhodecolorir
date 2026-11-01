// "Fale com a gente" (dono, 01/11/2026): o botão "?" flutuante abre um formulário curto,
// como o do app Mentorque. A mensagem chega no e-mail de contato com o "responder" já
// apontando para quem escreveu; por isso o e-mail é obrigatório.
// Puro: conferido por `npm run conferir:contato`.

export const TIPOS_DE_CONTATO = [
  { id: 'duvida', rotulo: 'Dúvida', emoji: '❓' },
  { id: 'sugestao', rotulo: 'Sugestão', emoji: '💡' },
  { id: 'problema', rotulo: 'Problema', emoji: '🐛' },
] as const;

export type TipoDeContato = (typeof TIPOS_DE_CONTATO)[number]['id'];

export const LIMITE_DA_MENSAGEM = 2000;

export type Contato = { tipo: TipoDeContato; mensagem: string; email: string; pagina: string };

export type ErrosDoContato = Partial<Record<'mensagem' | 'email', string>>;

const ehEmail = (texto: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto);

export function lerContato(entrada: unknown): { ok: true; contato: Contato } | { ok: false; erros: ErrosDoContato } {
  const e = (entrada && typeof entrada === 'object' ? entrada : {}) as Record<string, unknown>;
  const texto = (k: string) => (typeof e[k] === 'string' ? (e[k] as string).trim() : '');
  const tipo = TIPOS_DE_CONTATO.find((t) => t.id === e.tipo)?.id ?? 'duvida';
  const mensagem = texto('mensagem');
  const email = texto('email').toLowerCase();
  const erros: ErrosDoContato = {};
  if (!mensagem) erros.mensagem = 'Escreva a sua mensagem.';
  else if (mensagem.length > LIMITE_DA_MENSAGEM) erros.mensagem = `A mensagem pode ter até ${LIMITE_DA_MENSAGEM} caracteres.`;
  if (!ehEmail(email)) erros.email = 'Confira o e-mail: é por ele que a gente responde.';
  if (Object.keys(erros).length) return { ok: false, erros };
  // a página de onde veio ajuda a entender a dúvida; só o caminho, nunca parâmetros
  const pagina = texto('pagina').split('?')[0].slice(0, 120) || '/';
  return { ok: true, contato: { tipo, mensagem, email, pagina } };
}

const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c] as string);

/** O e-mail que chega em contato@: assunto para triagem e o corpo no jeito do Mentorque. */
export function emailDoContato(c: Contato): { assunto: string; html: string; responderPara: string } {
  const t = TIPOS_DE_CONTATO.find((x) => x.id === c.tipo)!;
  return {
    assunto: `[Meu Livrinho] ${t.emoji} ${t.rotulo}: ${c.email}`,
    responderPara: c.email,
    html: `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto">
  <div style="background:#ff8a3d;color:#2b2d42;padding:16px 20px;border-radius:12px 12px 0 0;font-size:18px;font-weight:700">📬 Nova mensagem do site</div>
  <div style="background:#fff8ec;padding:20px;border:1px solid #eee;border-top:none">
    <p style="margin:0 0 10px"><b>Tipo:</b> ${esc(`${t.emoji} ${t.rotulo}`)}</p>
    <p style="margin:0 0 10px"><b>E-mail:</b> <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>
    <p style="margin:0 0 14px"><b>Página:</b> ${esc(c.pagina)}</p>
    <p style="margin:0 0 6px"><b>Mensagem:</b></p>
    <div style="background:#fff;border:1px solid #e6e2d8;border-radius:8px;padding:12px;white-space:pre-wrap;color:#333">${esc(c.mensagem)}</div>
  </div>
  <div style="padding:12px 20px;color:#8f8a80;font-size:12px;background:#f2efe8;border-radius:0 0 12px 12px">Enviado pelo site Meu Livrinho de Colorir. Responda direto para <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>
</div>`,
  };
}
