'use client';

// Os dois jeitos de colocar o filho na história (dono, 31/10/2026): no time
// da turma Little Paws, ou numa história escrita do zero para ele. Cada
// caminho mostra o que a família faz, em ordem, e leva o nome para o /criar.

import Image from 'next/image';
import Link from 'next/link';
import { registrar } from '@/lib/analytics';
import { linkDoCaminho, useNomeNaLp } from './nomeNaLp';

export function DoisCaminhos() {
  const { nome } = useNomeNaLp();
  const quem = nome || 'seu filho';
  const Quem = nome || 'Seu filho';
  return (
    <div className="dois-caminhos">
      <article className="caminho-grande caminho-grande-turma">
        <Image src="/artes/turma-em-fila.webp" alt="A turma Little Paws de uniforme no campinho" width={970} height={600} className="caminho-grande-arte" sizes="(min-width: 960px) 560px, 100vw" />
        <div className="caminho-grande-corpo">
          <h3>Na história da turma</h3>
          <p>{Quem} entra no time do Pip, do Bo, da Luna, da Dot e do Milo e vive a aventura com eles, desenhado do jeitinho que você escolher.</p>
          <ol className="caminho-passos">
            <li>
              <strong>Escolha a aventura.</strong> Hoje: a grande final de futebol. Em breve: basquete, flag football e Natal.
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
      </article>
      <article className="caminho-grande caminho-grande-sob-medida">
        <Image src="/artes/turma-comemorando.webp" alt="A turma Little Paws comemorando junta" width={600} height={600} className="caminho-grande-arte" sizes="(min-width: 960px) 420px, 100vw" />
        <div className="caminho-grande-corpo">
          <h3>Uma história 100% personalizada</h3>
          <p>Uma história inteira escrita para {quem}, com o desenho e o jeito de livro da turma Little Paws, e amigos bichinhos novos.</p>
          <ol className="caminho-passos">
            <li>
              <strong>Conte sobre {quem}:</strong> onde a história acontece, o que ela ensina, do que gosta. Até o bichinho de estimação entra.
            </li>
            <li>
              <strong>A gente escreve</strong> 16 páginas para pintar, com o superpoder na hora mais importante.
            </li>
            <li>
              <strong>Você lê, ajusta e aprova</strong> o texto e o desenho do personagem.
            </li>
          </ol>
          <Link href={linkDoCaminho('sob-medida', nome)} className="botao" onClick={() => registrar('caminho_escolhido', { caminho: 'sob-medida' })}>
            Escrever a história
          </Link>
        </div>
      </article>
    </div>
  );
}
