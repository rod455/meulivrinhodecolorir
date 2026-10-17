'use client';

// Seção 3 da LP: o campo de nome já na página, atualizando a capa ao vivo.
// É a seção que mais converte; o botão leva o que foi digitado para o fluxo.

import Link from 'next/link';
import { useRef, useState } from 'react';
import { registrar } from '@/lib/analytics';
import { arrumarNome, LIMITE_DO_NOME, MENSAGEM_DO_PROBLEMA, problemaDoNome } from '@/lib/nome';
import { LISTA_DE_TEMAS, type TemaId } from '@/lib/temas';
import { CapaLivrinho } from './CapaLivrinho';
import { ALapis } from './Enfeites';

export function PreviaNaLp() {
  const [bruto, setBruto] = useState('');
  const [tema, setTema] = useState<TemaId>('futebol');
  const [idade, setIdade] = useState(5);
  const contou = useRef(false);

  const nome = arrumarNome(bruto);
  const problema = bruto.trim() ? problemaDoNome(bruto) : null;
  const nomeNaCapa = problema === 'bloqueado' ? '' : nome;
  const progresso = nome ? Math.min(0.25 + nome.length * 0.06, 0.75) : 0.2;

  const params = new URLSearchParams({ tema, idade: String(idade) });
  if (nome && !problema) params.set('nome', nome);

  return (
    <div className="previa">
      <div>
        <CapaLivrinho id="previa-lp" tema={tema} produto="lembrancinha" nome={nomeNaCapa} idade={idade} corte={progresso} className="previa-capa" />
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
              Veja a capa mudar <ALapis>enquanto você digita!</ALapis>
            </span>
          )}
        </div>
        <div className="campo">
          <span className="rotulo" id="tema-lp">Tema</span>
          <div className="temas-mini" role="group" aria-labelledby="tema-lp">
            {LISTA_DE_TEMAS.map((t) => (
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
