import { NextResponse } from 'next/server';
import { emailDoContato, lerContato } from '@/lib/contato';

export const dynamic = 'force-dynamic';

// O formulário do botão "?" manda aqui. O site confere e monta o e-mail; o fluxo
// "Meu Livrinho | fale com a gente" do n8n só envia, sempre para contato@ (o destino é
// fixo no fluxo, então ninguém usa o endereço do webhook para mandar e-mail a terceiros).
// O campo "site" é uma isca: gente não vê nem preenche; robô preenche e é ignorado.
export async function POST(req: Request) {
  const corpo = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof corpo.site === 'string' && corpo.site.trim()) return NextResponse.json({ ok: true });
  const lido = lerContato(corpo);
  if (!lido.ok) return NextResponse.json({ ok: false, erros: lido.erros }, { status: 422 });
  const destino = process.env.N8N_WEBHOOK_CONTATO || 'https://n8n.vocaboost.com.br/webhook/meu-livrinho-contato';
  const r = await fetch(destino, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(emailDoContato(lido.contato)),
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);
  if (!r?.ok) {
    console.error('[contato] o n8n não recebeu', r?.status);
    return NextResponse.json({ ok: false, mensagem: 'Não conseguimos enviar agora. Tente de novo em instantes.' }, { status: 502 });
  }
  console.log(`[contato] enviado: tipo=${lido.contato.tipo} pagina=${lido.contato.pagina}`);
  return NextResponse.json({ ok: true });
}
