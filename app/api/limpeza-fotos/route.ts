import { NextResponse } from 'next/server';
import { apagarFotosVencidas, fotoLigada } from '@/lib/servidor/fotos';

export const dynamic = 'force-dynamic';

// A Vercel Cron chama todo dia (vercel.json) com `Authorization: Bearer CRON_SECRET`.
// Sem o segredo configurado, ninguém chama: rota aberta seria apagador público.
export async function GET(req: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || req.headers.get('authorization') !== `Bearer ${segredo}`) {
    return NextResponse.json({ mensagem: 'Não autorizado.' }, { status: 401 });
  }
  if (!fotoLigada()) return NextResponse.json({ apagadas: 0, motivo: 'sem supabase' });
  try {
    const apagadas = await apagarFotosVencidas();
    console.log('[limpeza-fotos] apagadas', apagadas);
    return NextResponse.json({ apagadas });
  } catch (e) {
    console.error('[limpeza-fotos] falhou', e);
    return NextResponse.json({ mensagem: 'Falhou.' }, { status: 500 });
  }
}
