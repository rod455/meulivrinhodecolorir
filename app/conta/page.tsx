import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Cabecalho } from '@/components/Cabecalho';
import { STATUS_DO_PEDIDO } from '@/lib/conta';
import { emReais, ehProduto, PRODUTOS } from '@/lib/produtos';
import { contaDaSessao, supabaseNoServidor } from '@/lib/servidor/sessao';
import { ehTema, TEMAS } from '@/lib/temas';
import { AcoesDaConta } from './AcoesDaConta';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Meus livrinhos | Meu Livrinho de Colorir',
  robots: { index: false },
};

type Linha = {
  id: string;
  criado_em: string;
  produto: string;
  tema: string;
  nome_crianca: string;
  status: string;
  total_centavos: number;
  link_pdf: string | null;
};

export default async function PaginaConta() {
  const conta = await contaDaSessao();
  if (!conta) redirect('/entrar?next=/conta');

  // a RLS só devolve as linhas desta conta (migração 0004)
  const supabase = supabaseNoServidor();
  const [{ data: pedidos }, { count: fotos }] = await Promise.all([
    supabase.from('pedidos').select('id, criado_em, produto, tema, nome_crianca, status, total_centavos, link_pdf').order('criado_em', { ascending: false }),
    supabase.from('fotos').select('caminho', { count: 'exact', head: true }).is('apagada_em', null),
  ]);
  const lista = (pedidos ?? []) as Linha[];

  return (
    <>
      <Cabecalho semMenu />
      <main className="texto-longo conta-pagina">
        <h1>Meus livrinhos</h1>
        <p className="letra-miuda">Você entrou como {conta.email}.</p>

        {lista.length === 0 ? (
          <div className="cartao" style={{ textAlign: 'center' }}>
            <p>Nenhum livrinho por aqui ainda.</p>
            <Link href="/criar" className="botao">
              Criar meu livrinho
            </Link>
          </div>
        ) : (
          <ul className="pedidos-da-conta">
            {lista.map((p) => (
              <li key={p.id} className="cartao">
                <div>
                  <strong>
                    {ehProduto(p.produto) ? PRODUTOS[p.produto].nome : p.produto} de {p.nome_crianca}
                  </strong>
                  <div className="letra-miuda">
                    {ehTema(p.tema) ? TEMAS[p.tema].nome : p.tema} · {new Date(p.criado_em).toLocaleDateString('pt-BR')} · {emReais(p.total_centavos)}
                  </div>
                  <div className={`status status-${p.status}`}>{STATUS_DO_PEDIDO[p.status] ?? p.status}</div>
                </div>
                {p.link_pdf && (
                  <a className="botao" href={`/api/livro/${p.id}`}>
                    Baixar
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}

        <AcoesDaConta fotosGuardadas={fotos ?? 0} />
      </main>
    </>
  );
}
