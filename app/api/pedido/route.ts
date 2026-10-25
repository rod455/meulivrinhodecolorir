import { NextResponse } from 'next/server';
import { CAMPOS_DE_ORIGEM } from '@/lib/origem';
import { planoDoLivro } from '@/lib/geracao';
import { lerPedido } from '@/lib/pedido';
import type { Personagem } from '@/lib/personagem';
import { fichaPorId, mudarFicha } from '@/lib/servidor/fichas';
import { ligarFotoAoPedido } from '@/lib/servidor/fotos';
import { destinosLigados, guardarPedido, linkDePagamento } from '@/lib/servidor/pedidos';
import { contaDaSessao } from '@/lib/servidor/sessao';

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

  // para comprar precisa de conta (decisão do dono, 18/10/2026); o e-mail do
  // pedido é sempre o da conta, nunca o que veio no formulário
  const conta = await contaDaSessao();
  if (!conta) {
    return NextResponse.json({ conta: false, mensagem: 'Entre ou crie sua conta para finalizar.' }, { status: 401 });
  }

  const lido = lerPedido({ ...entrada, email: conta.email });
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

  const { pedido } = lido;

  // o personagem do livro é o da ficha aprovada, não o que o navegador mandou;
  // do navegador só vale o superpoder, que não muda o desenho
  let personagem: Personagem | null = pedido.personagem;
  let fichaAprovada: { id: string; caminho: string } | null = null;
  if (pedido.personagem && pedido.fichaId) {
    const ficha = await fichaPorId(pedido.fichaId).catch(() => null);
    const valida =
      ficha &&
      ficha.user_id === conta.id &&
      ficha.status === 'pronta' &&
      ficha.aprovada_em &&
      ficha.caminho_imagem &&
      !ficha.pedido_id &&
      // a idade entra no desenho: mudou depois de aprovar, precisa de ficha nova
      ficha.idade === pedido.idade;
    if (!valida) {
      return NextResponse.json(
        { erros: { personagem: 'Aprove o desenho do personagem de novo antes de pagar.' }, mensagem: 'Confira o personagem.' },
        { status: 422 },
      );
    }
    personagem = { ...ficha.personagem, superpoder: pedido.personagem.superpoder };
    fichaAprovada = { id: ficha.id, caminho: ficha.caminho_imagem! };
  }

  const id = crypto.randomUUID();
  const plano = personagem ? planoDoLivro({ nome: pedido.nome, idade: pedido.idade, produto: pedido.produto, personagem }) : null;
  if (plano) plano.ficha.aprovada = fichaAprovada;
  // a foto só serviu para a ficha; fica ligada ao pedido para sumir no prazo dela
  const foto = personagem?.foto ?? null;
  const { guardado } = await guardarPedido({ ...pedido, personagem, id, criadoEm: new Date().toISOString(), origem, plano, userId: conta.id });
  if (!guardado) {
    return NextResponse.json({ mensagem: 'Não conseguimos registrar o pedido agora. Tente de novo em instantes.' }, { status: 502 });
  }
  // a foto passa a pertencer ao pedido (continua vencendo em 7 dias do envio)
  if (foto) await ligarFotoAoPedido(foto.caminho, id, conta.id).catch((e) => console.error('[pedido] foto sem pedido', id, e));
  // a ficha passa a ser deste pedido: não serve para outro e sai do limite diário
  if (fichaAprovada) await mudarFicha(fichaAprovada.id, { pedido_id: id }).catch((e) => console.error('[pedido] ficha sem pedido', id, e));

  return NextResponse.json({ id, pagar: linkDePagamento(pedido) });
}
