'use client';

// Os exemplos da LP, no mesmo formato nos dois caminhos (dono, 02/11/2026): o livro
// pronto de uma criança de exemplo (o Miguel na turma, a Laura na sob medida), com a
// capa e só o começo da história, com marca d'água, como a família vê antes de pagar.
// Na turma, o texto é o mesmo de lib/historias/futebol.ts.

import Image from 'next/image';
import { PAGINAS, TITULO } from '@/lib/historias/futebol';

const textoDa = (n: number) => PAGINAS.find((p) => p.pagina === n)?.texto ?? '';

/**
 * um exemplo de história sob medida: praia, enfrentar medos, o cachorro Pipoca e o superpoder coragem.
 * Com a capa do livro e só as duas primeiras páginas: o meio e o final ficam para o livro (dono, 02/11/2026).
 */
const EXEMPLO_SOB_MEDIDA = {
  escolhas: ['Praia', 'Enfrentar medos', 'Pet: Pipoca', 'Superpoder: coragem'],
  titulo: '{NOME} e o mar de conchas',
  capa: '/artes/capa-mar-de-conchas.webp',
  paginas: [
    { n: 1, texto: '{NOME} adorava conchas, mas tinha medo das ondas grandes. Do alto da duna, olhava o mar de longe.' },
    { n: 2, texto: 'Um dia, a coelha Lili e o cachorro Pipoca chegaram correndo: "Vamos achar a concha mais brilhante da praia?"' },
  ],
};

const comNome = (t: string, nome: string) => t.replaceAll('{NOME}', nome);

/**
 * o exemplo da turma, no mesmo formato do da sob medida (dono, 02/11/2026): o livro pronto do
 * Miguel, com a capa publicada da grande final e ele no time, e só o começo da história, com
 * marca d'água. O nome não muda: é sempre o livro do Miguel.
 */
const EXEMPLO_TURMA = {
  quem: 'Miguel',
  escolhas: ['A grande final de futebol', 'Cabelo cacheado', 'Superpoder: coragem'],
  capa: '/artes/capa-miguel-grande-final.webp',
  paginas: [3, 4],
};

export function ExemploTurma() {
  const { quem, capa, escolhas, paginas } = EXEMPLO_TURMA;
  const titulo = comNome(TITULO, quem);
  return (
    <div className="exemplo-sob-medida exemplo-turma">
      <div className="exemplo-escolhas">
        <span className="letra-miuda">A família do {quem} escolheu:</span>
        {escolhas.map((e) => (
          <span key={e} className="chip chip-mostra">
            {e}
          </span>
        ))}
      </div>
      <div className="exemplo-texto exemplo-com-capa">
        {/* a capa publicada da turma, com o Miguel no time, como o livro de verdade sai */}
        <div className="capa-da-serie capa-publicada-exemplo" role="img" aria-label={`Capa do livro "${titulo}": a turma Little Paws com o ${quem} no time`}>
          <Image src={capa} alt="" width={768} height={1152} sizes="(min-width: 960px) 240px, 60vw" />
        </div>
        <div className="exemplo-paginas">
          <strong className="exemplo-titulo">{titulo}</strong>
          <ol className="historia-paginas marca-dagua">
            {paginas.map((n) => (
              <li key={n}>
                <span className="historia-numero" aria-hidden="true">
                  {n}
                </span>
                <span>{comNome(textoDa(n), quem)}</span>
              </li>
            ))}
          </ol>
          <p className="exemplo-continua">Continua no livro: a grande final, com o {quem} jogando no time.</p>
        </div>
      </div>
      <p className="letra-miuda exemplo-nota">No seu livro, quem aparece é a sua criança, do jeitinho que você montar e aprovar.</p>
    </div>
  );
}

export function ExemploSobMedida() {
  // o exemplo é o livro pronto da Laura, com a capa no formato da série (dono, 02/11/2026): o nome não muda
  const quem = 'Laura';
  const titulo = comNome(EXEMPLO_SOB_MEDIDA.titulo, quem);
  return (
    <div className="exemplo-sob-medida">
      <div className="exemplo-escolhas">
        <span className="letra-miuda">A família da {quem} escolheu:</span>
        {EXEMPLO_SOB_MEDIDA.escolhas.map((e) => (
          <span key={e} className="chip chip-mostra">
            {e}
          </span>
        ))}
      </div>
      <div className="exemplo-texto exemplo-com-capa">
        {/* a capa como as da série Little Paws: etiqueta em cima, título em duas cores e o subtítulo */}
        <div className="capa-da-serie" role="img" aria-label={`Capa do livro "${titulo}"`}>
          <Image src={EXEMPLO_SOB_MEDIDA.capa} alt="" width={768} height={1152} sizes="(min-width: 960px) 220px, 60vw" />
          <div className="capa-da-serie-topo">
            <span className="capa-da-serie-selo">Meu Livrinho de Colorir</span>
            <strong className="capa-da-serie-titulo">
              <span>{quem} e o</span>
              <span className="capa-da-serie-titulo-cor">mar de conchas</span>
            </strong>
            <span className="capa-da-serie-sub">Uma história sobre coragem</span>
          </div>
        </div>
        <div className="exemplo-paginas">
          <strong className="exemplo-titulo">{titulo}</strong>
          <ol className="historia-paginas marca-dagua">
            {EXEMPLO_SOB_MEDIDA.paginas.map((p) => (
              <li key={p.n}>
                <span className="historia-numero" aria-hidden="true">
                  {p.n}
                </span>
                <span>{comNome(p.texto, quem)}</span>
              </li>
            ))}
          </ol>
          <p className="exemplo-continua">Continua no livro: 16 páginas, com o superpoder da {quem} na hora mais importante.</p>
        </div>
      </div>
      <p className="letra-miuda exemplo-nota">Antes de pagar, você vê o começo da história e o desenho, e pode pedir até 2 ajustes.</p>
    </div>
  );
}
