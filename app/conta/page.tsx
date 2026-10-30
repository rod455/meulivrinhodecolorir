import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Cabecalho } from '@/components/Cabecalho';
import { Icone } from '@/components/Icone';
import { linkDoWhatsapp, SITE } from '@/lib/config';
import { STATUS_DO_PEDIDO, STATUS_DO_PEDIDO_DA_TURMA } from '@/lib/conta';
import { acharEdicao, ROTULO_DO_FORMATO } from '@/lib/livros-publicados';
import { emReais, ehProduto, PRODUTOS } from '@/lib/produtos';
import { contaDaSessao, supabaseNoServidor } from '@/lib/servidor/sessao';
import { ehTema, TEMAS } from '@/lib/temas';
import { AcoesDaConta } from './AcoesDaConta';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Minha conta | Meu Livrinho de Colorir',
  robots: { index: false },
};

type Linha = {
  id: string;
  criado_em: string;
  produto: string;
  tema: string;
  nome_crianca: string;
  status: string;
  total_centavos: number;
  link_pdf: string | null;
};

// A conta no formato de perfil (pedido do dono, 25/10/2026, a partir da tela
// de perfil do Mentorque): quem entrou no topo, os livrinhos, a conta e as
// informações em grupos de linhas, sair e excluir no fim.
export default async function PaginaConta() {
  const conta = await contaDaSessao();
  if (!conta) redirect('/entrar?next=/conta');

  // a RLS só devolve as linhas desta conta (migração 0004)
  const supabase = supabaseNoServidor();
  const [{ data: pedidos }, { count: fotos }, { data: daTurma }] = await Promise.all([
    supabase.from('pedidos').select('id, criado_em, produto, tema, nome_crianca, status, total_centavos, link_pdf').order('criado_em', { ascending: false }),
    supabase.from('fotos').select('caminho', { count: 'exact', head: true }).is('apagada_em', null),
    supabase.from('pedidos_turma').select('id, criado_em, edicao, formato, preco_centavos, status').order('criado_em', { ascending: false }),
  ]);
  const livrosDaTurma = (daTurma ?? []) as { id: string; criado_em: string; edicao: string; formato: 'impresso' | 'pdf'; preco_centavos: number; status: string }[];
  const lista = (pedidos ?? []) as Linha[];
  const whatsapp = linkDoWhatsapp('Oi! Tenho uma dúvida sobre o meu livrinho.');
  const faleComAGente = whatsapp ?? (SITE.email ? `mailto:${SITE.email}` : null);
  const inicial = (conta.nome || conta.email).trim().charAt(0).toUpperCase();

  return (
    <>
      <Cabecalho semMenu />
      <main className="conta-perfil">
        <section className="perfil">
          <div className="perfil-avatar" aria-hidden="true">
            {inicial}
          </div>
          <h1>{conta.nome || 'Minha conta'}</h1>
          <p>{conta.email}</p>
        </section>

        <Link href="/criar" className="perfil-destaque">
          <span className="linha-icone tom-amarelo">
            <Icone nome="mais" />
          </span>
          <span className="linha-texto">
            <strong>Criar um livrinho novo</strong>
            <small>Outro tema, outro nome, outra festa.</small>
          </span>
          <span className="perfil-destaque-seta" aria-hidden="true">
            →
          </span>
        </Link>

        <h2 className="grupo-rotulo">Meus livrinhos</h2>
        {lista.length === 0 ? (
          <div className="grupo grupo-vazio">
            <p>Nenhum livrinho por aqui ainda.</p>
          </div>
        ) : (
          <ul className="grupo pedidos-da-conta">
            {lista.map((p) => (
              <li key={p.id} className="linha">
                <span className={`linha-icone ${p.link_pdf ? 'tom-verde' : 'tom-laranja'}`}>
                  <Icone nome="livro" />
                </span>
                <span className="linha-texto">
                  <strong>
                    {ehProduto(p.produto) ? PRODUTOS[p.produto].nome : p.produto} de {p.nome_crianca}
                  </strong>
                  <small>
                    {ehTema(p.tema) ? TEMAS[p.tema].nome : p.tema} · {new Date(p.criado_em).toLocaleDateString('pt-BR')} · {emReais(p.total_centavos)}
                  </small>
                  <span className={`status status-${p.status}`}>{STATUS_DO_PEDIDO[p.status] ?? p.status}</span>
                </span>
                {p.link_pdf && (
                  <a className="botao botao-pequeno" href={`/api/livro/${p.id}`}>
                    Baixar
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}

        {livrosDaTurma.length > 0 && (
          <>
            <h2 className="grupo-rotulo">Livros da turma</h2>
            <ul className="grupo pedidos-da-turma">
              {livrosDaTurma.map((p) => {
                const achado = acharEdicao(p.edicao);
                return (
                  <li key={p.id} className="linha">
                    <span className="linha-icone tom-azul">
                      <Icone nome="livro" />
                    </span>
                    <span className="linha-texto">
                      <strong lang={achado?.livro.idioma === 'en' ? 'en' : undefined}>{achado ? achado.livro.titulo : p.edicao}</strong>
                      <small>
                        {achado?.edicao.tipo} · {ROTULO_DO_FORMATO[p.formato]} · {new Date(p.criado_em).toLocaleDateString('pt-BR')} · {emReais(p.preco_centavos)}
                      </small>
                      <span className={`status status-${p.status}`}>{STATUS_DO_PEDIDO_DA_TURMA[p.status] ?? p.status}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <AcoesDaConta fotosGuardadas={fotos ?? 0} entrouCom={conta.entrouCom ?? 'email'} />

        <h2 className="grupo-rotulo">Informações</h2>
        <ul className="grupo">
          {faleComAGente && (
            <li>
              <a className="linha linha-link" href={faleComAGente} target={whatsapp ? '_blank' : undefined} rel={whatsapp ? 'noopener' : undefined}>
                <span className="linha-icone tom-verde">
                  <Icone nome="conversa" />
                </span>
                <span className="linha-texto">
                  <strong>Fale com a gente</strong>
                  <small>{whatsapp ? 'Pelo WhatsApp' : 'Pelo e-mail'}</small>
                </span>
                <Seta />
              </a>
            </li>
          )}
          <li>
            <Link className="linha linha-link" href="/#duvidas">
              <span className="linha-icone tom-azul">
                <Icone nome="ajuda" />
              </span>
              <span className="linha-texto">
                <strong>Dúvidas frequentes</strong>
              </span>
              <Seta />
            </Link>
          </li>
          <li>
            <Link className="linha linha-link" href="/privacidade">
              <span className="linha-icone tom-rosa">
                <Icone nome="escudo" />
              </span>
              <span className="linha-texto">
                <strong>Política de privacidade</strong>
              </span>
              <Seta />
            </Link>
          </li>
          <li>
            <Link className="linha linha-link" href="/termos">
              <span className="linha-icone tom-nuvem">
                <Icone nome="documento" />
              </span>
              <span className="linha-texto">
                <strong>Termos de uso</strong>
              </span>
              <Seta />
            </Link>
          </li>
        </ul>
      </main>
    </>
  );
}

function Seta() {
  return (
    <span className="linha-fim">
      <Icone nome="seta" tamanho={18} />
    </span>
  );
}
