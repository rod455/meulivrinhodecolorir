'use client';

// Seção 3 da LP: o campo de nome já na página, ao lado dos livrinhos de exemplo do kit.
// É a seção que mais converte; o botão leva o que foi digitado para o fluxo.

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { registrar } from '@/lib/analytics';
import { arrumarNome, LIMITE_DO_NOME, MENSAGEM_DO_PROBLEMA, problemaDoNome } from '@/lib/nome';
import { TEMAS_DO_CAMINHO, type TemaId } from '@/lib/temas';
import { ALapis } from './Enfeites';

export function PreviaNaLp() {
  const [bruto, setBruto] = useState('');
  // a prévia da LP fica na seção "do zero": só os temas sem a turma
  const [tema, setTema] = useState<TemaId>(TEMAS_DO_CAMINHO.zero[0].id);
  const [idade, setIdade] = useState(5);
  const contou = useRef(false);

  const nome = arrumarNome(bruto);
  const problema = bruto.trim() ? problemaDoNome(bruto) : null;

  const params = new URLSearchParams({ tema, idade: String(idade) });
  if (nome && !problema) params.set('nome', nome);

  return (
    <div className="previa">
      <div>
        <Image
          src="/marca/livros-exemplo.webp"
          alt="Três livrinhos de exemplo: A aventura de Theo, O mundo de Laura e O Natal de Helena"
          width={661}
          height={432}
          sizes="(min-width: 860px) 520px, 100vw"
          className="previa-livros"
        />
      </div>
      <div className="cartao">
        <div className="campo campo-nome">
          <label htmlFor="nome-lp">Digite o nome da criança</label>
          <input
            id="nome-lp"
            value={bruto}
            maxLength={LIMITE_DO_NOME + 6}
            placeholder="Ex.: Laura"
            autoComplete="off"
            autoCapitalize="words"
            onChange={(e) => {
              setBruto(e.target.value);
              if (!contou.current) {
                contou.current = true;
                registrar('previa_digitou');
              }
            }}
            aria-describedby="nome-lp-ajuda"
          />
          {problema && problema !== 'vazio' ? (
            <span className="erro" id="nome-lp-ajuda" role="status">
              {MENSAGEM_DO_PROBLEMA[problema]}
            </span>
          ) : (
            <span className="ajuda" id="nome-lp-ajuda">
              No próximo passo, você vê <ALapis>a capa com o nome!</ALapis>
            </span>
          )}
        </div>
        <div className="campo">
          <span className="rotulo" id="tema-lp">Tema</span>
          <div className="temas-mini" role="group" aria-labelledby="tema-lp">
            {TEMAS_DO_CAMINHO.zero.map((t) => (
              <button key={t.id} type="button" className="chip" aria-pressed={tema === t.id} onClick={() => setTema(t.id)}>
                {t.emoji} {t.id === 'futebol' ? 'Futebol' : t.nome}
              </button>
            ))}
          </div>
        </div>
        <div className="campo">
          <label htmlFor="idade-lp">Idade que vai fazer</label>
          <select id="idade-lp" value={idade} onChange={(e) => setIdade(Number(e.target.value))}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'ano' : 'anos'}
              </option>
            ))}
          </select>
        </div>
        <Link href={`/criar?${params.toString()}`} className="botao botao-largo" onClick={() => registrar('clique_criar', { origem: 'previa' })}>
          Gostei! Quero esse
        </Link>
      </div>
    </div>
  );
}
