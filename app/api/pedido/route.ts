import { NextResponse } from 'next/server';
import { CAMPOS_DE_ORIGEM } from '@/lib/origem';
import { planoDoLivro } from '@/lib/geracao';
import { lerPedido } from '@/lib/pedido';
import { fotoDisponivel, fotoLigada, ligarFotoAoPedido } from '@/lib/servidor/fotos';
import { destinosLigados, guardarPedido, linkDePagamento } from '@/lib/servidor/pedidos';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let entrada: Record<string, unknown>;
  try {
    entrada = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ mensagem: 'Pedido ilegível.' }, { status: 400 });
  }

  // armadilha para robôs: o campo escondido só vem preenchido por máquina
  if (typeof entrada.site === 'string' && entrada.site.trim()) {
    return NextResponse.json({ id: 'ok', pagar: null });
  }

  const lido = lerPedido(entrada);
  if (!lido.ok) {
    return NextResponse.json({ erros: lido.erros, mensagem: 'Confira os campos marcados.' }, { status: 422 });
  }

  const ligados = destinosLigados();
  if (!ligados.supabase && !ligados.n8n) {
    console.error('[pedido] nenhum destino ligado; pedido recusado para não se perder');
    return NextResponse.json(
      { mensagem: 'Os pedidos pelo site abrem em breve. Chame a gente no WhatsApp que fazemos o seu agora.' },
      { status: 503 },
    );
  }

  // de onde a pessoa veio, guardado no navegador na primeira página (GuardaOrigem)
  const origem: Record<string, string> = {};
  const bruta = entrada.origem;
  if (bruta && typeof bruta === 'object') {
    for (const campo of CAMPOS_DE_ORIGEM) {
      const valor = (bruta as Record<string, unknown>)[campo];
      if (typeof valor === 'string' && valor) origem[campo] = valor.slice(0, 200);
    }
  }

  // a foto tem que ser uma que a rota /api/foto guardou e que ainda não venceu
  const { pedido } = lido;
  const foto = pedido.personagem?.foto ?? null;
  if (foto) {
    let disponivel = false;
    try {
      disponivel = fotoLigada() && (await fotoDisponivel(foto.caminho));
    } catch (e) {
      console.error('[pedido] não conferiu a foto', e);
    }
    if (!disponivel) {
      return NextResponse.json(
        { erros: { personagem: 'A foto expirou. Envie de novo ou crie pelas características.' }, mensagem: 'Confira o personagem.' },
        { status: 422 },
      );
    }
  }

  const id = crypto.randomUUID();
  const plano = pedido.personagem
    ? planoDoLivro({ nome: pedido.nome, idade: pedido.idade, produto: pedido.produto, personagem: pedido.personagem })
    : null;
  const { guardado } = await guardarPedido({ ...pedido, id, criadoEm: new Date().toISOString(), origem, plano });
  if (!guardado) {
    return NextResponse.json({ mensagem: 'Não conseguimos registrar o pedido agora. Tente de novo em instantes.' }, { status: 502 });
  }
  // a foto passa a pertencer ao pedido (continua vencendo em 7 dias do envio)
  if (foto) await ligarFotoAoPedido(foto.caminho, id).catch((e) => console.error('[pedido] foto sem pedido', id, e));

  return NextResponse.json({ id, pagar: linkDePagamento(pedido) });
}
