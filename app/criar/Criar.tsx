'use client';

// O fluxo do pedido (seção 4.2, passos 3 a 7): produto, tema, personalização
// com prévia ao vivo, o personagem (só nos temas com história para ele) e, por
// fim, os dados de contato e a forma de pagamento.
// Sem conta e sem cadastro. O preço mostrado aqui é só vitrine: a rota recalcula.

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CapaLivrinho } from '@/components/CapaLivrinho';
import { FormularioDeConta, useConta } from '@/components/FormularioDeConta';
import { Icone } from '@/components/Icone';
import { lerOrigem } from '@/components/GuardaOrigem';
import { PaginaAmostra } from '@/components/PaginaAmostra';
import { registrar } from '@/lib/analytics';
import { supabaseNoNavegador } from '@/lib/supabase/navegador';
import { linkDoWhatsapp } from '@/lib/config';
import { arrumarNome, LIMITE_DO_NOME, MENSAGEM_DO_PROBLEMA, problemaDoNome } from '@/lib/nome';
import { DEDICATORIAS_PRONTAS, LIMITE_DA_DEDICATORIA, lerPedido, type ErrosDoPedido } from '@/lib/pedido';
import { chaveDoDesenho } from '@/lib/ficha';
import { lerPersonagem, PERSONAGEM_INICIAL, SUPERPODERES, type Personagem } from '@/lib/personagem';
import { DESCONTO_PIX, ehProduto, emReais, LISTA_DE_PRODUTOS, PRODUTOS, totalDoPedido, type FormaDePagamento, type ProdutoId } from '@/lib/produtos';
import { LIVROS_PUBLICADOS } from '@/lib/livros-publicados';
import { caminhoDoTema, ehCaminho, ehTema, TEMAS, TEMAS_DO_CAMINHO, type Caminho, type TemaId } from '@/lib/temas';
import { EtapaFicha } from './EtapaFicha';
import { EtapaHistoria } from './EtapaHistoria';
import { BRIEFING_INICIAL, type Briefing } from '@/lib/historia';
import { EtapaPersonagem, partesDoPersonagem, type ParteDoPersonagem } from './EtapaPersonagem';

/**
 * 6 o começo (a turma Little Paws ou uma história do zero), 0 produto, 1 tema,
 * 2 nome, 3 personagem e 4 desenho do personagem (só se o tema tem), 5 contato e pagamento.
 * Na turma o tema (a história) vem antes do produto; do zero, o produto vem antes.
 * 7 é a história sob medida: a IA escreve e a família aprova o texto (31/10/2026).
 */
type Etapa = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
const GUARDADO = 'livrinho:rascunho';
/** o nome de cada passo, acima da barra de progresso (revisão de CRO, 25/10/2026) */
const NOME_DA_ETAPA: Record<Etapa, string> = { 6: 'o começo', 0: 'o livrinho', 1: 'a história', 2: 'o nome', 3: 'o personagem', 4: 'aprovar o desenho', 7: 'aprovar a história', 5: 'pagar' };
/** volta do Google e do link por e-mail: cai direto no pagamento, com o rascunho guardado */
export const DESTINO_DEPOIS_DE_ENTRAR = '/criar?etapa=pagar';
/** a conta agora costuma nascer antes do desenho do personagem */
export const DESTINO_DEPOIS_DE_ENTRAR_NA_FICHA = '/criar?etapa=ficha';

type Rascunho = {
  /** a primeira escolha: a turma Little Paws ou do zero (31/10/2026) */
  caminho: Caminho | null;
  produto: ProdutoId | null;
  tema: TemaId | null;
  nome: string;
  idade: number;
  dataDaFesta: string;
  dedicatoria: string;
  responsavel: string;
  email: string;
  whatsapp: string;
  pagamento: FormaDePagamento;
  aceitaNovidades: boolean;
  aceitaLembrete: boolean;
  personagem: Personagem;
  /** a última ficha desenhada, para que desenho ela foi feita e se a família aprovou */
  fichaId: string | null;
  fichaDoDesenho: string | null;
  fichaAprovada: boolean;
  /** a história sob medida: o que a família contou e a última história escrita */
  briefing: Briefing;
  historiaId: string | null;
  historiaAprovada: boolean;
  historiaTitulo: string;
  /** a história foi escrita com este superpoder e esta idade: mudou, escreve de novo */
  historiaSuperpoder: string | null;
  historiaIdade: number | null;
};

const VAZIO: Rascunho = {
  caminho: null,
  produto: null,
  tema: null,
  nome: '',
  idade: 5,
  dataDaFesta: '',
  dedicatoria: '',
  responsavel: '',
  email: '',
  whatsapp: '',
  pagamento: 'pix',
  aceitaNovidades: false,
  aceitaLembrete: true,
  personagem: PERSONAGEM_INICIAL,
  fichaId: null,
  fichaDoDesenho: null,
  fichaAprovada: false,
  briefing: BRIEFING_INICIAL,
  historiaId: null,
  historiaAprovada: false,
  historiaTitulo: '',
  historiaSuperpoder: null,
  historiaIdade: null,
};

/** a história aprovada só vale para o superpoder e a idade com que foi escrita */
const historiaEmDiaDe = (r: Rascunho) => r.historiaAprovada && Boolean(r.historiaId) && r.historiaSuperpoder === r.personagem.superpoder && r.historiaIdade === r.idade;

/** trocar de caminho: a sob medida tem produto e tema próprios, que não servem aos outros */
function noCaminho(atual: Rascunho, caminho: Caminho): Rascunho {
  if (caminho === 'sob-medida') return { ...atual, caminho, produto: 'sob-medida', tema: 'sob-medida' };
  return {
    ...atual,
    caminho,
    produto: atual.produto === 'sob-medida' ? null : atual.produto,
    tema: atual.tema && caminhoDoTema(atual.tema) === caminho ? atual.tema : null,
  };
}

function primeiraEtapaQueFalta(r: Rascunho): Etapa {
  if (!r.caminho) return 6;
  if (r.caminho === 'turma' && !r.tema) return 1;
  if (!r.produto) return 0;
  if (!r.tema) return 1;
  return 2;
}

/** a ordem dos passos depende do caminho e de o tema ter personagem */
function ordemDasEtapas(caminho: Caminho | null, temPersonagem: boolean): Etapa[] {
  if (caminho === 'sob-medida') return [6, 2, 3, 4, 7, 5];
  if (caminho === 'turma') return temPersonagem ? [6, 1, 0, 2, 3, 4, 5] : [6, 1, 0, 2, 5];
  return temPersonagem ? [6, 0, 1, 2, 3, 4, 5] : [6, 0, 1, 2, 5];
}

export function Criar({ fotoLigada, google }: { fotoLigada: boolean; google: boolean }) {
  const { carregando: carregandoConta, conta } = useConta();
  const busca = useSearchParams();
  const router = useRouter();
  const [r, setR] = useState<Rascunho>(VAZIO);
  const [etapa, setEtapa] = useState<Etapa>(0);
  const [pronto, setPronto] = useState(false);
  const [erros, setErros] = useState<ErrosDoPedido>({});
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);
  const [abriuDedicatoria, setAbriuDedicatoria] = useState(false);
  const [parte, setParte] = useState<ParteDoPersonagem>(0);
  const topo = useRef<HTMLDivElement>(null);
  const viuPrevia = useRef(false);

  // Começa do rascunho guardado e por cima aplica o que veio no link (LP, anúncio).
  useEffect(() => {
    let base = VAZIO;
    try {
      // localStorage, não sessionStorage: o link de entrada por e-mail abre em outra aba
      const salvo = localStorage.getItem(GUARDADO);
      if (salvo) base = { ...VAZIO, ...JSON.parse(salvo) };
    } catch {
      // sem armazenamento, começa do zero
    }
    const produto = busca.get('produto');
    const tema = busca.get('tema');
    const caminhoPedido = busca.get('caminho');
    const nome = busca.get('nome');
    const idade = Number(busca.get('idade'));
    // o tema decide o caminho (futebol é da turma); sem tema no link, vale o caminho pedido, e o tema guardado
    // que não for do caminho escolhido é esquecido
    const caminho: Caminho | null =
      produto === 'sob-medida' ? 'sob-medida' : ehTema(tema) ? caminhoDoTema(tema) : ehCaminho(caminhoPedido) ? caminhoPedido : base.caminho;
    const temaGuardado = base.tema && caminho && caminhoDoTema(base.tema) === caminho ? base.tema : null;
    const comLink: Rascunho = {
      ...base,
      caminho,
      produto: ehProduto(produto) ? produto : base.produto,
      tema: ehTema(tema) ? tema : temaGuardado,
      nome: nome ? arrumarNome(nome).slice(0, LIMITE_DO_NOME + 6) : base.nome,
      idade: Number.isInteger(idade) && idade >= 1 && idade <= 10 ? idade : base.idade,
    };
    const inicial = caminho ? noCaminho(comLink, caminho) : comLink;
    setR(inicial);
    const falta = primeiraEtapaQueFalta(inicial);
    const completo = falta === 2 && !problemaDoNome(inicial.nome);
    const comPersonagem = Boolean(inicial.tema && TEMAS[inicial.tema].comPersonagem);
    const fichaEmDia = inicial.fichaAprovada && inicial.fichaDoDesenho === chaveDoDesenho(inicial.personagem, inicial.idade);
    const pediu = busca.get('etapa');
    const sobMedida = inicial.caminho === 'sob-medida';
    if (completo && pediu === 'ficha' && comPersonagem) setEtapa(4);
    else if (completo && pediu === 'historia' && sobMedida) setEtapa(fichaEmDia ? 7 : 4);
    else if (completo && pediu === 'pagar') setEtapa(comPersonagem && !fichaEmDia ? 4 : sobMedida && !historiaEmDiaDe(inicial) ? 7 : 5);
    else setEtapa(falta);
    setPronto(true);
    registrar('personalizacao_iniciada');
  }, [busca]);

  useEffect(() => {
    if (!pronto) return;
    try {
      localStorage.setItem(GUARDADO, JSON.stringify(r));
    } catch {
      // segue sem guardar
    }
  }, [r, pronto]);

  function irPara(nova: Etapa) {
    setEtapa(nova);
    // o personagem sempre recomeça pela primeira telinha
    if (nova === 3) setParte(0);
    setFalha(null);
    topo.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (nova === 2 && !viuPrevia.current) {
      viuPrevia.current = true;
      registrar('previa_vista', { tema: r.tema ?? '', produto: r.produto ?? '' });
    }
    if (nova === 5) registrar('checkout_iniciado', { produto: r.produto ?? '' });
  }

  const muda = <K extends keyof Rascunho>(campo: K, valor: Rascunho[K]) => {
    setR((atual) => ({ ...atual, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  if (!pronto) return <div style={{ minHeight: '60vh' }} />;

  const produto = r.produto ? PRODUTOS[r.produto] : null;
  const nome = arrumarNome(r.nome);
  const problema = r.nome.trim() ? problemaDoNome(r.nome) : null;
  const nomeNaCapa = problema === 'bloqueado' ? '' : nome;
  const temPersonagem = Boolean(r.tema && TEMAS[r.tema].comPersonagem);
  // a dedicatória abre ao toque (etapa do nome mais curta); já escrita, fica aberta
  const comDedicatoria = abriuDedicatoria || r.dedicatoria.trim() !== '';
  const ordem = ordemDasEtapas(r.caminho, temPersonagem);
  // a ficha aprovada só vale para o desenho de agora: mudou cabelo ou idade, desenha de novo
  const fichaEmDia = r.fichaAprovada && r.fichaDoDesenho === chaveDoDesenho(r.personagem, r.idade);
  const posicao = Math.max(0, ordem.indexOf(etapa));
  const sobMedida = r.caminho === 'sob-medida';
  const historiaEmDia = historiaEmDiaDe(r);
  /** a sob medida é um livrinho com história, como o Presente */
  const livroComHistoria = r.produto === 'presente' || r.produto === 'sob-medida';
  /** depois da ficha aprovada: a sob medida ainda passa pela história */
  const depoisDaFicha: Etapa = sobMedida && !historiaEmDia ? 7 : 5;

  function validarPersonalizacao(): boolean {
    const p = problemaDoNome(r.nome);
    const novos: ErrosDoPedido = {};
    if (p) novos.nome = MENSAGEM_DO_PROBLEMA[p];
    if (produto?.temDedicatoria && [...r.dedicatoria.trim()].length > LIMITE_DA_DEDICATORIA) {
      novos.dedicatoria = `A dedicatória pode ter até ${LIMITE_DA_DEDICATORIA} caracteres.`;
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  // sem o envio de foto ligado, um rascunho antigo no jeito foto volta para as características
  const personagemDoPedido: Personagem = fotoLigada ? r.personagem : { ...r.personagem, jeito: 'caracteristicas', foto: null };

  function mudarParte(nova: ParteDoPersonagem) {
    setParte(nova);
    setErros((e) => ({ ...e, personagem: undefined }));
    topo.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function validarPersonagem() {
    // a foto é da primeira telinha: sem ela, não passa dali
    if (parte === 0 && personagemDoPedido.jeito === 'foto' && !personagemDoPedido.foto) {
      setErros((e) => ({ ...e, personagem: 'Envie a foto da criança.' }));
      return;
    }
    if (parte < partesDoPersonagem(personagemDoPedido.jeito).length - 1) {
      mudarParte(parte + 1);
      return;
    }
    const lido = lerPersonagem(personagemDoPedido);
    if (!lido.ok) {
      setErros((e) => ({ ...e, personagem: lido.erro }));
      return;
    }
    irPara(fichaEmDia ? depoisDaFicha : 4);
  }

  async function enviar() {
    if (!conta) return;
    if (temPersonagem && !fichaEmDia) {
      irPara(4);
      return;
    }
    if (sobMedida && !historiaEmDia) {
      irPara(7);
      return;
    }
    const resultado = lerPedido({ ...r, email: conta.email, personagem: personagemDoPedido });
    if (!resultado.ok) {
      setErros(resultado.erros);
      if (resultado.erros.nome || resultado.erros.dedicatoria) irPara(2);
      else if (resultado.erros.personagem) irPara(r.fichaId ? 4 : 3);
      else if (resultado.erros.historiaId) irPara(7);
      return;
    }
    setEnviando(true);
    setFalha(null);
    try {
      const resposta = await fetch('/api/pedido', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...r, email: conta.email, personagem: personagemDoPedido, fichaId: temPersonagem ? r.fichaId : null, historiaId: sobMedida ? r.historiaId : null, origem: lerOrigem(), site: (document.getElementById('site') as HTMLInputElement | null)?.value ?? '' }),
      });
      const dados = (await resposta.json().catch(() => ({}))) as { id?: string; pagar?: string | null; erros?: ErrosDoPedido; mensagem?: string };
      if (!resposta.ok || !dados.id) {
        if (dados.erros) setErros(dados.erros);
        if (dados.erros?.personagem) {
          setEnviando(false);
          // a ficha deixou de valer (mudou, ou já virou outro pedido): desenha e aprova de novo
          setR((atual) => ({ ...atual, fichaAprovada: false }));
          irPara(4);
          return;
        }
        if (dados.erros?.historiaId) {
          setEnviando(false);
          setR((atual) => ({ ...atual, historiaAprovada: false }));
          irPara(7);
          return;
        }
        setFalha(dados.mensagem ?? 'Não conseguimos registrar o pedido agora. Tente de novo em instantes.');
        setEnviando(false);
        return;
      }
      registrar('pedido_enviado', { produto: resultado.pedido.produto, valor: resultado.pedido.total / 100 });
      try {
        localStorage.removeItem(GUARDADO);
      } catch {
        // tanto faz
      }
      if (dados.pagar) {
        window.location.href = dados.pagar;
      } else {
        router.push(`/obrigado?pedido=${encodeURIComponent(dados.id)}`);
      }
    } catch {
      setFalha('Sem conexão agora. Confira a internet e tente de novo.');
      setEnviando(false);
    }
  }

  const total = r.produto ? totalDoPedido(r.produto, r.pagamento) : 0;
  // a barra fixa só aparece quando tem botão: sem botão ela só cobria o formulário de conta
  const acaoDaBarra =
    etapa === 2 ? (
      <button type="button" className="botao" onClick={() => validarPersonalizacao() && irPara(temPersonagem ? 3 : 5)}>
        Continuar
      </button>
    ) : etapa === 3 ? (
      <button type="button" className="botao" onClick={validarPersonagem}>
        Continuar
      </button>
    ) : etapa === 5 && conta ? (
      <button type="button" className="botao" disabled={enviando} onClick={enviar}>
        {enviando ? 'Enviando…' : r.pagamento === 'pix' ? 'Pagar com Pix' : 'Pagar com cartão'}
      </button>
    ) : null;
  const whatsappAjuda = linkDoWhatsapp('Oi! Estou tentando fazer o pedido do livrinho e não consegui.');

  return (
    <div ref={topo} style={{ scrollMarginTop: 90 }}>
      <p className="etapa-nome" aria-hidden="true">
        Passo {posicao + 1} de {ordem.length}: <strong>{NOME_DA_ETAPA[etapa]}</strong>
      </p>
      <ol className="etapas" aria-label={`Etapa ${posicao + 1} de ${ordem.length}: ${NOME_DA_ETAPA[etapa]}`}>
        {ordem.map((e, i) => (
          <li key={e} className={i < posicao ? 'feita' : i === posicao ? 'atual' : ''} />
        ))}
      </ol>
      {etapa !== 6 && (
        <button type="button" className="voltar" onClick={() => (etapa === 3 && parte > 0 ? mudarParte(parte - 1) : irPara(ordem[posicao - 1] ?? 6))}>
          ← Voltar
        </button>
      )}

      {etapa === 6 && (
        <section>
          <h1 style={{ fontSize: 'clamp(1.9rem, 6vw, 2.6rem)' }}>Como você quer começar?</h1>
          <div className="escolhas escolhas-caminho">
            <button
              type="button"
              className="cartao escolha caminho-turma"
              aria-pressed={r.caminho === 'turma'}
              onClick={() => {
                setR((atual) => noCaminho(atual, 'turma'));
                registrar('caminho_escolhido', { caminho: 'turma' });
                irPara(1);
              }}
            >
              <Image src="/artes/turma-em-fila.webp" alt="" width={970} height={600} className="caminho-arte" />
              <strong style={{ fontSize: '1.3rem', fontFamily: 'var(--fonte-titulo)' }}>Com a turma Little Paws</strong>
              <span>{nomeNaCapa || 'Seu filho'} entra numa história da turma e vive a aventura junto com o Pip, o Bo, a Luna, a Dot e o Milo, desenhado do jeitinho que você escolher.</span>
            </button>
            <button
              type="button"
              className="cartao escolha caminho-zero"
              aria-pressed={r.caminho === 'zero'}
              onClick={() => {
                setR((atual) => noCaminho(atual, 'zero'));
                registrar('caminho_escolhido', { caminho: 'zero' });
                irPara(r.produto && r.produto !== 'sob-medida' ? 1 : 0);
              }}
            >
              <Image src="/marca/rabisco-com-livro.webp" alt="" width={220} height={353} className="caminho-arte caminho-arte-rabisco" />
              <strong style={{ fontSize: '1.3rem', fontFamily: 'var(--fonte-titulo)' }}>Uma história do zero</strong>
              <span>Uma história só {nomeNaCapa ? `de ${nomeNaCapa}` : 'do seu filho'}, com o nome na capa e nas páginas: Natal, fundo do mar e mais temas.</span>
            </button>
            <button
              type="button"
              className="cartao escolha caminho-sob-medida"
              aria-pressed={r.caminho === 'sob-medida'}
              onClick={() => {
                setR((atual) => noCaminho(atual, 'sob-medida'));
                registrar('caminho_escolhido', { caminho: 'sob-medida' });
                irPara(2);
              }}
            >
              <Image src="/artes/turma-comemorando.webp" alt="" width={600} height={600} className="caminho-arte" />
              <span className="selo-personagem">Novo</span>
              <strong style={{ fontSize: '1.3rem', fontFamily: 'var(--fonte-titulo)' }}>História 100% personalizada</strong>
              <span>
                Você conta o lugar, a lição e do que {nomeNaCapa || 'seu filho'} gosta, e a gente escreve uma história inteira, do começo ao fim, no jeito da
                turma Little Paws. Você lê e aprova antes de pagar. {emReais(PRODUTOS['sob-medida'].preco)}.
              </span>
            </button>
          </div>
          <p className="letra-miuda">
            Quer o livro da turma como ele é, para ler e pintar? <a href="/#little-paws">Veja os livros da turma</a>.
          </p>
        </section>
      )}

      {etapa === 0 && (
        <section>
          <h1 style={{ fontSize: 'clamp(1.9rem, 6vw, 2.6rem)' }}>{r.caminho === 'turma' && r.tema ? 'Em que formato?' : 'O que você quer criar?'}</h1>
          <div className="escolhas">
            {LISTA_DE_PRODUTOS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="cartao escolha"
                aria-pressed={r.produto === p.id}
                onClick={() => {
                  muda('produto', p.id);
                  registrar('produto_escolhido', { produto: p.id });
                  // na turma a história já foi escolhida antes, então daqui vai direto para o nome
                  irPara(r.tema ? 2 : 1);
                }}
              >
                <span style={{ fontSize: '2.2rem' }} aria-hidden="true">{p.emoji}</span>
                <strong style={{ fontSize: '1.3rem', fontFamily: 'var(--fonte-titulo)' }}>{p.nome}</strong>
                <span>{p.resumo}</span>
                <span className="letra-miuda">
                  {p.paginas} · {p.idealPara}
                </span>
                <span style={{ fontFamily: 'var(--fonte-titulo)', fontWeight: 800, fontSize: '1.6rem', marginTop: 6 }}>{emReais(p.preco)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {etapa === 1 && (
        <section>
          <h1 style={{ fontSize: 'clamp(1.9rem, 6vw, 2.6rem)' }}>
            {r.caminho === 'turma' ? `Em que história ${nomeNaCapa || 'seu filho'} vai entrar?` : 'Escolha o tema'}
          </h1>
          <p className="letra-miuda">Todos os temas são para meninos e meninas, de 2 a 8 anos.</p>
          <div className="escolhas">
            {TEMAS_DO_CAMINHO[r.caminho ?? 'zero'].map((t) => (
              <button
                key={t.id}
                type="button"
                className="cartao escolha"
                aria-pressed={r.tema === t.id}
                onClick={() => {
                  muda('tema', t.id);
                  registrar('tema_escolhido', { tema: t.id });
                  irPara(r.produto ? 2 : 0);
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8, alignItems: 'end' }}>
                  <CapaLivrinho id={`escolha-${t.id}`} tema={t.id} produto={livroComHistoria ? 'presente' : 'lembrancinha'} nome={nomeNaCapa} idade={r.idade} />
                  <PaginaAmostra tema={t.id} nome={nomeNaCapa} pagina={1} />
                </div>
                {t.comPersonagem && <span className="selo-personagem">A criança vira personagem</span>}
                <strong style={{ fontSize: '1.2rem', marginTop: 8 }}>
                  {t.emoji} {t.nome}
                </strong>
                <span className="letra-miuda">{t.descricao}</span>
                {t.comPersonagem && (
                  <span className="letra-miuda">
                    <strong>{nomeNaCapa || 'A criança'} entra no time</strong> e joga com a turma, desenhada do jeitinho que você escolher.
                  </span>
                )}
              </button>
            ))}
            {r.caminho === 'turma' &&
              LIVROS_PUBLICADOS.filter((l) => !l.temaPersonalizado).map((l) => {
                const capa = l.edicoes.find((e) => e.capa)?.capa;
                return (
                  <div key={l.id} className="cartao escolha escolha-em-breve" aria-disabled="true">
                    {capa && <Image src={capa.src} alt="" width={capa.largura} height={capa.altura} className="em-breve-capa" />}
                    <span className="selo-em-breve">Em breve</span>
                    <strong style={{ fontSize: '1.2rem' }}>{l.tema}</strong>
                    <span className="letra-miuda">
                      {nomeNaCapa || 'Seu filho'} jogando com {l.protagonista} em {l.titulo}.
                    </span>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {etapa === 2 && r.produto && r.tema && produto && (
        <section className="criar-grade">
          <div className="criar-capas" aria-live="polite">
            <CapaLivrinho
              id="criar-capa"
              tema={r.tema}
              produto={livroComHistoria ? 'presente' : 'lembrancinha'}
              nome={nomeNaCapa}
              idade={r.idade}
              corte={nome ? 0.6 : 0.25}
            />
            {r.produto === 'combo' ? (
              <CapaLivrinho id="criar-capa-2" tema={r.tema} produto="presente" nome={nomeNaCapa} idade={r.idade} corte={nome ? 0.6 : 0.25} />
            ) : (
              <PaginaAmostra tema={r.tema} nome={nomeNaCapa} pagina={1} historia={livroComHistoria} />
            )}
            <PaginaAmostra tema={r.tema} nome={nomeNaCapa} pagina={2} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 2.4rem)' }}>Agora, o nome</h1>
            <p className="letra-miuda">
              {produto.emoji} {produto.nome} · {TEMAS[r.tema].emoji} {TEMAS[r.tema].nome}
            </p>
            <div className="campo campo-nome">
              <label htmlFor="nome">Nome da criança</label>
              <input
                id="nome"
                value={r.nome}
                maxLength={LIMITE_DO_NOME + 6}
                placeholder="Ex.: Laura"
                autoComplete="off"
                autoCapitalize="words"
                onChange={(e) => muda('nome', e.target.value)}
                aria-invalid={Boolean(erros.nome || (problema && problema !== 'vazio'))}
                aria-describedby="nome-ajuda"
              />
              <span className="contador">
                {[...nome].length}/{LIMITE_DO_NOME}
              </span>
              {erros.nome || (problema && problema !== 'vazio') ? (
                <span className="erro" id="nome-ajuda" role="status">
                  {erros.nome ?? MENSAGEM_DO_PROBLEMA[problema!]}
                </span>
              ) : (
                <span className="ajuda" id="nome-ajuda">
                  Só o primeiro nome ou apelido. A gente ajeita as maiúsculas.
                </span>
              )}
            </div>
            <div className="campo">
              <label htmlFor="idade">Idade que vai fazer</label>
              <select id="idade" value={r.idade} onChange={(e) => muda('idade', Number(e.target.value))}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'ano' : 'anos'}
                  </option>
                ))}
              </select>
            </div>
            {produto.temDedicatoria && !comDedicatoria && (
              <button type="button" className="adicionar" onClick={() => setAbriuDedicatoria(true)}>
                + Adicionar dedicatória <span className="letra-miuda">(opcional)</span>
              </button>
            )}
            {produto.temDedicatoria && comDedicatoria && (
              <div className="campo">
                <label htmlFor="dedicatoria">
                  Dedicatória <span className="letra-miuda">(opcional)</span>
                </label>
                <textarea
                  id="dedicatoria"
                  value={r.dedicatoria}
                  maxLength={LIMITE_DA_DEDICATORIA + 20}
                  onChange={(e) => muda('dedicatoria', e.target.value)}
                  placeholder="Escreva com carinho…"
                  aria-describedby="dedicatoria-ajuda"
                />
                <span className="contador">
                  {[...r.dedicatoria.trim()].length}/{LIMITE_DA_DEDICATORIA}
                </span>
                {erros.dedicatoria && (
                  <span className="erro" id="dedicatoria-ajuda">
                    {erros.dedicatoria}
                  </span>
                )}
                <div className="sugestoes">
                  <span className="ajuda">Ou toque numa sugestão:</span>
                  {DEDICATORIAS_PRONTAS.map((d) => (
                    <button key={d} type="button" onClick={() => muda('dedicatoria', d)}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {etapa === 3 && temPersonagem && (
        <EtapaPersonagem
          personagem={r.personagem}
          onMudar={(p) => muda('personagem', p)}
          nome={nomeNaCapa}
          fotoLigada={fotoLigada}
          erro={erros.personagem}
          parte={parte}
          onParte={mudarParte}
        />
      )}

      {etapa === 4 && temPersonagem && (
        <EtapaFicha
          personagem={personagemDoPedido}
          idade={r.idade}
          nome={nomeNaCapa}
          conta={conta}
          carregandoConta={carregandoConta}
          google={google}
          fichaId={r.fichaDoDesenho === chaveDoDesenho(r.personagem, r.idade) ? r.fichaId : null}
          aprovada={fichaEmDia}
          onNova={(id) => setR((atual) => ({ ...atual, fichaId: id, fichaDoDesenho: chaveDoDesenho(atual.personagem, atual.idade), fichaAprovada: false }))}
          onAprovada={() => {
            setR((atual) => ({ ...atual, fichaAprovada: true }));
            irPara(depoisDaFicha);
          }}
          onAjustar={() => irPara(3)}
          sobMedida={sobMedida}
          onEscolher={(d) =>
            setR((atual) => {
              // o superpoder não muda o desenho: fica o que a família escolheu agora
              const personagem = { ...d.personagem, superpoder: atual.personagem.superpoder };
              return { ...atual, personagem, fichaId: d.id, fichaDoDesenho: chaveDoDesenho(personagem, atual.idade), fichaAprovada: false };
            })
          }
        />
      )}

      {etapa === 7 && sobMedida && (
        <EtapaHistoria
          nome={nomeNaCapa}
          idade={r.idade}
          superpoder={r.personagem.superpoder}
          briefing={r.briefing}
          onBriefing={(b) => setR((atual) => ({ ...atual, briefing: b }))}
          historiaId={r.historiaId && r.historiaSuperpoder === r.personagem.superpoder && r.historiaIdade === r.idade ? r.historiaId : null}
          aprovada={historiaEmDia}
          onNova={(id) => setR((atual) => ({ ...atual, historiaId: id, historiaAprovada: false, historiaSuperpoder: atual.personagem.superpoder, historiaIdade: atual.idade }))}
          onAprovada={(titulo) => {
            setR((atual) => ({ ...atual, historiaAprovada: true, historiaTitulo: titulo }));
            irPara(5);
          }}
          conta={conta}
          carregandoConta={carregandoConta}
          google={google}
        />
      )}

      {etapa === 5 && r.produto && r.tema && produto && (
        <section className="criar-grade">
          <div className="cartao resumo-pedido">
            {temPersonagem && fichaEmDia && r.fichaId && (
              // o momento de maior desejo fica junto do botão de pagar (revisão de CRO, 25/10/2026)
              <figure className="resumo-personagem">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/ficha/${r.fichaId}/previa`} alt={`O personagem de ${nome} que você aprovou`} className="ficha-previa" />
                <figcaption>
                  <strong>Personagem aprovado por você</strong>
                  <span className="letra-miuda">
                    {nome}, {r.idade} {r.idade === 1 ? 'ano' : 'anos'} · Superpoder: {SUPERPODERES.find((s) => s.id === r.personagem.superpoder)?.rotulo}
                  </span>
                </figcaption>
              </figure>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 16, alignItems: 'center' }}>
              <CapaLivrinho id="resumo-capa" tema={r.tema} produto={livroComHistoria ? 'presente' : 'lembrancinha'} nome={nome} idade={r.idade} corte={0.7} />
              <div>
                <strong>
                  {produto.emoji} {produto.nome}
                </strong>
                <div className="letra-miuda">
                  {sobMedida && r.historiaTitulo ? `“${r.historiaTitulo}”, história aprovada por você` : TEMAS[r.tema].nome} · {nome}, {r.idade} {r.idade === 1 ? 'ano' : 'anos'}
                </div>
                <div className="letra-miuda">Arquivo para imprimir, por e-mail e WhatsApp</div>
                <div className="resumo-preco">
                  {emReais(total)} <span className="letra-miuda">{r.pagamento === 'pix' ? 'no Pix' : 'no cartão'}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            {carregandoConta ? (
              <div style={{ minHeight: 240 }} />
            ) : !conta ? (
              <>
                <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 2.4rem)' }}>Falta pouco: sua conta</h1>
                <p className="letra-miuda">
                  É nela que você baixa o livrinho, vê os pedidos e apaga os dados quando quiser. O livrinho que você montou fica guardado.
                </p>
                <FormularioDeConta destino={DESTINO_DEPOIS_DE_ENTRAR} google={google} />
              </>
            ) : (
            <>
            <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 2.4rem)' }}>Para onde mandamos?</h1>
            <p className="letra-miuda conta-atual">
              Comprando como <strong>{conta.email}</strong>.{' '}
              <button type="button" className="link-botao" onClick={() => void supabaseNoNavegador().auth.signOut()}>
                Trocar de conta
              </button>
            </p>
            {falha && (
              <div className="aviso-erro" role="alert">
                {falha}
                {whatsappAjuda && (
                  <>
                    {' '}
                    <a href={whatsappAjuda} target="_blank" rel="noopener noreferrer">
                      Chame a gente no WhatsApp.
                    </a>
                  </>
                )}
              </div>
            )}
            <div className="campo">
              <label htmlFor="responsavel">Seu nome</label>
              <input id="responsavel" autoComplete="name" value={r.responsavel} onChange={(e) => muda('responsavel', e.target.value)} aria-invalid={Boolean(erros.responsavel)} />
              {erros.responsavel && <span className="erro">{erros.responsavel}</span>}
            </div>
            <div className="campo">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input
                id="whatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(11) 91234-5678"
                value={r.whatsapp}
                onChange={(e) => muda('whatsapp', e.target.value)}
                aria-invalid={Boolean(erros.whatsapp)}
              />
              {erros.whatsapp && <span className="erro">{erros.whatsapp}</span>}
            </div>
            {/* armadilha para robôs: gente de verdade não vê nem preenche */}
            <input id="site" name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1 }} />

            <div className="campo">
              <span className="rotulo" id="rotulo-pagamento">Como quer pagar?</span>
              <div className="pagamentos" role="group" aria-labelledby="rotulo-pagamento">
                <button type="button" className="pagamento" aria-pressed={r.pagamento === 'pix'} onClick={() => muda('pagamento', 'pix')}>
                  <strong>Pix</strong>
                  <div className="letra-miuda">{Math.round(DESCONTO_PIX * 100)}% de desconto</div>
                </button>
                <button type="button" className="pagamento" aria-pressed={r.pagamento === 'cartao'} onClick={() => muda('pagamento', 'cartao')}>
                  <strong>Cartão</strong>
                  <div className="letra-miuda">crédito</div>
                </button>
              </div>
            </div>

            <div className="campo">
              <label htmlFor="data">
                Data da festa <span className="letra-miuda">(opcional)</span>
              </label>
              <input id="data" type="date" value={r.dataDaFesta} onChange={(e) => muda('dataDaFesta', e.target.value)} />
              <span className="ajuda">Para te lembrar do livrinho do ano que vem.</span>
            </div>
            {r.dataDaFesta && (
              <label className="marcar">
                <input type="checkbox" checked={r.aceitaLembrete} onChange={(e) => muda('aceitaLembrete', e.target.checked)} />
                <span>Quero um lembrete perto do próximo aniversário {nome ? `de ${nome}` : 'da criança'}.</span>
              </label>
            )}
            <label className="marcar">
              <input type="checkbox" checked={r.aceitaNovidades} onChange={(e) => muda('aceitaNovidades', e.target.checked)} />
              <span>Quero receber ideias de festa e cupons.</span>
            </label>

            <ul className="selos">
              <li>
                <span className="linha-icone tom-verde">
                  <Icone nome="certo" />
                </span>
                Revisamos cada arquivo antes do envio
              </li>
              <li>
                <span className="linha-icone tom-rosa">
                  <Icone nome="coracao" />
                </span>
                Garantia: se não gostar, devolvemos o dinheiro
              </li>
            </ul>
            <div className="resumo">
              <span>Total</span>
              <span>
                {r.pagamento === 'pix' && <span className="preco-de letra-miuda" style={{ textDecoration: 'line-through', marginRight: 8 }}>{emReais(produto.preco)}</span>}
                <span className="total">{emReais(total)}</span>
              </span>
            </div>
            <p className="letra-miuda">
              Ao continuar, você concorda com os <a href="/termos" target="_blank">termos</a> e a{' '}
              <a href="/privacidade" target="_blank">política de privacidade</a>. Guardamos só o primeiro nome, a idade e o personagem da criança{temPersonagem && r.personagem.jeito === 'foto' ? '; a foto é apagada em 7 dias' : ''}.
            </p>
            </>
            )}
          </div>
        </section>
      )}

      {acaoDaBarra && produto && (
        <div className="barra-fixa">
          <div className="miolo">
            <div>
              <div className="letra-miuda">{produto.nome}</div>
              {/* o valor da barra já tem o desconto do Pix: dizer, para não parecer erro (revisão de CRO) */}
              <strong style={{ fontFamily: 'var(--fonte-titulo)', fontSize: '1.4rem' }}>{emReais(total)}</strong>{' '}
              <span className="letra-miuda">{r.pagamento === 'pix' ? 'no Pix' : 'no cartão'}</span>
            </div>
            {acaoDaBarra}
          </div>
        </div>
      )}
    </div>
  );
}
