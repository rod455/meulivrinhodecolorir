import Image from 'next/image';
import Link from 'next/link';
import { Cabecalho } from '@/components/Cabecalho';
import { COR } from '@/components/desenho/formas';
import { Grifo } from '@/components/Enfeites';
import { Icone, type NomeDoIcone } from '@/components/Icone';
import { ChamadaFinal } from '@/components/lp/ChamadaFinal';
import { FacaParte, HistoriaPropria } from '@/components/lp/Caminhos';
import { Rodape } from '@/components/Rodape';
import { SITE } from '@/lib/config';
import { PERGUNTAS } from '@/lib/faq';
import { LIVROS_PUBLICADOS, linkValido, PRECO_DO_FORMATO } from '@/lib/livros-publicados';
import { emReais } from '@/lib/produtos';
import { TURMA } from '@/lib/turma';

// A página inicial (redesenho de 31/10/2026). O objetivo, nas palavras do dono:
// "Little Paws, oportunidade de colocar o filho no meio da história ou criar uma
// história 100% personalizada". Preço e pagamento ficam para depois: a página
// mostra como funciona, e o nome digitado no topo acompanha tudo.

const CUIDADOS: { icone: NomeDoIcone; titulo: string; texto: string }[] = [
  { icone: 'certo', titulo: 'Você aprova antes', texto: 'O desenho do personagem e, na história sob medida, o texto inteiro.' },
  { icone: 'cadeado', titulo: 'O nome fica com a gente', texto: 'O nome do seu filho nunca vai para a inteligência artificial que desenha e escreve.' },
  { icone: 'foto', titulo: 'Foto só se você quiser', texto: 'Serve só para desenhar o personagem e é apagada em 7 dias.' },
  { icone: 'coracao', titulo: 'Personagens nossos', texto: 'A turma Little Paws é original. Nada de cópia de desenho famoso.' },
];

const dadosEstruturados = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', name: SITE.nome, url: SITE.url },
    {
      '@type': 'FAQPage',
      mainEntity: PERGUNTAS.map((p) => ({ '@type': 'Question', name: p.pergunta, acceptedAnswer: { '@type': 'Answer', text: p.resposta } })),
    },
  ],
};

export default function Inicio() {
  return (
    <>
      <Cabecalho />
      <main className="lp">
        {/* 1. Topo: a turma saindo do livro, e as três portas para as seções abaixo (dono, 31/10/2026) */}
        <section className="topo">
          <div className="miolo topo-grade">
            <div className="topo-texto">
              <h1>
                Seu filho <Grifo>dentro da história</Grifo>
              </h1>
              <p className="topo-sub">Conheça a turma Little Paws, coloque seu filho no time ou crie uma história só dele.</p>
              <nav className="portas" aria-label="Por onde começar">
                <a href="#turma" className="porta porta-turma">
                  <Image src="/artes/turma/bo.webp" alt="" width={640} height={640} className="porta-arte" sizes="64px" />
                  <span>
                    <strong>Conheça o Little Paws</strong>
                    <span>A turma e as aventuras deles</span>
                  </span>
                </a>
                <a href="#fazer-parte" className="porta porta-fazer-parte">
                  <Image src="/artes/exemplo-pagina-9.webp" alt="" width={1024} height={1536} className="porta-arte porta-arte-pagina" sizes="64px" />
                  <span>
                    <strong>Faça parte da história</strong>
                    <span>Seu filho entra no time</span>
                  </span>
                </a>
                <a href="#propria" className="porta porta-propria">
                  <Image src="/marca/rabisco-com-livro.webp" alt="" width={220} height={353} className="porta-arte porta-arte-rabisco" sizes="64px" />
                  <span>
                    <strong>Crie a sua própria história</strong>
                    <span>Escrita do zero, só para ele</span>
                  </span>
                </a>
              </nav>
            </div>
            <div className="topo-arte">
              <Image
                src="/artes/turma-saindo-do-livro.webp"
                alt="Uma menina deitada no tapete olha um livro aberto, de onde a turma Little Paws sai acenando para ela"
                width={1536}
                height={1024}
                sizes="(min-width: 960px) 620px, 100vw"
                priority
              />
            </div>
          </div>
        </section>

        {/* 2. Conheça o Little Paws: a turma e as aventuras */}
        <section className="secao" id="turma">
          <div className="miolo">
            <h2 className="titulo-lp">Conheça a turma Little Paws</h2>
            <p className="sub-lp">Seis amigos de um bairro com praça, quadra e campinho. Cada livro é a aventura de um deles.</p>
          </div>
          <ul className="turma-trilho" aria-label="A turma Little Paws">
            {TURMA.map((a) => {
              const livro = LIVROS_PUBLICADOS.find((l) => l.id === a.livro);
              return (
                <li key={a.nome} className={`amigo-cartao tom-${a.tom}`}>
                  <Image src={a.retrato} alt={`${a.nome}, ${a.bicho} da turma Little Paws`} width={640} height={640} className="amigo-retrato" sizes="220px" />
                  <strong>{a.nome}</strong>
                  <span className="letra-miuda">{a.bicho}</span>
                  <p>{a.jeito}</p>
                  {livro && (
                    <a href={`#livro-${livro.id}`} className="amigo-livro">
                      {livro.titulo}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* as aventuras da turma, logo depois de conhecer os amigos */}
        <section className="secao secao-colada" id="little-paws">
          <div className="miolo">
            <h2 className="titulo-lp">As aventuras da turma</h2>
            <p className="sub-lp">
              Cada livro da turma vira uma aventura em que seu filho entra no time. Os três primeiros saíram em inglês, um jeito leve de aprender desde cedo.
            </p>
            <div className="aventuras">
              {LIVROS_PUBLICADOS.map((l) => {
                const capa = l.edicoes.find((e) => e.capa)?.capa;
                return (
                  <article key={l.id} id={`livro-${l.id}`} className="aventura">
                    {capa && <Image src={capa.src} alt={`Capa do livro ${l.titulo}`} width={capa.largura} height={capa.altura} className="aventura-capa" sizes="(min-width: 960px) 240px, 45vw" />}
                    <div className="aventura-corpo">
                      <span className="selo-ingles">{l.idioma === 'pt' ? 'Em português' : 'Em inglês'}</span>
                      <h3 lang={l.idioma === 'en' ? 'en' : undefined}>{l.titulo}</h3>
                      <p className="letra-miuda">{l.historia}</p>
                      {l.temaPersonalizado ? (
                        <Link className="botao botao-pequeno" href={`/criar?caminho=turma&tema=${l.temaPersonalizado}`}>
                          Colocar meu filho
                        </Link>
                      ) : (
                        <span className="aventura-em-breve">Em breve: seu filho jogando com {l.protagonista}</span>
                      )}
                      <details className="aventura-original">
                        <summary>Só o livro da turma, para ler e pintar</summary>
                        {l.edicoes.map((e) => (
                          <div key={e.id} className="edicao">
                            <strong>{e.tipo}</strong>
                            <div className="edicao-botoes">
                              {e.kindle && linkValido(e.kindle) && (
                                <a className="botao botao-secundario botao-pequeno" href={e.kindle} target="_blank" rel="noopener noreferrer">
                                  Kindle na Amazon
                                </a>
                              )}
                              <Link className="botao botao-secundario botao-pequeno" href={`/turma/comprar?edicao=${e.id}&formato=impresso`}>
                                Impresso {emReais(PRECO_DO_FORMATO.impresso)}
                              </Link>
                              <Link className="botao botao-secundario botao-pequeno" href={`/turma/comprar?edicao=${e.id}&formato=pdf`}>
                                PDF {emReais(PRECO_DO_FORMATO.pdf)}
                              </Link>
                            </div>
                          </div>
                        ))}
                      </details>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Faça parte da história: o filho no time da turma */}
        <section className="secao secao-nuvem" id="fazer-parte">
          <div className="miolo">
            <FacaParte />
          </div>
        </section>

        {/* 4. Crie a sua própria história: a 100% personalizada */}
        <section className="secao" id="propria">
          <div className="miolo">
            <HistoriaPropria />
          </div>
        </section>

        {/* 5. Feito com cuidado */}
        <section className="secao secao-azul" id="cuidado">
          <div className="miolo cuidado">
            <div>
              <h2 className="titulo-lp titulo-esquerda">Feito com cuidado</h2>
              <ul className="cuidados">
                {CUIDADOS.map((c) => (
                  <li key={c.titulo}>
                    <span className="linha-icone tom-verde">
                      <Icone nome={c.icone} />
                    </span>
                    <div>
                      <strong>{c.titulo}</strong>
                      <p>{c.texto}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <Image src="/marca/hero-livro.webp" alt="Uma menina pinta um livro de colorir aberto, metade em traço e metade colorida" width={1536} height={1024} className="cuidado-arte" sizes="(min-width: 960px) 440px, 88vw" />
          </div>
        </section>

        {/* 6. Perguntas frequentes */}
        <section className="secao" id="duvidas">
          <div className="miolo">
            <h2 className="titulo-lp">Perguntas frequentes</h2>
            <div className="faq">
              {PERGUNTAS.map((p) => (
                <details key={p.pergunta}>
                  <summary>{p.pergunta}</summary>
                  <p>{p.resposta}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Chamada final, com o nome */}
        <section className="secao secao-nuvem final">
          <div className="miolo">
            <ChamadaFinal />
          </div>
        </section>
      </main>
      <Rodape />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados) }} />
    </>
  );
}
