import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Cabecalho } from '@/components/Cabecalho';
import { fotoLigada } from '@/lib/servidor/fotos';
import { googleLigado } from '@/lib/servidor/sessao';
import { Criar } from './Criar';

export const metadata: Metadata = {
  title: 'Criar meu livrinho | Meu Livrinho de Colorir',
  description: 'Escolha o tema, digite o nome da criança e veja a capa na hora.',
  alternates: { canonical: '/criar' },
};

export default async function PaginaCriar() {
  const google = await googleLigado();
  return (
    <>
      <Cabecalho semMenu />
      <main className="criar">
        <div className="miolo">
          <Suspense>
            <Criar fotoLigada={fotoLigada()} google={google} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
