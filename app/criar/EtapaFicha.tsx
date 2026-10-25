'use client';

// "Conheça o personagem": antes de pagar, a família vê só a ficha do
// personagem (decisão do dono, 25/10/2026), nunca as páginas do livro, e em
// prévia pequena com marca d'água. Precisa de conta, e são até 3 desenhos
// por dia: o primeiro e 2 ajustes.

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FormularioDeConta, type ContaNoNavegador } from '@/components/FormularioDeConta';
import { desenhosParaEscolher, LIMITE_DE_FICHAS, MINUTOS_PARA_DESISTIR, type DesenhoFeito } from '@/lib/ficha';
import type { Personagem } from '@/lib/personagem';

type Situacao = 'parada' | 'pedindo' | 'gerando' | 'pronta' | 'falhou';

export function EtapaFicha({
  personagem,
  idade,
  nome,
  conta,
  carregandoConta,
  google,
  fichaId,
  aprovada,
  onNova,
  onAprovada,
  onAjustar,
  onEscolher,
}: {
  personagem: Personagem;
  idade: number;
  nome: string;
  conta: ContaNoNavegador | null;
  carregandoConta: boolean;
  google: boolean;
  /** a ficha do desenho atual, ou null se ainda não há (ou se o personagem mudou) */
  fichaId: string | null;
  aprovada: boolean;
  onNova: (id: string) => void;
  onAprovada: () => void;
  onAjustar: () => void;
  /** voltar a um desenho que a família já viu: o personagem passa a ser o dele */
  onEscolher: (desenho: DesenhoFeito) => void;
}) {
  const [situacao, setSituacao] = useState<Situacao>(fichaId ? 'gerando' : 'parada');
  const [restantes, setRestantes] = useState<number | null>(null);
  const [desenhos, setDesenhos] = useState<DesenhoFeito[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const [aprovando, setAprovando] = useState(false);
  const inicio = useRef(Date.now());
  const quem = nome || 'a criança';

  // quantos desenhos ainda dá para pedir hoje
  useEffect(() => {
    if (!conta) return;
    fetch('/api/ficha')
      .then((r) => r.json())
      .then((d: { restantes?: number | null; desenhos?: DesenhoFeito[] }) => {
        setRestantes(typeof d.restantes === 'number' ? d.restantes : null);
        setDesenhos(Array.isArray(d.desenhos) ? d.desenhos : []);
      })
      .catch(() => undefined);
  }, [conta, situacao]);

  // a ficha guardada no rascunho: confere em que pé está
  const conferir = useCallback(async (id: string) => {
    const r = await fetch(`/api/ficha/${id}`).catch(() => null);
    if (!r) return;
    if (r.status === 404 || r.status === 401) {
      setSituacao('parada');
      return;
    }
    const d = (await r.json()) as { status: 'gerando' | 'pronta' | 'falhou' };
    setSituacao(d.status);
  }, []);

  useEffect(() => {
    if (!fichaId || !conta) {
      setSituacao('parada');
      return;
    }
    inicio.current = Date.now();
    void conferir(fichaId);
  }, [fichaId, conta, conferir]);

  // enquanto desenha, pergunta a cada 3 segundos
  useEffect(() => {
    if (situacao !== 'gerando' || !fichaId) return;
    const relogio = setInterval(() => {
      if (Date.now() - inicio.current > MINUTOS_PARA_DESISTIR * 60 * 1000) setSituacao('falhou');
      else void conferir(fichaId);
    }, 3000);
    return () => clearInterval(relogio);
  }, [situacao, fichaId, conferir]);

  async function desenhar() {
    setAviso(null);
    setSituacao('pedindo');
    try {
      const r = await fetch('/api/ficha', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ personagem, idade }),
      });
      const d = (await r.json().catch(() => ({}))) as { id?: string; restantes?: number; mensagem?: string };
      if (!r.ok || !d.id) {
        setAviso(d.mensagem ?? 'Não conseguimos começar o desenho agora.');
        if (typeof d.restantes === 'number') setRestantes(d.restantes);
        setSituacao('parada');
        return;
      }
      if (typeof d.restantes === 'number') setRestantes(d.restantes);
      inicio.current = Date.now();
      onNova(d.id);
      setSituacao('gerando');
    } catch {
      setAviso('Sem conexão agora. Confira a internet e tente de novo.');
      setSituacao('parada');
    }
  }

  async function aprovar() {
    if (!fichaId) return;
    setAprovando(true);
    const r = await fetch(`/api/ficha/${fichaId}/aprovar`, { method: 'POST' }).catch(() => null);
    setAprovando(false);
    if (r?.ok) onAprovada();
    else setAviso('Não conseguimos registrar a aprovação. Tente de novo.');
  }

  const outros = situacao === 'gerando' || situacao === 'pedindo' ? [] : desenhosParaEscolher(desenhos, idade, fichaId);

  const titulo = (
    <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 2.4rem)' }}>
      {situacao === 'pronta' && conta ? `Olha ${nome || 'o personagem'}!` : `Conheça ${nome || 'o personagem'}`}
    </h1>
  );

  if (carregandoConta) return <div style={{ minHeight: '50vh' }} />;

  if (!conta) {
    return (
      <section className="ficha-etapa">
        {titulo}
        <p className="letra-miuda">
          Agora a gente desenha {quem} no traço da turma Little Paws para você aprovar antes de pagar. Para isso, entre ou crie sua conta: é
          nela que o personagem fica guardado.
        </p>
        <FormularioDeConta destino="/criar?etapa=ficha" google={google} />
      </section>
    );
  }

  return (
    <section className="ficha-etapa">
      {titulo}
      {aviso && (
        <div className="aviso-erro" role="alert">
          {aviso}
        </div>
      )}

      {(situacao === 'parada' || situacao === 'pedindo') && (
        <div className="ficha-caixa">
          <Image src="/marca/rabisco-desenhando.webp" alt="" width={302} height={368} className="ficha-rabisco" />
          <p>Com as suas escolhas, desenhamos {quem} para você ver antes de pagar.</p>
          <button type="button" className="botao" disabled={situacao === 'pedindo' || restantes === 0} onClick={desenhar}>
            {situacao === 'pedindo' ? 'Começando…' : `Desenhar ${nome || 'o personagem'}`}
          </button>
          {restantes !== null && (
            <span className="letra-miuda">
              {restantes > 0
                ? `Você pode desenhar ${restantes === 1 ? 'mais 1 vez' : `${restantes} vezes`} hoje.`
                : `Você já usou os ${LIMITE_DE_FICHAS} desenhos de hoje. Volte amanhã ou chame a gente no WhatsApp.`}
            </span>
          )}
          <button type="button" className="link-botao" onClick={onAjustar}>
            Voltar e mudar as escolhas
          </button>
        </div>
      )}

      {situacao === 'gerando' && (
        <div className="ficha-caixa" role="status" aria-live="polite">
          <Image src="/marca/rabisco-desenhando.webp" alt="" width={302} height={368} className="ficha-rabisco ficha-desenhando" />
          <p>
            <strong>Desenhando {quem}…</strong>
          </p>
          <p className="letra-miuda">Leva cerca de 1 minuto. Pode ficar nesta tela.</p>
        </div>
      )}

      {situacao === 'pronta' && fichaId && (
        <div className="ficha-pronta">
          <p className="ficha-revelacao">É assim que {quem} vai aparecer na história, junto com a turma Little Paws.</p>
          {/* a revelação ganha festa, uma vez só e sem movimento para quem pediu menos movimento (revisão de CRO) */}
          <div className="ficha-palco">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/ficha/${fichaId}/previa`} alt={`Prévia do personagem de ${quem}`} className="ficha-previa" />
            <Image src="/marca/estrela-giz.webp" alt="" width={64} height={69} className="ficha-enfeite ficha-enfeite-1" />
            <Image src="/marca/coracao-giz.webp" alt="" width={56} height={66} className="ficha-enfeite ficha-enfeite-2" />
            <Image src="/marca/estrela-giz.webp" alt="" width={44} height={47} className="ficha-enfeite ficha-enfeite-3" />
          </div>
          <p className="letra-miuda">
            Esta é uma prévia, pequena e com marca d&apos;água. No livro, o desenho vem limpo, em todas as páginas.
          </p>
          <div className="ficha-botoes">
            <button type="button" className="botao" disabled={aprovando} onClick={aprovar}>
              {aprovado(aprovada, aprovando)}
            </button>
            {restantes !== 0 ? (
              <button type="button" className="botao botao-secundario" onClick={onAjustar}>
                Quero ajustar{restantes !== null ? ` (${restantes === 1 ? 'resta 1' : `restam ${restantes}`})` : ''}
              </button>
            ) : (
              <span className="letra-miuda">Você já usou os {LIMITE_DE_FICHAS} desenhos de hoje.</span>
            )}
          </div>
        </div>
      )}

      {situacao === 'falhou' && (
        <div className="ficha-caixa">
          <p>
            <strong>Não deu certo desta vez.</strong> Isso não conta como tentativa.
          </p>
          <button type="button" className="botao" onClick={desenhar}>
            Tentar de novo
          </button>
          <button type="button" className="link-botao" onClick={onAjustar}>
            Voltar e mudar as escolhas
          </button>
        </div>
      )}

      {outros.length > 0 && (
        <div className="ficha-feitos">
          <h2>Desenhos que você já fez</h2>
          <p className="letra-miuda">Gostou mais de um destes? Escolha e ele volta a ser o personagem de {quem}.</p>
          <ul>
            {outros.map((d) => (
              <li key={d.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/ficha/${d.id}/previa`} alt="Prévia de um desenho anterior" className="ficha-miniatura" loading="lazy" />
                <button type="button" className="botao botao-secundario botao-pequeno" onClick={() => onEscolher(d)}>
                  Usar este
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function aprovado(jaAprovada: boolean, aprovando: boolean): string {
  if (aprovando) return 'Um instante…';
  return jaAprovada ? 'Continuar com este' : 'Amei, quero o livrinho';
}
