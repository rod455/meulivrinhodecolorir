'use client';

// Peças pequenas do /criar.

import Image from 'next/image';
import { useState } from 'react';
import { IDADE_MAXIMA, IDADE_MINIMA, IDADES_NA_TELA, idadeValida } from '@/lib/pedido';
import { LIVROS_PUBLICADOS } from '@/lib/livros-publicados';
import type { TemaId } from '@/lib/temas';

/**
 * A idade da criança. Ela muda o desenho (proporção e tamanho perto da turma) e
 * entra na história sob medida; por isso fica na tela do personagem quando há
 * personagem (dono, 31/10/2026). Não é "a idade que vai fazer": o livro não é de
 * aniversário. De 3 a 10 numa linha só, e "Outra" abre a caixa (dono, 02/11/2026).
 */
export function CampoDaIdade({ idade, onIdade, nome }: { idade: number; onIdade: (n: number) => void; nome?: string }) {
  const naLista = (IDADES_NA_TELA as readonly number[]).includes(idade);
  const [outra, setOutra] = useState(!naLista);
  const [texto, setTexto] = useState(naLista ? '' : String(idade));
  return (
    <div className="campo">
      <span className="rotulo" id="rotulo-idade">
        Idade {nome ? `de ${nome}` : 'da criança'}
      </span>
      <div className="opcoes idades" id="idade" role="group" aria-labelledby="rotulo-idade">
        {IDADES_NA_TELA.map((n) => (
          <button
            key={n}
            type="button"
            className="chip chip-idade"
            aria-pressed={!outra && idade === n}
            aria-label={`${n} anos`}
            onClick={() => {
              setOutra(false);
              onIdade(n);
            }}
          >
            {n}
          </button>
        ))}
        <button type="button" className="chip chip-idade chip-idade-outra" aria-pressed={outra} onClick={() => setOutra(true)}>
          Outra
        </button>
      </div>
      {outra && (
        <div className="campo-outro">
          <label htmlFor="idade-outra">Quantos anos?</label>
          <input
            id="idade-outra"
            type="number"
            inputMode="numeric"
            min={IDADE_MINIMA}
            max={IDADE_MAXIMA}
            autoFocus
            value={texto}
            placeholder={`De ${IDADE_MINIMA} a ${IDADE_MAXIMA}`}
            onChange={(e) => {
              setTexto(e.target.value);
              const n = Number(e.target.value);
              if (idadeValida(n)) onIdade(n);
            }}
            aria-describedby="idade-outra-ajuda"
          />
          <span className="ajuda" id="idade-outra-ajuda">
            {texto && !idadeValida(Number(texto)) ? `A idade vai de ${IDADE_MINIMA} a ${IDADE_MAXIMA} anos.` : `De ${IDADE_MINIMA} a ${IDADE_MAXIMA} anos.`}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * As capas das aventuras da turma, ao lado do nome: a escolhida em destaque,
 * com o nome da criança, e as que vêm aí, apagadinhas (dono, 31/10/2026).
 */
export function EstanteDaTurma({ tema, nome }: { tema: TemaId; nome: string }) {
  return (
    <div className="estante-da-turma" aria-live="polite">
      {LIVROS_PUBLICADOS.map((l) => {
        const capa = l.edicoes.find((e) => e.capa)?.capa;
        if (!capa) return null;
        const escolhida = l.temaPersonalizado === tema;
        return (
          <figure key={l.id} className={escolhida ? 'estante-livro estante-livro-escolhido' : 'estante-livro'}>
            <Image src={capa.src} alt={escolhida ? `A aventura escolhida: ${l.titulo}` : ''} width={capa.largura} height={capa.altura} sizes="(min-width: 860px) 180px, 40vw" />
            <figcaption>{escolhida ? (nome ? `A história de ${nome}` : 'A história escolhida') : 'Em breve'}</figcaption>
          </figure>
        );
      })}
    </div>
  );
}
