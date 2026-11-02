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
  // estrutura revista pelo dono (02/11/2026): cada passo com um título curto e a explicação embaixo,
  // o passo 4 mostrando as duas versões do livro, e o botão "Criar história"
  return (
    <div className="secao-caminho secao-caminho-invertida secao-caminho-propria">
      <div className="secao-caminho-texto">
        {/* título e texto do dono (02/11/2026) */}
        <h2>Uma aventura feita sob medida</h2>
        <p className="sub-caminho">
          Uma história de 16 páginas escrita do zero, com a sua criança no centro de tudo. O lugar favorito, o que ela mais ama e o que você quer que
          ela aprenda viram uma aventura com novos amigos bichinhos, criados só para essa história.
        </p>
        <ol className="caminho-passos caminho-passos-blocos">
          <li>
            <strong>Conte como é {quem}</strong>
            <span>Onde a história acontece, o que ela ensina e o superpoder. Se tiver um pet, ele entra também.</span>
          </li>
          <li>
            <strong>A gente escreve e desenha</strong>
            <span>16 páginas de aventura, com o superpoder na hora mais importante.</span>
          </li>
          <li>
            <strong>Você vê antes de pagar</strong>
            <span>O começo da história e o desenho do personagem. Pode pedir até 2 ajustes.</span>
          </li>
          <li>
            {/* texto do dono (02/11/2026) */}
            <strong>Escolha o tipo de livro que preferir</strong>
            <span className="versoes-mini">
              <span className="versao-mini">
                <b>Ilustrado</b> todo colorido, para ler junto
              </span>
              <span className="versao-mini">
                <b>Para colorir</b> em traço, para pintar
              </span>
            </span>
            <span className="letra-miuda">Ou os dois juntos, com desconto.</span>
          </li>
        </ol>
        <Link href={linkDoCaminho('sob-medida', nome)} className="botao" onClick={() => registrar('caminho_escolhido', { caminho: 'sob-medida' })}>
          Criar história
        </Link>
      </div>
      <ExemploSobMedida />
    </div>
  );
}
