import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Cabecalho } from '@/components/Cabecalho';
import { bilheteConfere, ehUuid } from '@/lib/ficha';
import { avisoDaVersao, chavesDoLivro } from '@/lib/livro';
import { pedidoDoLivro } from '@/lib/servidor/livros';
import type { TemaId } from '@/lib/temas';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Revisar livro | Meu Livrinho de Colorir', robots: { index: false, follow: false } };

const SITUACAO: Record<string, string> = {
  gerando: 'O livro está sendo desenhado. Leva uns 10 minutos; o e-mail chega quando terminar.',
  montado: 'O livro está pronto e esperando a sua revisão. A família ainda não recebeu nada.',
  falhou: 'A geração parou antes do fim. Nada foi enviado à família.',
  liberado: 'Liberado. O livro está em "Meus livrinhos" da família e o aviso foi enviado.',
};

// A tela do dono, aberta pelo link do e-mail de revisão. A chave do link é a única
// senha: sem ela, a página não existe. Liberar e refazer são botões (POST), para
// nenhum leitor de e-mail que abre links sozinho liberar um livro sem querer.
export default async function Revisar({ params, searchParams }: { params: { id: string }; searchParams: { chave?: string } }) {
  const pedido = ehUuid(params.id) ? await pedidoDoLivro(params.id).catch(() => null) : null;
  if (!pedido || !bilheteConfere(pedido.livro_revisao, searchParams.chave)) notFound();
  const chave = searchParams.chave!;
  const total = pedido.plano ? chavesDoLivro(pedido.tema as TemaId, pedido.plano).length : 0;
  const prontas = pedido.livro_paginas.length;
  const situacao = pedido.livro_status ? SITUACAO[pedido.livro_status] : 'O livro ainda não começou: o pedido precisa estar pago.';
  const pdf = `/api/livro-auto/pdf?id=${pedido.id}&chave=${chave}`;
  return (
    <>
      <Cabecalho semMenu />
      <main className="texto-longo revisar-livro">
        <h1>Livro de {pedido.nome_crianca}</h1>
        {avisoDaVersao(pedido.versao) && (
          <div className="aviso-erro" role="alert">
            {avisoDaVersao(pedido.versao)}
          </div>
        )}
        <p className="letra-miuda">
          Pedido {pedido.id.slice(0, 8).toUpperCase()} · tema {pedido.tema}
        </p>
        <p style={{ fontSize: '1.15rem' }}>{situacao}</p>
        {pedido.livro_status === 'gerando' && (
          <p>
            Páginas desenhadas: {prontas} de {total}.
          </p>
        )}
        {pedido.livro_erro && <p className="letra-miuda">O que o sistema anotou: {pedido.livro_erro}</p>}
        {pedido.livro_avisos.length > 0 && (
          <div className="cartao" style={{ margin: '16px 0' }}>
            <strong>Páginas para olhar com atenção</strong>
            <ul>
              {pedido.livro_avisos.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        {(pedido.livro_status === 'montado' || pedido.livro_status === 'liberado') && pedido.livro_pdf && (
          <p>
            <a className="botao botao-secundario" href={pdf} target="_blank" rel="noopener noreferrer">
              Abrir o PDF
            </a>
          </p>
        )}

        {pedido.livro_status === 'montado' && (
          <form method="post" action="/api/livro-auto/liberar">
            <input type="hidden" name="id" value={pedido.id} />
            <input type="hidden" name="chave" value={chave} />
            <button className="botao" type="submit">
              Liberar para a família
            </button>
          </form>
        )}

        {(pedido.livro_status === 'montado' || pedido.livro_status === 'falhou') && (
          <div className="cartao" style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: '1.2rem', marginTop: 0 }}>Não ficou bom?</h2>
            {pedido.livro_status === 'falhou' && (
              <form method="post" action="/api/livro-auto/refazer" style={{ marginBottom: 12 }}>
                <input type="hidden" name="id" value={pedido.id} />
                <input type="hidden" name="chave" value={chave} />
                <input type="hidden" name="o_que" value="faltantes" />
                <button className="botao" type="submit">
                  Tentar de novo só o que faltou
                </button>
              </form>
            )}
            <form method="post" action="/api/livro-auto/refazer">
              <input type="hidden" name="id" value={pedido.id} />
              <input type="hidden" name="chave" value={chave} />
              <input type="hidden" name="o_que" value="tudo" />
              <button className="botao botao-secundario" type="submit">
                Desenhar o livro inteiro de novo
              </button>
            </form>
            <p className="letra-miuda">Desenhar de novo custa um livro inteiro na OpenAI (17 imagens).</p>
          </div>
        )}
      </main>
    </>
  );
}
