import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Cabecalho } from '@/components/Cabecalho';
import { Criar } from './Criar';

export const metadata: Metadata = {
  title: 'Criar meu livrinho | Meu Livrinho de Colorir',
  description: 'Escolha o tema, digite o nome da criança e veja a capa na hora.',
  alternates: { canonical: '/criar' },
};

export default function PaginaCriar() {
  return (
    <>
      <Cabecalho semMenu />
      <main className="criar">
        <div className="miolo">
          <Suspense>
            <Criar />
          </Suspense>
        </div>
      </main>
    </>
  );
}
