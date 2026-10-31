import { NextResponse } from 'next/server';
import { novoBilhete } from '@/lib/ficha';
import { desistiuDaHistoria, historiasRestantes, LIMITE_DE_HISTORIAS, lerBriefing } from '@/lib/historia';
import { SUPERPODERES, type SuperpoderId } from '@/lib/personagem';
import { problemaDoNome } from '@/lib/nome';
import { avisarN8nDaHistoria, camposDeDesistencia, criarHistoria, historiasRecentes, mudarHistoria } from '@/lib/servidor/historias';
import { fotoLigada } from '@/lib/servidor/fotos';
import { contaDaSessao } from '@/lib/servidor/sessao';

export const dynamic = 'force-dynamic';

// Pede uma história sob medida nova: só com conta e dentro do limite. O nome
// vem só para sair do briefing (vira {NOME}) e não é guardado. O n8n recebe o
// id e um bilhete de uso único; o pedido ele busca em /api/historia/trabalho.
export async function POST(req: Request) {
  const conta = await contaDaSessao();
  if (!conta) return NextResponse.json({ conta: false, mensagem: 'Entre na sua conta para escrever a história.' }, { status: 401 });
  if (!fotoLigada() || !process.env.N8N_WEBHOOK_HISTORIA) {
    return NextResponse.json({ mensagem: 'A história sob medida abre em breve.' }, { status: 503 });
  }
  const entrada = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const nome = typeof entrada.nome === 'string' ? entrada.nome.trim() : '';
  if (problemaDoNome(nome)) return NextResponse.json({ mensagem: 'Confira o nome da criança.' }, { status: 422 });
  const idade = Number(entrada.idade);
  if (!Number.isInteger(idade) || idade < 1 || idade > 10) return NextResponse.json({ mensagem: 'Escolha a idade de 1 a 10.' }, { status: 422 });
  const superpoder = SUPERPODERES.find((s) => s.id === entrada.superpoder)?.id as SuperpoderId | undefined;
  if (!superpoder) return NextResponse.json({ mensagem: 'Escolha o superpoder.' }, { status: 422 });
  const lido = lerBriefing(entrada.briefing, nome);
  if (!lido.ok) return NextResponse.json({ mensagem: lido.erro }, { status: 422 });

  try {
    const recentes = await historiasRecentes(conta.id);
    const agora = new Date();
    for (const h of recentes) if (desistiuDaHistoria(h, agora)) await mudarHistoria(h.id, camposDeDesistencia(h, 'tempo esgotado'), '&status=eq.escrevendo');
    if (recentes.some((h) => h.status === 'escrevendo' && !desistiuDaHistoria(h, agora))) {
      return NextResponse.json({ mensagem: 'Já estamos escrevendo uma história. Espere um pouquinho.' }, { status: 409 });
    }
    const restantes = historiasRestantes(recentes, agora);
    if (restantes === 0) {
      return NextResponse.json({ restantes, mensagem: `Você já pediu ${LIMITE_DE_HISTORIAS} histórias hoje. Escolha uma delas ou volte amanhã.` }, { status: 429 });
    }
    const id = crypto.randomUUID();
    const token = novoBilhete();
    await criarHistoria({ id, user_id: conta.id, idade, superpoder, briefing: lido.briefing, token });
    if (!(await avisarN8nDaHistoria(id, token))) {
      await mudarHistoria(id, { status: 'falhou', token: null, erro: 'n8n sem resposta' });
      return NextResponse.json({ mensagem: 'Não conseguimos começar a história agora. Tente de novo em instantes.' }, { status: 502 });
    }
    return NextResponse.json({ id, restantes: restantes - 1 });
  } catch (e) {
    console.error('[historia] não criou', conta.id, e);
    return NextResponse.json({ mensagem: 'Não conseguimos começar a história agora. Tente de novo em instantes.' }, { status: 502 });
  }
}

export async function GET() {
  const conta = await contaDaSessao();
  if (!conta) return NextResponse.json({ conta: false }, { status: 401 });
  try {
    return NextResponse.json({ restantes: historiasRestantes(await historiasRecentes(conta.id), new Date()) });
  } catch {
    return NextResponse.json({ restantes: null });
  }
}
