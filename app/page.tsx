import Image from 'next/image';
import Link from 'next/link';
import { Cabecalho } from '@/components/Cabecalho';
import { COR } from '@/components/desenho/formas';
import { ALapis, Confete, Estrelinha, Grifo } from '@/components/Enfeites';
import { PreviaNaLp } from '@/components/PreviaNaLp';
import { Rodape } from '@/components/Rodape';
import { FAMILIAS_ATENDIDAS, SITE } from '@/lib/config';
import { PERGUNTAS } from '@/lib/faq';
import { TURMA } from '@/lib/turma';
import { LIVROS_PUBLICADOS, linkValido, PRECO_DO_FORMATO } from '@/lib/livros-publicados';
import { emReais, MENOR_PRECO, PRODUTOS } from '@/lib/produtos';

// Caixas de tamanhos e cores diferentes (referência: BLOOMIE no Behance); ícones e Rabisco do kit.
const DIFERENCIAIS = [
  { arte: { src: '/marca/rabisco-com-livro.webp', l: 220, a: 353 }, titulo: 'Tem história de verdade', texto: 'Não são só desenhos soltos: a criança vira a heroína, com o nome dela no texto.', jeito: 'destaque' },
  { arte: { src: '/marca/icone-pinte.webp', l: 116, a: 73 }, titulo: 'Desenhos com traço grosso', texto: 'Fáceis de pintar até para os pequenos.', jeito: '' },
  { arte: { src: '/marca/icone-personalize.webp', l: 99, a: 61 }, titulo: 'Personagens próprios', texto: 'Nada de cópia de personagem famoso.', jeito: 'azul' },
  { arte: { src: '/marca/estrela-giz.webp', l: 83, a: 89 }, titulo: 'Pronto em minutos', texto: 'Nada de esperar os Correios. Você recebe na hora.', jeito: '' },
  { arte: { src: '/marca/icone-imprima.webp', l: 58, a: 62 }, titulo: 'Imprima quantas vezes quiser', texto: 'Um para cada convidado da festa.', jeito: '' },
  { arte: { src: '/marca/coracao-giz.webp', l: 73, a: 86 }, titulo: 'Garantia de 7 dias', texto: 'Se não gostar, devolvemos o seu dinheiro. Sem perguntas.', jeito: 'largo' },
];

const dadosEstruturados = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: SITE.nome,
      url: SITE.url,
    },
    {
      '@type': 'FAQPage',
      mainEntity: PERGUNTAS.map((p) => ({
        '@type': 'Question',
        name: p.pergunta,
        acceptedAnswer: { '@type': 'Answer', text: p.resposta },
      })),
    },
    ...Object.values(PRODUTOS).map((p) => ({
      '@type': 'Product',
      name: `Livrinho de colorir personalizado: ${p.nome}`,
      description: p.resumo,
      brand: { '@type': 'Brand', name: SITE.nome },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'BRL',
        price: (p.preco / 100).toFixed(2),
        availability: 'https://schema.org/InStock',
        url: `${SITE.url}/criar?produto=${p.id}`,
      },
    })),
  ],
};

export default function Inicio() {
  const lembrancinha = PRODUTOS.lembrancinha;
  const presente = PRODUTOS.presente;
  const combo = PRODUTOS.combo;
  const sobMedida = PRODUTOS['sob-medida'];

  return (
    <>
      <Cabecalho />
      <main>
        {/* 1. Hero: a turma Little Paws e a primeira escolha (pedido do dono, 31/10/2026) */}
        <section className="hero">
          <div className="miolo">
            <div>
              <ALapis>Uma turma de amigos, uma aventura por livro</ALapis>
              <h1>
                Conheça a turma Little Paws. E coloque <Grifo>seu filho no time</Grifo>.
              </h1>
              <p className="hero-sub">
                Pip, Bo, Luna, Dot, Milo e o Kiko vivem aventuras de esporte e amizade em livros para ler e pintar. Leve a história deles, coloque
                seu filho dentro dela, crie uma história do zero, ou peça uma história inteira escrita só para ele.
              </p>
              <div className="caminhos">
                <a href="#turma" className="cartao caminho caminho-turma">
                  <strong>Histórias da turma Little Paws</strong>
                  <span>Leia e pinte as aventuras deles, ou coloque seu filho no time, desenhado do jeitinho dele.</span>
                  <span className="caminho-seta">Conhecer a turma →</span>
                </a>
                <Link href="/criar?caminho=zero" className="cartao caminho caminho-zero">
                  <strong>Uma história do zero</strong>
                  <span>Seu filho é o herói de uma história só dele, com o nome na capa. A partir de {emReais(MENOR_PRECO)}.</span>
                  <span className="caminho-seta">Criar do zero →</span>
                </Link>
                <Link href="/criar?caminho=sob-medida" className="cartao caminho caminho-sob-medida">
                  <strong>Uma história 100% personalizada</strong>
                  <span>Você conta o lugar, a lição e do que seu filho gosta, e a gente escreve a história inteira no jeito da turma Little Paws. {emReais(sobMedida.preco)}.</span>
                  <span className="caminho-seta">Escrever a história →</span>
                </Link>
              </div>
              {FAMILIAS_ATENDIDAS && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginTop: 14 }}>
                  <Estrelinha tamanho={20} /> Mais de {FAMILIAS_ATENDIDAS} famílias felizes
                </span>
              )}
            </div>
            <div className="hero-arte hero-turma">
              <Image
                src="/artes/turma-em-fila.webp"
                alt="A turma Little Paws de uniforme no campinho: Pip, Bo, Luna, Milo e Dot"
                width={970}
                height={600}
                sizes="(min-width: 860px) 560px, 100vw"
                priority
              />
            </div>
          </div>
        </section>

        {/* 2. Conheça a turma */}
        <section className="secao secao-nuvem" id="turma">
          <div className="miolo">
            <div className="titulo-secao">
              <h2 className="titulo-rabisco titulo-coracao">Conheça a turma</h2>
              <p>Seis amigos de um bairro com praça, quadra e campinho. Cada livro é a aventura de um deles, e cada um aprende alguma coisa com o time.</p>
            </div>
            <ul className="turma">
              {TURMA.map((a) => {
                const livro = LIVROS_PUBLICADOS.find((l) => l.id === a.livro);
                return (
                  <li key={a.nome} className="cartao amigo">
                    <span className={`amigo-inicial tom-${a.tom}`} aria-hidden="true">
                      {a.nome[0]}
                    </span>
                    <div>
                      <strong>{a.nome}</strong> <span className="letra-miuda">· {a.bicho}</span>
                      <p>{a.jeito}</p>
                      {livro && (
                        <a href={`#livro-${livro.id}`} className="amigo-livro">
                          {livro.titulo} →
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* 3. Os livros da turma: ler e pintar, ou colocar o filho na história */}
        <section className="secao" id="little-paws">
          <div className="miolo">
            <div className="titulo-secao">
              <h2 className="titulo-rabisco titulo-estrela">As histórias da turma</h2>
              <p>
                Leve o livro como ele é, para ler e pintar, ou coloque seu filho dentro da história, jogando com o time. Os três primeiros livros
                são em inglês, com frases curtas que se repetem: um jeito leve de ajudar seu filho a aprender inglês desde cedo. A Grande Final de
                Futebol chegou primeiro em português.
              </p>
            </div>
            <div className="livros-publicados">
              {LIVROS_PUBLICADOS.map((l) => {
                const capa = l.edicoes.find((e) => e.capa)?.capa;
                return (
                  <article key={l.id} id={`livro-${l.id}`} className="livro-publicado">
                    {capa && <Image src={capa.src} alt={`Capa do livro ${l.titulo}`} width={capa.largura} height={capa.altura} className="livro-publicado-capa" />}
                    <span className="selo-ingles">{l.idioma === 'pt' ? 'Em português' : 'Em inglês'}</span>
                    <h3 lang={l.idioma === 'en' ? 'en' : undefined}>{l.titulo}</h3>
                    {l.subtitulo && (
                      <p className="livro-publicado-sub" lang={l.idioma === 'en' ? 'en' : undefined}>
                        {l.subtitulo}
                      </p>
                    )}
                    <p>{l.historia}</p>
                    <div className="livro-colocar">
                      <strong>Com seu filho na história</strong>
                      {l.temaPersonalizado ? (
                        <>
                          <span className="letra-miuda">Desenhado do jeitinho dele, entra no time e vive a aventura junto com {l.protagonista}.</span>
                          <Link className="botao botao-pequeno" href={`/criar?caminho=turma&tema=${l.temaPersonalizado}`}>
                            Colocar meu filho na história
                          </Link>
                        </>
                      ) : (
                        <span className="letra-miuda">Em breve: seu filho jogando com {l.protagonista} nesta história.</span>
                      )}
                    </div>
                    {l.edicoes.map((e) => (
                      <div key={e.id} className="edicao">
                        <strong>Ler e pintar: {e.tipo.toLowerCase()}</strong>
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
                  </article>
                );
              })}
            </div>
            <p className="letra-miuda" style={{ textAlign: 'center', marginTop: 18 }}>
              Impresso com tiragem sob medida: imprimimos o seu exemplar quando você pede (frete à parte). O PDF é para imprimir em casa quantas
              vezes quiser. O Kindle é vendido pela Amazon. Com seu filho na história, o livrinho vem em português, com o nome dele no texto.
            </p>
          </div>
        </section>

        {/* 4. Do zero: a prévia ao vivo e os livrinhos */}
        <section className="secao secao-nuvem" id="do-zero">
          <div className="miolo">
            <div className="titulo-secao">
              <Image src="/marca/rabisco-desenhando.webp" alt="" width={110} height={134} className="rabisco" />
              <h2>
                Ou crie uma história <Grifo cor={COR.azul}>do zero</Grifo>
              </h2>
              <p>Seu filho é o herói, com o nome na capa e nas páginas. Digite o nome e veja a capa na hora, sem cadastro; a conta só entra na hora de comprar.</p>
            </div>
            <div id="previa">
              <PreviaNaLp />
            </div>
          </div>
        </section>

        {/* 4b. A história sob medida (pedido do dono, 31/10/2026) */}
        <section className="secao" id="sob-medida">
          <div className="miolo sob-medida">
            <div>
              <ALapis>Novo</ALapis>
              <h2>
                Ou uma história <Grifo cor={COR.rosa}>100% personalizada</Grifo>
              </h2>
              <p>
                Para o aniversário, a chegada de um irmãozinho, a escola nova ou só porque sim: a gente escreve uma história inteira para o seu
                filho, com os amigos bichinhos, o desenho e o jeito de livro da turma Little Paws.
              </p>
              <ol className="sob-medida-passos">
                <li>
                  <strong>Você conta</strong> onde a história acontece, o que ela ensina e do que seu filho gosta. Até o bichinho de estimação entra.
                </li>
                <li>
                  <strong>A gente escreve</strong> 16 páginas para pintar, com o superpoder dele na hora mais importante.
                </li>
                <li>
                  <strong>Você lê e aprova</strong> o texto e o desenho do personagem antes de pagar, e pode pedir até 2 ajustes.
                </li>
              </ol>
              <div className="sob-medida-acao">
                <Link href="/criar?caminho=sob-medida" className="botao">
                  Escrever a história do meu filho
                </Link>
                <span className="preco">{emReais(sobMedida.preco)}</span>
              </div>
            </div>
            <Image src="/artes/turma-comemorando.webp" alt="A turma Little Paws comemorando junta" width={600} height={600} className="sob-medida-arte" />
          </div>
        </section>

        <section className="secao" id="produtos">
          <div className="miolo">
            <div className="titulo-secao">
              <h2 className="titulo-rabisco titulo-estrela">Escolha o seu livrinho</h2>
              <p>Do zero ou com a turma, você paga uma vez e imprime quantas vezes quiser.</p>
            </div>
            <div className="produtos">
              <div className="cartao produto">
                <span className="emoji" aria-hidden="true">{lembrancinha.emoji}</span>
                <h3>{lembrancinha.nome}</h3>
                <ul>
                  <li>{lembrancinha.paginas} para colorir</li>
                  <li>Nome e idade na capa</li>
                  <li>Imprime ilimitado, um para cada convidado</li>
                </ul>
                <div>
                  {lembrancinha.precoDe && <span className="preco-de">{emReais(lembrancinha.precoDe)}</span>}
                  <span className="preco">{emReais(lembrancinha.preco)}</span>
                </div>
                <Link href="/criar?produto=lembrancinha" className="botao botao-largo">
                  Quero a lembrancinha
                </Link>
              </div>
              <div className="cartao produto">
                <span className="emoji" aria-hidden="true">{presente.emoji}</span>
                <h3>{presente.nome}</h3>
                <ul>
                  <li>{presente.paginas} com uma história</li>
                  <li>A criança é a heroína, com o nome no texto</li>
                  <li>Com dedicatória sua</li>
                </ul>
                <div>
                  <span className="preco">{emReais(presente.preco)}</span>
                </div>
                <Link href="/criar?produto=presente" className="botao botao-largo">
                  Quero o presente
                </Link>
              </div>
              <div className="cartao produto produto-destaque">
                <span className="selo">Mais completo</span>
                <span className="emoji" aria-hidden="true">{combo.emoji}</span>
                <h3>{combo.nome}</h3>
                <ul>
                  <li>A lembrancinha para os convidados</li>
                  <li>O livrinho presente para o aniversariante</li>
                  <li>Mesmo tema nos dois</li>
                </ul>
                <div>
                  <span className="preco-de">{emReais(lembrancinha.preco + presente.preco)}</span>
                  <span className="preco">{emReais(combo.preco)}</span>
                </div>
                <Link href="/criar?produto=combo" className="botao botao-largo">
                  Quero o combo
                </Link>
              </div>
            </div>
            <p className="letra-miuda" style={{ textAlign: 'center', marginTop: 20 }}>
              No Pix tem 5% de desconto. Se não gostar, devolvemos o dinheiro em até 7 dias.
            </p>
          </div>
        </section>


        {/* 5. Como funciona, nos dois caminhos */}
        <section className="secao secao-nuvem" id="como-funciona">
          <div className="miolo">
            <div className="titulo-secao">
              <Image src="/marca/rabisco-acenando.webp" alt="" width={96} height={121} className="rabisco" />
              <h2>Como funciona</h2>
              <p>Três passos, com a turma, do zero ou com a história sob medida.</p>
            </div>
            <div className="passos">
              <div className="passo cartao">
                <span className="numero">1</span>
                <Image src="/marca/icone-escolha.webp" alt="" width={116} height={65} className="passo-icone" />
                <h3>Escolha a história</h3>
                <p className="letra-miuda">Uma aventura da turma Little Paws com seu filho no time, uma história do zero, ou uma escrita só para ele.</p>
              </div>
              <div className="passo cartao">
                <span className="numero">2</span>
                <Image src="/marca/icone-personalize.webp" alt="" width={99} height={61} className="passo-icone" />
                <h3>Digite o nome</h3>
                <p className="letra-miuda">Veja a capa na hora. Com a turma, você cria o personagem e aprova o desenho antes de pagar.</p>
              </div>
              <div className="passo cartao">
                <span className="numero">3</span>
                <Image src="/marca/icone-imprima.webp" alt="" width={58} height={62} className="passo-icone" />
                <h3>Receba e imprima</h3>
                <p className="letra-miuda">O arquivo chega por e-mail e WhatsApp. Imprima em casa ou na gráfica.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Por que é diferente */}
        <section className="secao secao-azul">
          <div className="miolo">
            <div className="titulo-secao">
              <h2 className="titulo-rabisco titulo-estrela">Por que é diferente</h2>
            </div>
            <div className="diferenciais">
              {DIFERENCIAIS.map((d) => (
                <div key={d.titulo} className={`diferencial ${d.jeito}`}>
                  <Image src={d.arte.src} alt="" width={d.arte.l} height={d.arte.a} className="diferencial-arte" />
                  <div>
                    <h3>{d.titulo}</h3>
                    <p>{d.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Fotos de clientes: entra depois das primeiras vendas */}

        {/* 8. Perguntas frequentes */}
        <section className="secao" id="duvidas">
          <div className="miolo">
            <div className="titulo-secao">
              <h2 className="titulo-rabisco titulo-coracao">Perguntas frequentes</h2>
            </div>
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

        {/* 9. Chamada final */}
        <section className="secao secao-nuvem final">
          <Confete />
          <div className="miolo">
            <h2>
              A festa vai ficar com a <Grifo cor={COR.rosa}>cara do seu filho</Grifo>
            </h2>
            <p style={{ fontSize: '1.15rem' }}>Escolha o tema, digite o nome e receba em minutos.</p>
            <Link href="/criar" className="botao">
              Criar meu livrinho agora
            </Link>
          </div>
        </section>
      </main>
      <Rodape />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados) }} />
    </>
  );
}
