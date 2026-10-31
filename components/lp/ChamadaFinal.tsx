'use client';

// A última chamada da LP: os dois caminhos de novo, já com o nome digitado no topo.

import Link from 'next/link';
import { linkDoCaminho, useNomeNaLp } from './nomeNaLp';

export function ChamadaFinal() {
  const { nome } = useNomeNaLp();
  return (
    <div className="chamada-final">
      <h2>Qual vai ser a história {nome ? `de ${nome}` : 'do seu filho'}?</h2>
      <div className="chamada-final-botoes">
        <Link href={linkDoCaminho('turma', nome)} className="botao">
          Colocar {nome || 'seu filho'} no time
        </Link>
        <Link href={linkDoCaminho('sob-medida', nome)} className="botao botao-secundario">
          Escrever a história
        </Link>
      </div>
    </div>
  );
}
