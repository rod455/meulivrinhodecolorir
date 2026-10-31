'use client';

// O campo do topo da LP: o nome do filho, que passa a aparecer na página
// inteira (nos dois caminhos, no livro de exemplo) e segue para o /criar.

import { LIMITE_DO_NOME, MENSAGEM_DO_PROBLEMA, problemaDoNome } from '@/lib/nome';
import { mudarNomeNaLp, useNomeNaLp } from './nomeNaLp';

export function CampoDoNome() {
  const { digitado } = useNomeNaLp();
  const problema = digitado.trim() ? problemaDoNome(digitado) : null;
  return (
    <form
      className="campo-do-nome"
      onSubmit={(e) => {
        e.preventDefault();
        document.getElementById('caminhos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
    >
      <label htmlFor="nome-lp">Como seu filho se chama?</label>
      <div className="campo-do-nome-linha">
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
        <button type="submit" className="botao">
          Começar
        </button>
      </div>
      <span id="nome-lp-ajuda" className={problema && problema !== 'vazio' ? 'erro' : 'ajuda'} role="status">
        {problema && problema !== 'vazio' ? MENSAGEM_DO_PROBLEMA[problema] : 'Só o primeiro nome ou apelido. Ele aparece aqui na página.'}
      </span>
    </form>
  );
}
