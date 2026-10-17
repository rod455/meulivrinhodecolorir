import Link from 'next/link';
import { Cabecalho } from '@/components/Cabecalho';

export default function NaoEncontrada() {
  return (
    <>
      <Cabecalho semMenu />
      <main className="texto-longo obrigado">
        <h1>Essa página ainda está em branco</h1>
        <p>Parece que ninguém pintou aqui. Que tal voltar e criar um livrinho?</p>
        <Link href="/" className="botao">
          Voltar ao início
        </Link>
      </main>
    </>
  );
}
