'use client';

// Os exemplos da LP, com o nome que a família digitou: na turma, um livro de
// verdade para folhear, com páginas da história de futebol em traço para
// colorir (o texto é o mesmo de lib/historias/futebol.ts); na sob medida, um
// exemplo do texto que a família lê e aprova antes de pagar.

import Image from 'next/image';
import { useState } from 'react';
import { PAGINAS, TITULO } from '@/lib/historias/futebol';
import { useNomeNaLp } from './nomeNaLp';

const textoDa = (n: number) => PAGINAS.find((p) => p.pagina === n)?.texto ?? '';

/**
 * as páginas do exemplo da turma: arte em traço para colorir + o texto da página. Só do
 * começo da história: a última página contava o final do jogo (dono, 01/11/2026: "estamos
 * mostrando a última página e dando spoiler"); no lugar dela, uma folha de "continua".
 */
const PAGINAS_DA_TURMA = [
  { pagina: 3, arte: '/artes/exemplo-pagina-3.webp' },
  { pagina: 9, arte: '/artes/exemplo-pagina-9.webp' },
];

/** um exemplo de história sob medida: praia, enfrentar um medo, o cachorro Pipoca e o superpoder coragem */
const EXEMPLO_SOB_MEDIDA = {
  escolhas: ['Na praia', 'Enfrentar um medo', 'Cachorro Pipoca', 'Superpoder: coragem'],
  titulo: '{NOME} e o mar de conchas',
  paginas: [
    { n: 1, texto: '{NOME} adorava conchas, mas tinha medo das ondas grandes. Do alto da duna, olhava o mar de longe.' },
    { n: 2, texto: 'Um dia, a coelha Lili e o cachorro Pipoca chegaram correndo: "Vamos achar a concha mais brilhante da praia?"' },
    { n: 13, texto: 'As ondas estavam altas e todo mundo parou. {NOME} respirou fundo: "Eu também estou com medo. Mas vamos juntos?"' },
    { n: 16, texto: 'No fim da tarde, {NOME} guardou a concha mais brilhante no bolso. E o mar virou o melhor amigo da turma.' },
  ],
};

const comNome = (t: string, nome: string) => t.replaceAll('{NOME}', nome);

/** sem nome digitado, um nome de exemplo: "seu filho" no meio das frases do livro não lê bem */
const useQuem = () => {
  const { nome } = useNomeNaLp();
  return { nome, quem: nome || 'Laura' };
};

export function ExemploTurma() {
  const { nome, quem } = useQuem();
  // 0 é a capa; depois, as páginas do exemplo; por último, a folha de "continua" (sem o final)
  const [folha, setFolha] = useState(0);
  const total = PAGINAS_DA_TURMA.length + 2;
  const naContinuacao = folha === total - 1;
  const pagina = folha > 0 && !naContinuacao ? PAGINAS_DA_TURMA[folha - 1] : null;
  return (
    <div className="exemplo-turma">
      <div className="livro-aberto" aria-live="polite">
        {naContinuacao ? (
          <figure className="folha folha-continua" key="continua">
            <figcaption className="folha-texto">
              <strong className="folha-capa-titulo">E agora?</strong>
              <span>
                O Festival está só começando. Será que o time de {quem} vai dar conta da grande final? O resto da história está no livro, para ler e pintar juntos.
              </span>
            </figcaption>
          </figure>
        ) : pagina ? (
          <figure className="folha" key={folha}>
            <Image src={pagina.arte} alt={`Página ${pagina.pagina} para colorir: ${quem} com a turma Little Paws`} width={1024} height={1536} className="folha-arte" sizes="(min-width: 960px) 380px, 80vw" />
            <figcaption className="folha-texto">{comNome(textoDa(pagina.pagina), quem)}</figcaption>
            <span className="folha-numero">{pagina.pagina}</span>
          </figure>
        ) : (
          <figure className="folha folha-capa" key="capa">
            <Image src="/artes/turma-saindo-do-livro.webp" alt="" width={1536} height={1024} className="folha-capa-arte" sizes="(min-width: 960px) 380px, 80vw" />
            <figcaption>
              <strong className="folha-capa-titulo">{comNome(TITULO, quem)}</strong>
              <span>Uma aventura de futebol com a turma Little Paws</span>
            </figcaption>
          </figure>
        )}
      </div>
      <div className="folhear">
        <button type="button" className="botao botao-secundario botao-pequeno" disabled={folha === 0} onClick={() => setFolha(folha - 1)} aria-label="Página anterior">
          ←
        </button>
        <span className="folhear-onde">{folha === 0 ? 'Capa' : naContinuacao ? 'Continua no livro' : `Página ${pagina?.pagina} de 16`}</span>
        <button type="button" className="botao botao-secundario botao-pequeno" disabled={folha === total - 1} onClick={() => setFolha(folha + 1)} aria-label="Próxima página">
          →
        </button>
      </div>
      <p className="letra-miuda exemplo-nota">Exemplo com uma menina desenhada: no seu livro, quem aparece é {nome || 'seu filho'}, do jeitinho que você montar e aprovar.</p>
    </div>
  );
}

export function ExemploSobMedida() {
  const { quem } = useQuem();
  return (
    <div className="exemplo-sob-medida">
      <div className="exemplo-escolhas">
        <span className="letra-miuda">Você escolheu:</span>
        {EXEMPLO_SOB_MEDIDA.escolhas.map((e) => (
          <span key={e} className="chip chip-mostra">
            {e}
          </span>
        ))}
      </div>
      <div className="exemplo-texto">
        <strong className="exemplo-titulo">{comNome(EXEMPLO_SOB_MEDIDA.titulo, quem)}</strong>
        <ol className="historia-paginas">
          {EXEMPLO_SOB_MEDIDA.paginas.map((p) => (
            <li key={p.n} className={p.n === 13 ? 'pagina-superpoder' : ''}>
              <span className="historia-numero" aria-hidden="true">
                {p.n}
              </span>
              <span>{comNome(p.texto, quem)}</span>
            </li>
          ))}
        </ol>
        <p className="letra-miuda">Exemplo de 4 das 16 páginas. Você lê a história inteira, pede até 2 ajustes e só depois aprova.</p>
      </div>
    </div>
  );
}
