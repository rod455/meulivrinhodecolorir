import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Cabecalho } from '@/components/Cabecalho';
import { fotoLigada } from '@/lib/servidor/fotos';
import { googleLigado } from '@/lib/servidor/sessao';
import { Criar } from './Criar';

export const metadata: Metadata = {
  title: 'Criar o livro personalizado do seu filho | Meu Livrinho de Colorir',
  description:
    'Coloque seu filho no time da turma Little Paws ou peça uma história 100% personalizada. Monte o personagem, aprove o desenho e o texto antes de pagar.',
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
