'use client';

// O fluxo do pedido (seção 4.2, passos 3 a 7): produto, tema, personalização
// com prévia ao vivo, o personagem (só nos temas com história para ele) e, por
// fim, os dados de contato e a forma de pagamento.
// Sem conta e sem cadastro. O preço mostrado aqui é só vitrine: a rota recalcula.

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CapaLivrinho } from '@/components/CapaLivrinho';
import { FormularioDeConta, useConta } from '@/components/FormularioDeConta';
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
import { ehTema, LISTA_DE_TEMAS, TEMAS, type TemaId } from '@/lib/temas';
import { EtapaFicha } from './EtapaFicha';
import { EtapaPersonagem } from './EtapaPersonagem';

/** 0 produto, 1 tema, 2 nome, 3 personagem e 4 desenho do personagem (só se o tema tem), 5 contato e pagamento */
type Etapa = 0 | 1 | 2 | 3 | 4 | 5;
const GUARDADO = 'livrinho:rascunho';
/** volta do Google e do link por e-mail: cai direto no pagamento, com o rascunho guardado */
export const DESTINO_DEPOIS_DE_ENTRAR = '/criar?etapa=pagar';
/** a conta agora costuma nascer antes do desenho do personagem */
export const DESTINO_DEPOIS_DE_ENTRAR_NA_FICHA = '/criar?etapa=ficha';

type Rascunho = {
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
};

const VAZIO: Rascunho = {
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
};

function primeiraEtapaQueFalta(r: Rascunho): Etapa {
  if (!r.produto) return 0;
  if (!r.tema) return 1;
  return 2;
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
    const nome = busca.get('nome');
    const idade = Number(busca.get('idade'));
    const inicial: Rascunho = {
      ...base,
      produto: ehProduto(produto) ? produto : base.produto,
      tema: ehTema(tema) ? tema : base.tema,
      nome: nome ? arrumarNome(nome).slice(0, LIMITE_DO_NOME + 6) : base.nome,
      idade: Number.isInteger(idade) && idade >= 1 && idade <= 10 ? idade : base.idade,
    };
    setR(inicial);
    const falta = primeiraEtapaQueFalta(inicial);
    const completo = falta === 2 && !problemaDoNome(inicial.nome);
    const comPersonagem = Boolean(inicial.tema && TEMAS[inicial.tema].comPersonagem);
    const fichaEmDia = inicial.fichaAprovada && inicial.fichaDoDesenho === chaveDoDesenho(inicial.personagem, inicial.idade);
    const pediu = busca.get('etapa');
    if (completo && pediu === 'ficha' && comPersonagem) setEtapa(4);
    else if (completo && pediu === 'pagar') setEtapa(comPersonagem && !fichaEmDia ? 4 : 5);
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
  const ordem: Etapa[] = temPersonagem ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 5];
  // a ficha aprovada só vale para o desenho de agora: mudou cabelo ou idade, desenha de novo
  const fichaEmDia = r.fichaAprovada && r.fichaDoDesenho === chaveDoDesenho(r.personagem, r.idade);
  const posicao = Math.max(0, ordem.indexOf(etapa));

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

  function validarPersonagem() {
    const lido = lerPersonagem(personagemDoPedido);
    if (!lido.ok) {
      setErros((e) => ({ ...e, personagem: lido.erro }));
      return;
    }
    irPara(fichaEmDia ? 5 : 4);
  }

  async function enviar() {
    if (!conta) return;
    if (temPersonagem && !fichaEmDia) {
      irPara(4);
      return;
    }
    const resultado = lerPedido({ ...r, email: conta.email, personagem: personagemDoPedido });
    if (!resultado.ok) {
      setErros(resultado.erros);
      if (resultado.erros.nome || resultado.erros.dedicatoria) irPara(2);
      else if (resultado.erros.personagem) irPara(r.fichaId ? 4 : 3);
      return;
    }
    setEnviando(true);
    setFalha(null);
    try {
      const resposta = await fetch('/api/pedido', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...r, email: conta.email, personagem: personagemDoPedido, fichaId: temPersonagem ? r.fichaId : null, origem: lerOrigem(), site: (document.getElementById('site') as HTMLInputElement | null)?.value ?? '' }),
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
  const whatsappAjuda = linkDoWhatsapp('Oi! Estou tentando fazer o pedido do livrinho e não consegui.');

  return (
    <div ref={topo} style={{ scrollMarginTop: 90 }}>
      <ol className="etapas" aria-label={`Etapa ${posicao + 1} de ${ordem.length}`}>
        {ordem.map((e, i) => (
          <li key={e} className={i < posicao ? 'feita' : i === posicao ? 'atual' : ''} />
        ))}
      </ol>
      {etapa > 0 && (
        <button type="button" className="voltar" onClick={() => irPara(ordem[posicao - 1] ?? 0)}>
          ← Voltar
        </button>
      )}

      {etapa === 0 && (
        <section>
          <h1 style={{ fontSize: 'clamp(1.9rem, 6vw, 2.6rem)' }}>O que você quer criar?</h1>
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
          <h1 style={{ fontSize: 'clamp(1.9rem, 6vw, 2.6rem)' }}>Escolha o tema</h1>
          <p className="letra-miuda">Todos os temas são para meninos e meninas, de 2 a 8 anos.</p>
          <div className="escolhas">
            {LISTA_DE_TEMAS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="cartao escolha"
                aria-pressed={r.tema === t.id}
                onClick={() => {
                  muda('tema', t.id);
                  registrar('tema_escolhido', { tema: t.id });
                  irPara(2);
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8, alignItems: 'end' }}>
                  <CapaLivrinho id={`escolha-${t.id}`} tema={t.id} produto={r.produto === 'presente' ? 'presente' : 'lembrancinha'} nome={nomeNaCapa} idade={r.idade} />
                  <PaginaAmostra tema={t.id} nome={nomeNaCapa} pagina={1} />
                </div>
                <strong style={{ fontSize: '1.2rem', marginTop: 8 }}>
                  {t.emoji} {t.nome}
                </strong>
                <span className="letra-miuda">{t.descricao}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {etapa === 2 && r.produto && r.tema && produto && (
        <section className="criar-grade">
          <div className="criar-capas" aria-live="polite">
            <CapaLivrinho
              id="criar-capa"
              tema={r.tema}
              produto={r.produto === 'presente' ? 'presente' : 'lembrancinha'}
              nome={nomeNaCapa}
              idade={r.idade}
              corte={nome ? 0.6 : 0.25}
            />
            {r.produto === 'combo' ? (
              <CapaLivrinho id="criar-capa-2" tema={r.tema} produto="presente" nome={nomeNaCapa} idade={r.idade} corte={nome ? 0.6 : 0.25} />
            ) : (
              <PaginaAmostra tema={r.tema} nome={nomeNaCapa} pagina={1} historia={r.produto === 'presente'} />
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
            <div className="campo">
              <label htmlFor="data">
                Data da festa <span className="letra-miuda">(opcional)</span>
              </label>
              <input id="data" type="date" value={r.dataDaFesta} onChange={(e) => muda('dataDaFesta', e.target.value)} />
              <span className="ajuda">Para te lembrar do livrinho do ano que vem.</span>
            </div>
            {produto.temDedicatoria && (
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
            <div className="selos">
              <div>✅ Revisamos cada arquivo antes do envio</div>
              <div>💛 Garantia: se não gostar, devolvemos o dinheiro</div>
            </div>
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
            irPara(5);
          }}
          onAjustar={() => irPara(3)}
          onEscolher={(d) =>
            setR((atual) => {
              // o superpoder não muda o desenho: fica o que a família escolheu agora
              const personagem = { ...d.personagem, superpoder: atual.personagem.superpoder };
              return { ...atual, personagem, fichaId: d.id, fichaDoDesenho: chaveDoDesenho(personagem, atual.idade), fichaAprovada: false };
            })
          }
        />
      )}

      {etapa === 5 && r.produto && r.tema && produto && (
        <section className="criar-grade">
          <div className="cartao" style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 16, alignItems: 'center' }}>
            <CapaLivrinho id="resumo-capa" tema={r.tema} produto={r.produto === 'presente' ? 'presente' : 'lembrancinha'} nome={nome} idade={r.idade} corte={0.7} />
            <div>
              <strong>
                {produto.emoji} {produto.nome}
              </strong>
              <div className="letra-miuda">
                {TEMAS[r.tema].nome} · {nome}, {r.idade} {r.idade === 1 ? 'ano' : 'anos'}
              </div>
              {temPersonagem && (
                <div className="letra-miuda">
                  Personagem {r.personagem.jeito === 'foto' ? 'pela foto' : 'pelas características'} · Superpoder:{' '}
                  {SUPERPODERES.find((s) => s.id === r.personagem.superpoder)?.rotulo}
                </div>
              )}
              <div className="letra-miuda">Arquivo para imprimir, por e-mail e WhatsApp</div>
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

      {etapa >= 2 && produto && (
        <div className="barra-fixa">
          <div className="miolo">
            <div>
              <div className="letra-miuda">{produto.nome}</div>
              <strong style={{ fontFamily: 'var(--fonte-titulo)', fontSize: '1.4rem' }}>{emReais(total)}</strong>
            </div>
            {etapa === 2 ? (
              <button type="button" className="botao" onClick={() => validarPersonalizacao() && irPara(temPersonagem ? 3 : 5)}>
                Continuar
              </button>
            ) : etapa === 4 ? null : etapa === 3 ? (
              <button type="button" className="botao" onClick={validarPersonagem}>
                Continuar
              </button>
            ) : !conta ? null : (
              <button type="button" className="botao" disabled={enviando} onClick={enviar}>
                {enviando ? 'Enviando…' : r.pagamento === 'pix' ? 'Pagar com Pix' : 'Pagar com cartão'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
