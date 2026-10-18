import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Cabecalho } from '@/components/Cabecalho';
import { FormularioDeConta } from '@/components/FormularioDeConta';
import { destinoSeguro } from '@/lib/destino';
import { contaDaSessao, googleLigado } from '@/lib/servidor/sessao';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Entrar | Meu Livrinho de Colorir',
  robots: { index: false },
};

export default async function PaginaEntrar({ searchParams }: { searchParams: { next?: string; erro?: string } }) {
  const destino = destinoSeguro(searchParams.next);
  if (await contaDaSessao()) redirect(destino);
  const google = await googleLigado();
  return (
    <>
      <Cabecalho semMenu />
      <main className="texto-longo conta-pagina">
        <h1>Meus livrinhos</h1>
        <p className="letra-miuda">Entre para ver seus pedidos, baixar os livrinhos e cuidar dos seus dados.</p>
        {searchParams.erro === 'link' && (
          <div className="aviso-erro" role="alert">
            Esse link já foi usado ou venceu. Peça um novo abaixo.
          </div>
        )}
        <FormularioDeConta destino={destino} google={google} modoInicial="entrar" irDepois />
      </main>
    </>
  );
}
