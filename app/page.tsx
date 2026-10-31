import Image from 'next/image';
import Link from 'next/link';
import { Cabecalho } from '@/components/Cabecalho';
import { COR } from '@/components/desenho/formas';
import { Grifo } from '@/components/Enfeites';
import { Icone, type NomeDoIcone } from '@/components/Icone';
import { CampoDoNome } from '@/components/lp/CampoDoNome';
import { ChamadaFinal } from '@/components/lp/ChamadaFinal';
import { DoisCaminhos } from '@/components/lp/DoisCaminhos';
import { VejaComoFica } from '@/components/lp/VejaComoFica';
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

/** Onde cada amigo está na arte da turma em fila (recorte por background-position). */
const RECORTE_NA_FILA: Record<string, string> = { Pip: '0%', Bo: '23%', Luna: '52%', Milo: '78%', Dot: '100%' };

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
        {/* 1. Topo: a turma saindo do livro, e o nome do filho */}
        <section className="topo">
          <div className="miolo topo-grade">
            <div className="topo-texto">
              <h1>
                Seu filho <Grifo>dentro da história</Grifo>
              </h1>
              <p className="topo-sub">Coloque seu filho no time da turma Little Paws ou peça uma história escrita só para ele.</p>
              <CampoDoNome />
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

        {/* 2. Os dois caminhos */}
        <section className="secao" id="caminhos">
          <div className="miolo">
            <h2 className="titulo-lp">Dois jeitos de colocar seu filho na história</h2>
            <DoisCaminhos />
          </div>
        </section>

        {/* 3. Veja como fica: folhear o livro de exemplo */}
        <section className="secao secao-nuvem" id="exemplo">
          <div className="miolo">
            <h2 className="titulo-lp">Veja como fica</h2>
            <VejaComoFica />
          </div>
        </section>

        {/* 4. A turma */}
        <section className="secao" id="turma">
          <div className="miolo">
            <h2 className="titulo-lp">Conheça a turma</h2>
            <p className="sub-lp">Seis amigos de um bairro com praça, quadra e campinho. Cada livro é a aventura de um deles.</p>
          </div>
          <ul className="turma-trilho" aria-label="A turma Little Paws">
            {TURMA.map((a) => {
              const livro = LIVROS_PUBLICADOS.find((l) => l.id === a.livro);
              const recorte = RECORTE_NA_FILA[a.nome];
              return (
                <li key={a.nome} className={`amigo-cartao tom-${a.tom}`}>
                  {recorte ? (
                    <span className="amigo-retrato" style={{ backgroundPositionX: recorte }} role="img" aria-label={`${a.nome}, ${a.bicho}`} />
                  ) : (
                    <span className="amigo-retrato amigo-retrato-letra" aria-hidden="true">
                      {a.nome[0]}
                    </span>
                  )}
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

        {/* 5. Os livros da turma: cada um vira uma aventura para o filho entrar */}
        <section className="secao" id="little-paws">
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

        {/* 6. Feito com cuidado */}
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

        {/* 7. Perguntas frequentes */}
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

        {/* 8. Chamada final, com o nome */}
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
