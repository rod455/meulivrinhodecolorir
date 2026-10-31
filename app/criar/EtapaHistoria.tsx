'use client';

// A história sob medida (pedido do dono, 31/10/2026): a família conta o lugar,
// a lição e do que a criança gosta; a IA escreve a história no jeito da turma
// Little Paws (16 páginas, o superpoder na 13) e cria os amigos dela. A família
// lê o texto inteiro e aprova antes de pagar, com até 2 ajustes.
// O nome nunca vai para a IA: o servidor troca por {NOME}, e quem põe o nome
// de volta é esta tela.

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FormularioDeConta, type ContaNoNavegador } from '@/components/FormularioDeConta';
import {
  AJUSTES_POR_HISTORIA,
  comNomeNaHistoria,
  LICOES,
  LIMITE_DE_HISTORIAS,
  LIMITES,
  LUGARES,
  MINUTOS_PARA_DESISTIR_DA_HISTORIA,
  MOMENTOS,
  PAGINA_DO_SUPERPODER,
  type Briefing,
  type TextoDaHistoria,
} from '@/lib/historia';
import { SUPERPODERES, type SuperpoderId } from '@/lib/personagem';

type Situacao = 'briefing' | 'pedindo' | 'escrevendo' | 'pronta' | 'falhou';
type Estado = { status: 'escrevendo' | 'pronta' | 'falhou'; texto: TextoDaHistoria | null; ajustesRestantes: number; aprovada: boolean; usada: boolean; falhouOAjuste: boolean };

export const DESTINO_DEPOIS_DE_ENTRAR_NA_HISTORIA = '/criar?etapa=historia';

export function EtapaHistoria({
  nome,
  idade,
  superpoder,
  briefing,
  onBriefing,
  historiaId,
  aprovada,
  onNova,
  onAprovada,
  conta,
  carregandoConta,
  google,
}: {
  nome: string;
  idade: number;
  superpoder: SuperpoderId;
  briefing: Briefing;
  onBriefing: (b: Briefing) => void;
  /** a história do rascunho, ou null se ainda não há */
  historiaId: string | null;
  aprovada: boolean;
  onNova: (id: string) => void;
  onAprovada: (titulo: string) => void;
  conta: ContaNoNavegador | null;
  carregandoConta: boolean;
  google: boolean;
}) {
  const [situacao, setSituacao] = useState<Situacao>(historiaId ? 'escrevendo' : 'briefing');
  const [estado, setEstado] = useState<Estado | null>(null);
  const [restantes, setRestantes] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [aprovando, setAprovando] = useState(false);
  const [ajustando, setAjustando] = useState(false);
  const [pedidoDeAjuste, setPedidoDeAjuste] = useState('');
  const inicio = useRef(Date.now());
  const quem = nome || 'a criança';
  const muda = <K extends keyof Briefing>(campo: K, valor: Briefing[K]) => onBriefing({ ...briefing, [campo]: valor });

  useEffect(() => {
    if (!conta) return;
    fetch('/api/historia')
      .then((r) => r.json())
      .then((d: { restantes?: number | null }) => setRestantes(typeof d.restantes === 'number' ? d.restantes : null))
      .catch(() => undefined);
  }, [conta, situacao]);

  const conferir = useCallback(async (id: string) => {
    const r = await fetch(`/api/historia/${id}`).catch(() => null);
    if (!r) return;
    if (r.status === 404 || r.status === 401) {
      setSituacao('briefing');
      return;
    }
    const d = (await r.json()) as Estado;
    setEstado(d);
    // a história que já virou pedido não volta: começa outra
    if (d.usada) setSituacao('briefing');
    else setSituacao(d.status);
  }, []);

  useEffect(() => {
    if (!historiaId || !conta) {
      setSituacao('briefing');
      return;
    }
    inicio.current = Date.now();
    void conferir(historiaId);
  }, [historiaId, conta, conferir]);

  useEffect(() => {
    if (situacao !== 'escrevendo' || !historiaId) return;
    const relogio = setInterval(() => {
      if (Date.now() - inicio.current > MINUTOS_PARA_DESISTIR_DA_HISTORIA * 60 * 1000) void conferir(historiaId).then(() => setSituacao((s) => (s === 'escrevendo' ? 'falhou' : s)));
      else void conferir(historiaId);
    }, 3000);
    return () => clearInterval(relogio);
  }, [situacao, historiaId, conferir]);

  async function escrever() {
    setAviso(null);
    if ([...briefing.gosta.trim()].length < 3) {
      setAviso(`Conte do que ${quem} mais gosta.`);
      return;
    }
    setSituacao('pedindo');
    try {
      const r = await fetch('/api/historia', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nome, idade, superpoder, briefing }),
      });
      const d = (await r.json().catch(() => ({}))) as { id?: string; restantes?: number; mensagem?: string };
      if (!r.ok || !d.id) {
        setAviso(d.mensagem ?? 'Não conseguimos começar a história agora.');
        if (typeof d.restantes === 'number') setRestantes(d.restantes);
        setSituacao('briefing');
        return;
      }
      if (typeof d.restantes === 'number') setRestantes(d.restantes);
      inicio.current = Date.now();
      setEstado(null);
      onNova(d.id);
      setSituacao('escrevendo');
    } catch {
      setAviso('Sem conexão agora. Confira a internet e tente de novo.');
      setSituacao('briefing');
    }
  }

  async function aprovar() {
    if (!historiaId) return;
    setAprovando(true);
    const r = await fetch(`/api/historia/${historiaId}/aprovar`, { method: 'POST' }).catch(() => null);
    setAprovando(false);
    if (r?.ok) onAprovada(estado?.texto ? comNomeNaHistoria(estado.texto.titulo, quem) : '');
    else setAviso('Não conseguimos registrar a aprovação. Tente de novo.');
  }

  async function ajustar() {
    if (!historiaId) return;
    setAviso(null);
    if ([...pedidoDeAjuste.trim()].length < 5) {
      setAviso('Conte o que você quer mudar.');
      return;
    }
    const r = await fetch(`/api/historia/${historiaId}/ajustar`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pedido: pedidoDeAjuste, nome }),
    }).catch(() => null);
    const d = (await r?.json().catch(() => ({}))) as { mensagem?: string } | undefined;
    if (!r?.ok) {
      setAviso(d?.mensagem ?? 'Não conseguimos pedir o ajuste agora.');
      return;
    }
    setAjustando(false);
    setPedidoDeAjuste('');
    inicio.current = Date.now();
    // um ajuste invalida a aprovação: o texto vai mudar
    onNova(historiaId);
    setSituacao('escrevendo');
  }

  const poder = SUPERPODERES.find((s) => s.id === superpoder)?.rotulo ?? '';
  const titulo = (
    <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 2.4rem)' }}>
      {situacao === 'pronta' && estado?.texto ? comNomeNaHistoria(estado.texto.titulo, quem) : `A história de ${quem}`}
    </h1>
  );

  if (carregandoConta) return <div style={{ minHeight: '50vh' }} />;
  if (!conta) {
    return (
      <section className="ficha-etapa">
        {titulo}
        <p className="letra-miuda">Entre ou crie sua conta: é nela que a história fica guardada enquanto você lê e aprova.</p>
        <FormularioDeConta destino={DESTINO_DEPOIS_DE_ENTRAR_NA_HISTORIA} google={google} />
      </section>
    );
  }

  return (
    <section className="ficha-etapa historia-etapa">
      {titulo}
      {aviso && (
        <div className="aviso-erro" role="alert">
          {aviso}
        </div>
      )}

      {(situacao === 'briefing' || situacao === 'pedindo') && (
        <div className="historia-briefing">
          <p className="letra-miuda">
            A gente escreve uma história só de {quem}, no jeito da turma Little Paws: 16 páginas para pintar, amigos bichinhos inventados
            só para essa história, e o superpoder <strong>{poder}</strong> na hora mais importante. Você lê tudo antes de pagar.
          </p>
          <Grupo id="rotulo-lugar" rotulo="Onde a história acontece?">
            {LUGARES.map((o) => (
              <button key={o.id} type="button" className="chip" aria-pressed={briefing.lugar === o.id} onClick={() => muda('lugar', o.id)}>
                {o.rotulo}
              </button>
            ))}
          </Grupo>
          <Grupo id="rotulo-licao" rotulo="O que a história ensina?">
            {LICOES.map((o) => (
              <button key={o.id} type="button" className="chip" aria-pressed={briefing.licao === o.id} onClick={() => muda('licao', o.id)}>
                {o.rotulo}
              </button>
            ))}
          </Grupo>
          <Grupo id="rotulo-momento" rotulo="É para um momento especial?">
            {MOMENTOS.map((o) => (
              <button key={o.id} type="button" className="chip" aria-pressed={briefing.momento === o.id} onClick={() => muda('momento', o.id)}>
                {o.rotulo}
              </button>
            ))}
          </Grupo>
          <div className="campo">
            <label htmlFor="gosta">Do que {quem} mais gosta?</label>
            <input
              id="gosta"
              value={briefing.gosta}
              maxLength={LIMITES.gosta}
              placeholder="Ex.: dinossauros, bolo de chocolate e pular na cama"
              onChange={(e) => muda('gosta', e.target.value)}
            />
          </div>
          {briefing.bichinho ? (
            <div className="campo-duplo">
              <div className="campo">
                <label htmlFor="bicho-especie">Que bichinho é?</label>
                <input
                  id="bicho-especie"
                  value={briefing.bichinho.especie}
                  maxLength={LIMITES.especie}
                  placeholder="Ex.: cachorro"
                  onChange={(e) => muda('bichinho', { especie: e.target.value, nome: briefing.bichinho?.nome ?? '' })}
                />
              </div>
              <div className="campo">
                <label htmlFor="bicho-nome">Nome do bichinho</label>
                <input
                  id="bicho-nome"
                  value={briefing.bichinho.nome}
                  maxLength={LIMITES.nomeDoBicho}
                  placeholder="Ex.: Pipoca"
                  onChange={(e) => muda('bichinho', { especie: briefing.bichinho?.especie ?? '', nome: e.target.value })}
                />
              </div>
              <button type="button" className="link-botao" onClick={() => muda('bichinho', null)}>
                Tirar o bichinho
              </button>
            </div>
          ) : (
            <button type="button" className="adicionar" onClick={() => muda('bichinho', { especie: '', nome: '' })}>
              + Tem bichinho de estimação? Ele entra na história <span className="letra-miuda">(opcional)</span>
            </button>
          )}
          <div className="campo">
            <label htmlFor="detalhe">
              Mais algum detalhe? <span className="letra-miuda">(opcional)</span>
            </label>
            <textarea
              id="detalhe"
              value={briefing.detalhe}
              maxLength={LIMITES.detalhe}
              placeholder="Ex.: tem medo do escuro, mas adora as estrelas"
              onChange={(e) => muda('detalhe', e.target.value)}
              aria-describedby="detalhe-ajuda"
            />
            <span className="ajuda" id="detalhe-ajuda">
              Para proteger {quem}, não escreva sobrenome, escola, endereço nem telefone.
            </span>
          </div>
          <button type="button" className="botao" disabled={situacao === 'pedindo' || restantes === 0} onClick={escrever}>
            {situacao === 'pedindo' ? 'Começando…' : `Escrever a história de ${quem}`}
          </button>
          {restantes !== null && (
            <span className="letra-miuda">
              {restantes > 0
                ? `Você pode pedir ${restantes === 1 ? 'mais 1 história' : `${restantes} histórias`} hoje, e cada uma aceita ${AJUSTES_POR_HISTORIA} ajustes.`
                : `Você já pediu as ${LIMITE_DE_HISTORIAS} histórias de hoje. Volte amanhã ou chame a gente no WhatsApp.`}
            </span>
          )}
        </div>
      )}

      {situacao === 'escrevendo' && (
        <div className="ficha-caixa" role="status" aria-live="polite">
          <Image src="/marca/rabisco-com-livro.webp" alt="" width={220} height={353} className="ficha-rabisco ficha-desenhando" />
          <p>
            <strong>Escrevendo a história de {quem}…</strong>
          </p>
          <p className="letra-miuda">Leva menos de 1 minuto. Pode ficar nesta tela.</p>
        </div>
      )}

      {situacao === 'pronta' && estado?.texto && (
        <div className="historia-pronta">
          {estado.falhouOAjuste && (
            <div className="aviso-erro" role="status">
              O ajuste não deu certo desta vez e não contou. Esta é a versão anterior.
            </div>
          )}
          <p className="ficha-revelacao">{estado.texto.subtitulo}</p>
          <div className="historia-amigos">
            <strong>Quem está na história</strong>
            <ul>
              <li>
                <strong>{quem}</strong>, com o superpoder {poder}
              </li>
              {estado.texto.personagens.map((p) => (
                <li key={p.nome}>
                  <strong>{p.nome}</strong>, {p.especie.toLowerCase()}: {p.jeito}
                </li>
              ))}
            </ul>
            <span className="letra-miuda">Todos desenhados no traço da turma Little Paws, prontos para pintar.</span>
          </div>
          <ol className="historia-paginas">
            {estado.texto.paginas.map((p, i) => (
              <li key={i} className={i + 1 === PAGINA_DO_SUPERPODER ? 'pagina-superpoder' : ''}>
                <span className="historia-numero" aria-hidden="true">
                  {i + 1}
                </span>
                <span>{comNomeNaHistoria(p.texto, quem)}</span>
              </li>
            ))}
          </ol>
          {ajustando ? (
            <div className="campo">
              <label htmlFor="ajuste">O que você quer mudar?</label>
              <textarea
                id="ajuste"
                value={pedidoDeAjuste}
                maxLength={LIMITES.ajuste}
                placeholder="Ex.: troque a coelha por uma tartaruga e deixe o final mais engraçado"
                onChange={(e) => setPedidoDeAjuste(e.target.value)}
              />
              <div className="ficha-botoes">
                <button type="button" className="botao" onClick={ajustar}>
                  Reescrever com o ajuste
                </button>
                <button type="button" className="link-botao" onClick={() => setAjustando(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="ficha-botoes">
              <button type="button" className="botao" disabled={aprovando} onClick={aprovar}>
                {aprovando ? 'Um instante…' : aprovada ? 'Continuar com esta' : 'Amei, aprovar a história'}
              </button>
              {estado.ajustesRestantes > 0 ? (
                <button type="button" className="botao botao-secundario" onClick={() => setAjustando(true)}>
                  Pedir um ajuste ({estado.ajustesRestantes === 1 ? 'resta 1' : `restam ${estado.ajustesRestantes}`})
                </button>
              ) : (
                <span className="letra-miuda">Esta história já teve os {AJUSTES_POR_HISTORIA} ajustes.</span>
              )}
              {restantes !== 0 && (
                <button type="button" className="link-botao" onClick={() => setSituacao('briefing')}>
                  Começar outra história
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {situacao === 'falhou' && (
        <div className="ficha-caixa">
          <p>
            <strong>Não deu certo desta vez.</strong> Isso não conta como tentativa.
          </p>
          <button type="button" className="botao" onClick={escrever}>
            Tentar de novo
          </button>
          <button type="button" className="link-botao" onClick={() => setSituacao('briefing')}>
            Mudar as escolhas
          </button>
        </div>
      )}
    </section>
  );
}

function Grupo({ id, rotulo, children }: { id: string; rotulo: string; children: React.ReactNode }) {
  return (
    <div className="campo">
      <span className="rotulo" id={id}>
        {rotulo}
      </span>
      <div className="opcoes" role="group" aria-labelledby={id}>
        {children}
      </div>
    </div>
  );
}
