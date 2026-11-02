'use client';

// As duas seções em que a família age (dono, 31/10/2026): "Faça parte da
// história", com o filho no time da turma, e "Crie a sua própria história",
// a 100% personalizada. Cada uma mostra os passos, o exemplo e leva o nome
// digitado para o /criar.

import Link from 'next/link';
import { registrar } from '@/lib/analytics';
import { CampoDoNome } from './CampoDoNome';
import { ExemploSobMedida, ExemploTurma } from './Exemplos';
import { linkDoCaminho, useNomeNaLp } from './nomeNaLp';

export function FacaParte() {
  const { nome } = useNomeNaLp();
  const quem = nome || 'seu filho';
  return (
    <div className="secao-caminho">
      <div className="secao-caminho-texto">
        <h2>Faça parte da história</h2>
        <p className="sub-caminho">{nome || 'Seu filho'} entra no time do Pip, do Bo, da Luna, da Dot e do Milo e vive a aventura com eles, desenhado do jeitinho que você escolher.</p>
        <CampoDoNome />
        <ol className="caminho-passos">
          <li>
            <strong>Escolha a aventura.</strong> Hoje: a grande final de futebol ou o torneio de basquete. Em breve: flag football e Natal.
          </li>
          <li>
            <strong>Monte o personagem</strong> pelo cabelo, pele e roupa, ou a partir de uma foto.
          </li>
          <li>
            <strong>Aprove o desenho</strong> antes de qualquer coisa.
          </li>
        </ol>
        <Link href={linkDoCaminho('turma', nome)} className="botao" onClick={() => registrar('caminho_escolhido', { caminho: 'turma' })}>
          Colocar {quem} no time
        </Link>
      </div>
      <ExemploTurma />
    </div>
  );
}

export function HistoriaPropria() {
  const { nome } = useNomeNaLp();
  const quem = nome || 'seu filho';
  return (
    <div className="secao-caminho secao-caminho-invertida">
      <div className="secao-caminho-texto">
        <h2>Crie a sua própria história</h2>
        <p className="sub-caminho">Uma história inteira escrita para {quem}, com amigos bichinhos novos, para ler junto ou para pintar.</p>
        <ol className="caminho-passos">
          <li>
            <strong>Conte sobre {quem}:</strong> onde a história acontece, o que ela ensina, do que gosta. Até o bichinho de estimação entra.
          </li>
          <li>
            <strong>A gente escreve</strong> 16 páginas, com o superpoder na hora mais importante.
          </li>
          <li>
            <strong>Você vê o começo e aprova</strong> a história e o desenho do personagem, com até 2 ajustes.
          </li>
          <li>
            {/* as duas versões, e o combo (dono, 02/11/2026) */}
            <strong>Escolha o livro:</strong> de leitura, todo ilustrado e colorido, de colorir, ou os dois com desconto.
          </li>
        </ol>
        <Link href={linkDoCaminho('sob-medida', nome)} className="botao" onClick={() => registrar('caminho_escolhido', { caminho: 'sob-medida' })}>
          Escrever a história
        </Link>
      </div>
      <ExemploSobMedida />
    </div>
  );
}
