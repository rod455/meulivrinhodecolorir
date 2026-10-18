import Image from 'next/image';
import Link from 'next/link';
import { Cabecalho } from '@/components/Cabecalho';
import { COR } from '@/components/desenho/formas';
import { ALapis, Confete, Estrelinha, Grifo } from '@/components/Enfeites';
import { GaleriaDeTemas } from '@/components/GaleriaDeTemas';
import { PreviaNaLp } from '@/components/PreviaNaLp';
import { Rodape } from '@/components/Rodape';
import { FAMILIAS_ATENDIDAS, SITE } from '@/lib/config';
import { PERGUNTAS } from '@/lib/faq';
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

  return (
    <>
      <Cabecalho />
      <main>
        {/* 1. Hero */}
        <section className="hero">
          <div className="miolo">
            <div>
              <ALapis>Sua história começa com um rabisco</ALapis>
              <h1>
                Uma história com o <Grifo>nome do seu pequeno</Grifo>. E as cores que ele imaginar.
              </h1>
              <p className="hero-sub">
                Personalize um livrinho de colorir e transforme uma história em um momento de criação. Lembrancinha de festa ou
                presente: você recebe o arquivo na hora e imprime quantos quiser.
              </p>
              <div className="hero-chamada">
                <div className="hero-botoes">
                  <Link href="/criar" className="botao">
                    Criar meu livrinho
                  </Link>
                  <Link href="#temas" className="botao botao-secundario">
                    Ver um exemplo
                  </Link>
                </div>
                <span className="letra-miuda">A partir de {emReais(MENOR_PRECO)} · Pix ou cartão</span>
                {FAMILIAS_ATENDIDAS && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                    <Estrelinha tamanho={20} /> Mais de {FAMILIAS_ATENDIDAS} famílias felizes
                  </span>
                )}
              </div>
            </div>
            <div className="hero-arte">
              <Image
                src="/marca/hero-livro.webp"
                alt="Criança pintando um livrinho aberto: uma página ainda em contorno e a outra já colorida, com um dinossauro"
                width={1536}
                height={1024}
                sizes="(min-width: 860px) 560px, 100vw"
                priority
              />
            </div>
          </div>
        </section>

        {/* 2. Como funciona */}
        <section className="secao secao-nuvem" id="como-funciona">
          <div className="miolo">
            <div className="titulo-secao">
              <Image src="/marca/rabisco-acenando.webp" alt="" width={96} height={121} className="rabisco" />
              <h2>Como funciona</h2>
              <p>Três passos, e a festa ganha a cara do seu filho.</p>
            </div>
            <div className="passos">
              <div className="passo cartao">
                <span className="numero">1</span>
                <Image src="/marca/icone-escolha.webp" alt="" width={116} height={65} className="passo-icone" />
                <h3>Escolha o tema</h3>
                <p className="letra-miuda">Futebol, Natal ou fundo do mar, com personagens nossos.</p>
              </div>
              <div className="passo cartao">
                <span className="numero">2</span>
                <Image src="/marca/icone-personalize.webp" alt="" width={99} height={61} className="passo-icone" />
                <h3>Digite o nome</h3>
                <p className="letra-miuda">E veja a capa pronta na hora, antes de pagar.</p>
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

        {/* 3. Prévia interativa */}
        <section className="secao" id="previa">
          <div className="miolo">
            <div className="titulo-secao">
              <Image src="/marca/rabisco-desenhando.webp" alt="" width={110} height={134} className="rabisco" />
              <h2>
                Experimente: digite o <Grifo cor={COR.azul}>nome</Grifo>
              </h2>
              <p>Cada livrinho leva o nome da criança na capa e nas páginas. Monte e veja a capa sem cadastro; a conta só entra na hora de comprar.</p>
            </div>
            <PreviaNaLp />
          </div>
        </section>

        {/* 4. Produtos */}
        <section className="secao secao-nuvem" id="produtos">
          <div className="miolo">
            <div className="titulo-secao">
              <h2 className="titulo-rabisco titulo-estrela">Escolha o seu livrinho</h2>
              <p>Você paga uma vez e imprime quantas vezes quiser.</p>
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

        {/* 5. Galeria de temas */}
        <section className="secao" id="temas">
          <div className="miolo">
            <div className="titulo-secao">
              <h2 className="titulo-rabisco titulo-coracao">Temas exclusivos</h2>
              <p>Toque numa capa para ver as páginas por dentro.</p>
            </div>
            <GaleriaDeTemas />
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
