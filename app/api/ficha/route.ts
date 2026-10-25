import { NextResponse } from 'next/server';
import { desistiu, fichasRestantes, novoBilhete } from '@/lib/ficha';
import { lerPersonagem, promptDaFicha } from '@/lib/personagem';
import { criarFicha, fichasRecentes, mudarFicha, tomarFoto } from '@/lib/servidor/fichas';
import { fotoDisponivel, fotoLigada } from '@/lib/servidor/fotos';
import { contaDaSessao } from '@/lib/servidor/sessao';

export const dynamic = 'force-dynamic';

// Pede uma ficha nova: só com conta e dentro do limite (decisão do dono,
// 25/10/2026). O n8n recebe só o id e um bilhete de uso único; o prompt ele
// busca em /api/ficha/trabalho, e a imagem volta por /api/ficha/pronta.
export async function POST(req: Request) {
  const conta = await contaDaSessao();
  if (!conta) return NextResponse.json({ conta: false, mensagem: 'Entre na sua conta para desenhar o personagem.' }, { status: 401 });
  if (!fotoLigada() || !process.env.N8N_WEBHOOK_FICHA) {
    return NextResponse.json({ mensagem: 'O desenho do personagem abre em breve.' }, { status: 503 });
  }

  const entrada = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const lido = lerPersonagem(entrada.personagem);
  if (!lido.ok) return NextResponse.json({ mensagem: lido.erro }, { status: 422 });
  const idade = Number(entrada.idade);
  if (!Number.isInteger(idade) || idade < 1 || idade > 10) return NextResponse.json({ mensagem: 'Escolha a idade de 1 a 10.' }, { status: 422 });
  const { personagem } = lido;

  try {
    const recentes = await fichasRecentes(conta.id);
    const agora = new Date();
    // a que ficou presa em "gerando" não segura a pessoa nem gasta tentativa
    for (const f of recentes) if (desistiu(f, agora)) await mudarFicha(f.id, { status: 'falhou', token: null, erro: 'tempo esgotado' }, '&status=eq.gerando');
    if (recentes.some((f) => f.status === 'gerando' && !desistiu(f, agora))) {
      return NextResponse.json({ mensagem: 'Já estamos desenhando o seu personagem. Espere um pouquinho.' }, { status: 409 });
    }
    const restantes = fichasRestantes(recentes, agora);
    if (restantes === 0) {
      return NextResponse.json({ restantes, mensagem: 'Você já desenhou 3 personagens hoje. Escolha um deles ou volte amanhã.' }, { status: 429 });
    }

    if (personagem.foto) {
      const ok = (await fotoDisponivel(personagem.foto.caminho)) && (await tomarFoto(personagem.foto.caminho, conta.id));
      if (!ok) return NextResponse.json({ mensagem: 'A foto expirou. Envie de novo ou crie pelas características.' }, { status: 422 });
    }

    const id = crypto.randomUUID();
    const token = novoBilhete();
    await criarFicha({ id, user_id: conta.id, personagem, idade, prompt: promptDaFicha(personagem, idade), caminho_foto: personagem.foto?.caminho ?? null, token });

    const aviso = await fetch(process.env.N8N_WEBHOOK_FICHA, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ficha_id: id, token }),
      cache: 'no-store',
    }).catch(() => null);
    if (!aviso?.ok) {
      await mudarFicha(id, { status: 'falhou', token: null, erro: `n8n ${aviso?.status ?? 'sem resposta'}` });
      return NextResponse.json({ mensagem: 'Não conseguimos começar o desenho agora. Tente de novo em instantes.' }, { status: 502 });
    }
    return NextResponse.json({ id, restantes: restantes - 1 });
  } catch (e) {
    console.error('[ficha] não criou', conta.id, e);
    return NextResponse.json({ mensagem: 'Não conseguimos começar o desenho agora. Tente de novo em instantes.' }, { status: 502 });
  }
}

// Quantas fichas ainda dá para gerar, para a tela mostrar antes de pedir.
export async function GET() {
  const conta = await contaDaSessao();
  if (!conta) return NextResponse.json({ conta: false }, { status: 401 });
  try {
    return NextResponse.json({ restantes: fichasRestantes(await fichasRecentes(conta.id), new Date()) });
  } catch {
    return NextResponse.json({ restantes: null });
  }
}
