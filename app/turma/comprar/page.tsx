import type { Metadata } from 'next';
import { Cabecalho } from '@/components/Cabecalho';
import { acharEdicao, ehFormatoDaTurma } from '@/lib/livros-publicados';
import { googleLigado } from '@/lib/servidor/sessao';
import { ComprarDaTurma } from './ComprarDaTurma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Livros da turma Little Paws | Meu Livrinho de Colorir',
  robots: { index: false },
};

export default async function PaginaComprarDaTurma({ searchParams }: { searchParams: { edicao?: string; formato?: string } }) {
  const achado = acharEdicao(searchParams.edicao);
  const formato = ehFormatoDaTurma(searchParams.formato) ? searchParams.formato : 'impresso';
  return (
    <>
      <Cabecalho semMenu />
      <main className="criar">
        <div className="miolo">
          {achado ? (
            <ComprarDaTurma edicaoId={achado.edicao.id} formatoInicial={formato} google={await googleLigado()} />
          ) : (
            <section className="texto-longo">
              <h1>Livro não encontrado</h1>
              <p>
                Volte para <a href="/#little-paws">os livros da turma</a> e escolha de novo.
              </p>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
