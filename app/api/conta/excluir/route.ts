import { NextResponse } from 'next/server';
import { apagarDoBucket, comChaveDeServico, fotoLigada } from '@/lib/servidor/fotos';
import { PALAVRA_DE_CONFIRMACAO } from '@/lib/conta';
import { contaDaSessao, supabaseNoServidor } from '@/lib/servidor/sessao';

export const dynamic = 'force-dynamic';

// "Excluir minha conta e todos os dados" (spec, seção 3). A venda fica para a
// contabilidade, sem nada que identifique a família ou a criança
// (função anonimizar_conta, migração 0004); fotos e PDFs saem do Storage e o
// login deixa de existir.
export async function POST(req: Request) {
  const conta = await contaDaSessao();
  if (!conta) return NextResponse.json({ mensagem: 'Entre na sua conta.' }, { status: 401 });
  const corpo = (await req.json().catch(() => ({}))) as { confirmar?: unknown };
  if (corpo.confirmar !== PALAVRA_DE_CONFIRMACAO) {
    return NextResponse.json({ mensagem: `Digite ${PALAVRA_DE_CONFIRMACAO} para confirmar.` }, { status: 422 });
  }
  if (!fotoLigada()) return NextResponse.json({ mensagem: 'Não conseguimos agora. Tente de novo em instantes.' }, { status: 503 });

  try {
    const r = await comChaveDeServico('/rest/v1/rpc/anonimizar_conta', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ uid: conta.id }),
    });
    if (!r.ok) throw new Error(`anonimizar ${r.status}: ${await r.text()}`);
    const arquivos = (await r.json()) as { bucket: string; caminho: string }[];
    for (const bucket of ['fotos-criancas', 'livros']) {
      await apagarDoBucket(arquivos.filter((a) => a.bucket === bucket).map((a) => a.caminho), bucket);
    }
    const fim = await comChaveDeServico(`/auth/v1/admin/users/${conta.id}`, { method: 'DELETE' });
    if (!fim.ok) throw new Error(`auth ${fim.status}: ${await fim.text()}`);
  } catch (e) {
    console.error('[conta] exclusão incompleta', conta.id, e);
    return NextResponse.json({ mensagem: 'Não conseguimos terminar a exclusão. Chame a gente no WhatsApp que resolvemos.' }, { status: 502 });
  }
  await supabaseNoServidor().auth.signOut().catch(() => undefined);
  return NextResponse.json({ excluida: true });
}
