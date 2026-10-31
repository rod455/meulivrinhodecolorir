import Link from 'next/link';
import { LinkDaConta } from './LinkDaConta';
import { Logo } from './Logo';

export function Cabecalho({ semMenu = false }: { semMenu?: boolean }) {
  return (
    <header className="cabecalho">
      <div className="miolo">
        <Link href="/" className="logo" aria-label="Meu Livrinho de Colorir, página inicial">
          <Logo />
        </Link>
        {semMenu ? (
          <LinkDaConta />
        ) : (
          <>
            <nav aria-label="Seções">
              <a href="/#turma">A turma</a>
              <a href="/#fazer-parte">Faça parte</a>
              <a href="/#propria">Sua história</a>
              <a href="/#duvidas">Dúvidas</a>
            </nav>
            <div className="cabecalho-acoes">
              <LinkDaConta />
              <Link href="/criar" className="botao botao-pequeno">
                Começar
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
