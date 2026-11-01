'use client';

// Peças pequenas do /criar.

import Image from 'next/image';
import { LIVROS_PUBLICADOS } from '@/lib/livros-publicados';
import type { TemaId } from '@/lib/temas';

/**
 * A idade que a criança vai fazer. Ela muda o desenho (proporção e tamanho
 * perto da turma), entra na história sob medida e na capa da Lembrancinha;
 * por isso fica na tela do personagem quando há personagem (dono, 31/10/2026).
 */
export function CampoDaIdade({ idade, onIdade, nome }: { idade: number; onIdade: (n: number) => void; nome?: string }) {
  return (
    <div className="campo">
      <span className="rotulo" id="rotulo-idade">
        Idade que {nome || 'a criança'} vai fazer
      </span>
      <div className="opcoes idades" id="idade" role="group" aria-labelledby="rotulo-idade">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button key={n} type="button" className="chip chip-idade" aria-pressed={idade === n} aria-label={`${n} ${n === 1 ? 'ano' : 'anos'}`} onClick={() => onIdade(n)}>
            {n}
          </button>
        ))}
      </div>
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
