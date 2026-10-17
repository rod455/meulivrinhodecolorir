import Link from 'next/link';
import { Cabecalho } from '@/components/Cabecalho';
import { CapaLivrinho } from '@/components/CapaLivrinho';
import { COR } from '@/components/desenho/formas';
import { ALapis, Confete, Estrelinha, GizDeCera, Grifo } from '@/components/Enfeites';
import { GaleriaDeTemas } from '@/components/GaleriaDeTemas';
import { PreviaNaLp } from '@/components/PreviaNaLp';
import { Rodape } from '@/components/Rodape';
import { FAMILIAS_ATENDIDAS, SITE } from '@/lib/config';
import { PERGUNTAS } from '@/lib/faq';
import { emReais, MENOR_PRECO, PRODUTOS } from '@/lib/produtos';

const DIFERENCIAIS = [
  { emoji: '✏️', titulo: 'Desenhos com traço grosso', texto: 'Fáceis de pintar até para os pequenos.' },
  { emoji: '📖', titulo: 'Tem história de verdade', texto: 'Não são só desenhos soltos: a criança vira a heroína.' },
  { emoji: '🎨', titulo: 'Personagens próprios', texto: 'Nada de cópia de personagem famoso.' },
  { emoji: '⚡', titulo: 'Pronto em minutos', texto: 'Nada de esperar os Correios. Você recebe na hora.' },
  { emoji: '🖨️', titulo: 'Imprima quantas vezes quiser', texto: 'Um para cada convidado da festa.' },
  { emoji: '💛', titulo: 'Garantia de 7 dias', texto: 'Se não gostar, devolvemos o seu dinheiro.' },
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
          <Confete />
          <div className="miolo">
            <div>
              <ALapis>pronto em minutos!</ALapis>
              <h1>
                Livrinho de colorir personalizado com o <Grifo>nome do seu filho</Grifo>
              </h1>
              <p className="hero-sub">
                Lembrancinha de festa ou presente, pronto em minutos. Você recebe o arquivo e imprime quantos quiser.
              </p>
              <div className="hero-chamada">
                <Link href="/criar" className="botao">
                  Criar meu livrinho
                </Link>
                <span className="letra-miuda">A partir de {emReais(MENOR_PRECO)} · Pix ou cartão</span>
                {FAMILIAS_ATENDIDAS && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                    <Estrelinha tamanho={20} /> Mais de {FAMILIAS_ATENDIDAS} famílias felizes
                  </span>
                )}
              </div>
            </div>
            <div className="hero-livros" aria-label="Três livrinhos de exemplo">
              <CapaLivrinho id="hero-1" tema="fundo-do-mar" produto="lembrancinha" nome="Helena" idade={3} corte={0.5} className="livro" />
              <CapaLivrinho id="hero-2" tema="futebol" produto="lembrancinha" nome="Theo" idade={4} corte={0.58} className="livro" />
              <CapaLivrinho id="hero-3" tema="natal" produto="presente" nome="Laura" idade={6} corte={0.45} className="livro" />
              <GizDeCera cor={COR.laranja} className="giz giz-1" rotacao={-12} />
              <GizDeCera cor={COR.azul} className="giz giz-2" rotacao={18} />
            </div>
          </div>
        </section>

        {/* 2. Como funciona */}
        <section className="secao secao-nuvem" id="como-funciona">
          <div className="miolo">
            <div className="titulo-secao">
              <h2>Como funciona</h2>
              <p>Três passos, e a festa ganha a cara do seu filho.</p>
            </div>
            <div className="passos">
              <div className="passo cartao">
                <span className="numero">1</span>
                <div className="icones" aria-hidden="true">⚽🎄🌊</div>
                <h3>Escolha o tema</h3>
                <p className="letra-miuda">Futebol, Natal ou fundo do mar, com personagens nossos.</p>
              </div>
              <div className="passo cartao">
                <span className="numero">2</span>
                <div className="icones" aria-hidden="true">✏️</div>
                <h3>Digite o nome</h3>
                <p className="letra-miuda">E veja a capa pronta na hora, antes de pagar.</p>
              </div>
              <div className="passo cartao">
                <span className="numero">3</span>
                <div className="icones" aria-hidden="true">🖨️</div>
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
              <h2>
                Experimente: digite o <Grifo cor={COR.azul}>nome</Grifo>
              </h2>
              <p>A capa muda enquanto você digita. Sem cadastro, sem compromisso.</p>
            </div>
            <PreviaNaLp />
          </div>
        </section>

        {/* 4. Produtos */}
        <section className="secao secao-nuvem" id="produtos">
          <div className="miolo">
            <div className="titulo-secao">
              <h2>Escolha o seu livrinho</h2>
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
              <h2>Temas exclusivos</h2>
              <p>Toque numa capa para ver as páginas por dentro.</p>
            </div>
            <GaleriaDeTemas />
          </div>
        </section>

        {/* 6. Por que é diferente */}
        <section className="secao secao-azul">
          <div className="miolo">
            <div className="titulo-secao">
              <h2>Por que é diferente</h2>
            </div>
            <div className="diferenciais">
              {DIFERENCIAIS.map((d) => (
                <div key={d.titulo} className="diferencial">
                  <span className="emoji" aria-hidden="true">{d.emoji}</span>
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
              <h2>Perguntas frequentes</h2>
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
