import Image from 'next/image';
import Link from 'next/link';
import { LIVROS_PUBLICADOS } from '@/lib/livros-publicados';
import { emReais, LISTA_DE_PRODUTOS } from '@/lib/produtos';

// "Temas exclusivos" da LP (decisão do dono, 26/10/2026): os livros da turma
// Little Paws, com a capa de verdade, e por último o livrinho personalizado,
// em que a criança entra na história. Cada livro leva aos seus formatos, logo
// abaixo na seção dos livros; o preço mostrado é vitrine, a rota recalcula.
export function TemasDaTurma() {
  return (
    <div className="galeria">
      {LIVROS_PUBLICADOS.map((l) => {
        const capa = l.edicoes.find((e) => e.capa)?.capa;
        return (
          <Link key={l.id} href={`#livro-${l.id}`} className="cartao tema-cartao">
            {capa && (
              <span className="tema-capa">
                <Image src={capa.src} alt={`Capa do livro ${l.titulo}`} width={capa.largura} height={capa.altura} sizes="(min-width: 760px) 240px, 60vw" />
              </span>
            )}
            <span>
              <strong style={{ fontSize: '1.15rem' }}>{l.tema}</strong>
              <br />
              <span className="letra-miuda" lang={l.idioma === 'en' ? 'en' : undefined}>
                {l.titulo}
              </span>
              <br />
              <span style={{ fontWeight: 800, textDecoration: 'underline' }}>Ver o livro</span>
            </span>
          </Link>
        );
      })}
      <div className="cartao tema-cartao tema-personalizar">
        <span className="tema-capa">
          <Image src="/marca/rabisco-com-livro.webp" alt="" width={302} height={368} sizes="(min-width: 760px) 200px, 50vw" />
        </span>
        <span>
          <strong style={{ fontSize: '1.15rem' }}>Personalizar a história completa</strong>
          <br />
          <span className="letra-miuda">Seu filho vira personagem e entra na história, com o nome na capa.</span>
        </span>
        <div className="tema-produtos">
          {LISTA_DE_PRODUTOS.map((p) => (
            <Link key={p.id} href={`/criar?produto=${p.id}`} className="botao botao-secundario botao-pequeno">
              <span>{p.nome}</span>
              <span>{emReais(p.preco)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
