'use client';

// O nome do filho, na seção "Faça parte da história": aparece na página
// inteira (nos dois caminhos, nos exemplos) e segue para o /criar.

import { LIMITE_DO_NOME, MENSAGEM_DO_PROBLEMA, problemaDoNome } from '@/lib/nome';
import { mudarNomeNaLp, useNomeNaLp } from './nomeNaLp';

export function CampoDoNome() {
  const { digitado } = useNomeNaLp();
  const problema = digitado.trim() ? problemaDoNome(digitado) : null;
  return (
    <form className="campo-do-nome" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="nome-lp">Como seu filho se chama?</label>
      <input
          id="nome-lp"
          value={digitado}
          maxLength={LIMITE_DO_NOME + 6}
          placeholder="Ex.: Laura"
          autoComplete="off"
          autoCapitalize="words"
          onChange={(e) => mudarNomeNaLp(e.target.value)}
          aria-describedby="nome-lp-ajuda"
        />
      <span id="nome-lp-ajuda" className={problema && problema !== 'vazio' ? 'erro' : 'ajuda'} role="status">
        {problema && problema !== 'vazio' ? MENSAGEM_DO_PROBLEMA[problema] : 'Só o primeiro nome ou apelido. Ele entra no livro de exemplo.'}
      </span>
    </form>
  );
}
