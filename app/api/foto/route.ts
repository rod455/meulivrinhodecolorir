import { NextResponse } from 'next/server';
import { LIMITE_DA_FOTO, prepararFoto } from '@/lib/foto';
import { VERSAO_DO_CONSENTIMENTO } from '@/lib/personagem';
import { fotoLigada, guardarFoto, redeDoIp } from '@/lib/servidor/fotos';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Recebe a foto da criança, tira os metadados e guarda no bucket privado.
// Só aceita com o consentimento da versão atual marcado no formulário.
export async function POST(req: Request) {
  if (!fotoLigada()) {
    return NextResponse.json({ mensagem: 'O envio de foto abre em breve. Crie o personagem pelas características.' }, { status: 503 });
  }
  const tamanho = Number(req.headers.get('content-length') ?? 0);
  if (tamanho > LIMITE_DA_FOTO + 64 * 1024) return NextResponse.json({ mensagem: 'A foto pode ter até 10 MB.' }, { status: 413 });

  let dados: FormData;
  try {
    dados = await req.formData();
  } catch {
    return NextResponse.json({ mensagem: 'Envio ilegível.' }, { status: 400 });
  }
  if (dados.get('consentimento') !== VERSAO_DO_CONSENTIMENTO) {
    return NextResponse.json({ mensagem: 'Marque a autorização para usar a foto.' }, { status: 422 });
  }
  const arquivo = dados.get('foto');
  if (!(arquivo instanceof Blob)) return NextResponse.json({ mensagem: 'Escolha uma foto.' }, { status: 422 });

  const preparada = await prepararFoto(Buffer.from(await arquivo.arrayBuffer()));
  if (!preparada.ok) return NextResponse.json({ mensagem: preparada.erro }, { status: 422 });

  try {
    const caminho = await guardarFoto(preparada.foto.jpeg, {
      versao: VERSAO_DO_CONSENTIMENTO,
      rede: redeDoIp(req.headers.get('x-forwarded-for')),
    });
    return NextResponse.json({ caminho, consentimento: VERSAO_DO_CONSENTIMENTO });
  } catch (e) {
    console.error('[foto] não guardou', e);
    return NextResponse.json({ mensagem: 'Não conseguimos guardar a foto agora. Tente de novo ou crie pelas características.' }, { status: 502 });
  }
}
