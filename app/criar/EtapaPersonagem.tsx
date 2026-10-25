'use client';

// "Crie o personagem": a criança entra na história de verdade. Duas formas
// (decisão do dono, 18/10/2026): pelas características ou por uma foto, que
// só serve para desenhar a ficha e some em 7 dias. Tudo aqui vira id de
// lista; nenhum texto livre chega ao prompt de imagem.

import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  ALTURAS,
  APARENCIAS,
  CABELO_COMPRIMENTOS,
  CABELO_CORES,
  CABELO_TIPOS,
  CORES,
  DETALHES,
  OCULOS,
  PELE_DA_FOTO,
  PELES,
  PELES_COM_FOTO,
  PENTEADOS,
  PERSONAGEM_INICIAL,
  ROUPAS,
  SUPERPODERES,
  TEXTO_DO_CONSENTIMENTO,
  VERSAO_DO_CONSENTIMENTO,
  type Personagem,
} from '@/lib/personagem';

/**
 * O personagem em 3 telinhas (revisão de CRO, 25/10/2026): eram 12 grupos de
 * escolhas numa rolagem só, sem nada mudando na tela. Cada telinha é curta, e
 * a ficha no topo vai se montando com o que a família escolhe.
 */
const PARTES = [
  { id: 'quem', titulo: 'Quem é' },
  { id: 'cabelo', titulo: 'Cabelo' },
  { id: 'roupa', titulo: 'Roupa e cor' },
  { id: 'superpoder', titulo: 'Superpoder' },
] as const;
/** pela foto, o cabelo vem da foto: a telinha do cabelo some */
export const partesDoPersonagem = (jeito: Personagem['jeito']) => PARTES.filter((p) => jeito !== 'foto' || p.id !== 'cabelo');
export type ParteDoPersonagem = number;

const rotulo = (lista: readonly { id: string; rotulo: string }[], id: string) => lista.find((o) => o.id === id)?.rotulo ?? '';

type Lista = readonly { id: string; rotulo: string; cor?: string }[];

function Escolha({ titulo, lista, valor, onEscolher }: { titulo: string; lista: Lista; valor: string; onEscolher: (id: string) => void }) {
  const id = `rotulo-${titulo.toLowerCase().replace(/\W+/g, '-')}`;
  return (
    <div className="campo">
      <span className="rotulo" id={id}>
        {titulo}
      </span>
      <div className="opcoes" role="group" aria-labelledby={id}>
        {lista.map((o) => (
          <button key={o.id} type="button" className="chip" aria-pressed={valor === o.id} onClick={() => onEscolher(o.id)}>
            {o.cor && <span className="amostra-cor" style={{ background: o.cor }} aria-hidden="true" />}
            {o.rotulo}
          </button>
        ))}
      </div>
    </div>
  );
}

export function EtapaPersonagem({
  personagem,
  onMudar,
  nome,
  fotoLigada,
  erro,
  parte,
  onParte,
}: {
  personagem: Personagem;
  onMudar: (p: Personagem) => void;
  nome: string;
  fotoLigada: boolean;
  erro?: string;
  /** em que telinha do personagem estamos: rosto e cabelo, roupa e cor, superpoder */
  parte: ParteDoPersonagem;
  onParte: (parte: ParteDoPersonagem) => void;
}) {
  const [consentiu, setConsentiu] = useState(Boolean(personagem.foto));
  const [enviando, setEnviando] = useState(false);
  const [falhaDaFoto, setFalhaDaFoto] = useState<string | null>(null);
  const [miniatura, setMiniatura] = useState<string | null>(null);

  useEffect(() => () => {
    if (miniatura) URL.revokeObjectURL(miniatura);
  }, [miniatura]);

  const muda = <K extends keyof Personagem>(campo: K, valor: Personagem[K]) => onMudar({ ...personagem, [campo]: valor });
  const jeito = fotoLigada ? personagem.jeito : 'caracteristicas';
  const quem = nome || 'a criança';

  async function enviarFoto(arquivo: File) {
    setFalhaDaFoto(null);
    if (!consentiu) {
      setFalhaDaFoto('Marque a autorização antes de escolher a foto.');
      return;
    }
    if (arquivo.size > 10 * 1024 * 1024) {
      setFalhaDaFoto('A foto pode ter até 10 MB.');
      return;
    }
    setEnviando(true);
    try {
      const dados = new FormData();
      dados.append('foto', arquivo);
      dados.append('consentimento', VERSAO_DO_CONSENTIMENTO);
      const resposta = await fetch('/api/foto', { method: 'POST', body: dados });
      const corpo = (await resposta.json().catch(() => ({}))) as { caminho?: string; consentimento?: string; mensagem?: string };
      if (!resposta.ok || !corpo.caminho) {
        setFalhaDaFoto(corpo.mensagem ?? 'Não conseguimos enviar a foto. Tente de novo.');
        return;
      }
      setMiniatura(URL.createObjectURL(arquivo));
      onMudar({ ...personagem, jeito: 'foto', foto: { caminho: corpo.caminho, consentimento: VERSAO_DO_CONSENTIMENTO } });
    } catch {
      setFalhaDaFoto('Sem conexão agora. Confira a internet e tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  const raspado = personagem.cabeloTipo === 'raspado';
  const partes = partesDoPersonagem(jeito);
  const atual = partes[Math.min(parte, partes.length - 1)].id;

  const cabeloResumo =
    personagem.jeito === 'foto'
      ? 'Desenhado a partir da foto'
      : raspado
        ? `Cabelo raspado ${rotulo(CABELO_CORES, personagem.cabeloCor).toLowerCase()}`
        : `Cabelo ${rotulo(CABELO_TIPOS, personagem.cabeloTipo).toLowerCase()} ${rotulo(CABELO_CORES, personagem.cabeloCor).toLowerCase()}`;
  const resumo = [
    personagem.aparencia === 'crianca' ? 'Criança' : rotulo(APARENCIAS, personagem.aparencia),
    cabeloResumo,
    personagem.jeito === 'foto' || personagem.oculos === 'nao' ? '' : rotulo(OCULOS, personagem.oculos),
    `${rotulo(ROUPAS, personagem.roupa)} ${rotulo(CORES, personagem.cor).toLowerCase()}`,
    `Superpoder: ${rotulo(SUPERPODERES, personagem.superpoder)}`,
  ].filter(Boolean);


  return (
    <section className="personagem-etapa">
      <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 2.4rem)' }}>Crie o personagem</h1>
      <div className="ficha-viva" aria-live="polite">
        <Image src="/marca/rabisco-desenhando.webp" alt="" width={302} height={368} className="ficha-viva-rabisco" />
        <div>
          <strong>Ficha {nome ? `de ${nome}` : 'do personagem'}</strong>
          <ul>
            {resumo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <span className="letra-miuda">Com isso, desenhamos {quem} no traço da turma Little Paws. Só você vê.</span>
        </div>
      </div>
      <ol className="partes" aria-label="Partes do personagem">
        {partes.map(({ titulo }, i) => (
          <li key={titulo}>
            <button
              type="button"
              aria-current={i === parte ? 'step' : undefined}
              className={i < parte ? 'feita' : ''}
              disabled={i > parte}
              onClick={() => onParte(i)}
            >
              {i + 1}. {titulo}
            </button>
          </li>
        ))}
      </ol>
      <div>
        <h2 className="parte-titulo">{partes.find((p) => p.id === atual)?.titulo}</h2>
        {erro && (
          <div className="aviso-erro" role="alert">
            {erro}
          </div>
        )}

        {atual === 'quem' && (
          <>
        {fotoLigada && (
          <div className="pagamentos" role="group" aria-label="Como criar o personagem" style={{ marginBottom: 18 }}>
            <button type="button" className="pagamento" aria-pressed={jeito === 'caracteristicas'} onClick={() => onMudar({ ...personagem, jeito: 'caracteristicas', pele: personagem.pele === PELE_DA_FOTO ? PERSONAGEM_INICIAL.pele : personagem.pele })}>
              <strong>Pelas características</strong>
              <div className="letra-miuda">cabelo, pele, óculos…</div>
            </button>
            <button type="button" className="pagamento" aria-pressed={jeito === 'foto'} onClick={() => onMudar({ ...personagem, jeito: 'foto', pele: personagem.jeito === 'foto' ? personagem.pele : PELE_DA_FOTO })}>
              <strong>Por uma foto</strong>
              <div className="letra-miuda">a gente desenha</div>
            </button>
          </div>
        )}

        <Escolha titulo="A criança é" lista={APARENCIAS} valor={personagem.aparencia} onEscolher={(v) => muda('aparencia', v)} />

        {jeito === 'foto' ? (
          <div className="campo">
            <label className="marcar consentimento">
              <input
                type="checkbox"
                checked={consentiu}
                onChange={(e) => {
                  setConsentiu(e.target.checked);
                  // sem o aceite, a foto já enviada deixa de valer para o pedido
                  if (!e.target.checked && personagem.foto) muda('foto', null);
                }}
              />
              <span>{TEXTO_DO_CONSENTIMENTO}</span>
            </label>
            <label htmlFor="foto" className="rotulo">
              Foto da criança
            </label>
            <input
              id="foto"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={!consentiu || enviando}
              onChange={(e) => {
                const arquivo = e.target.files?.[0];
                if (arquivo) void enviarFoto(arquivo);
                e.target.value = '';
              }}
            />
            <span className="ajuda">De frente, com o rosto bem visível e boa luz. Só a criança na foto. JPG ou PNG, até 10 MB.</span>
            {enviando && <span className="ajuda" role="status">Enviando a foto…</span>}
            {personagem.foto && !enviando && (
              <span className="foto-recebida" role="status">
                {/* a miniatura é o arquivo que está no seu aparelho: ela não volta do servidor */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {miniatura && <img src={miniatura} alt="" width={56} height={56} />}
                Foto recebida, sem os dados de localização. Ela é apagada em 7 dias.
              </span>
            )}
            {falhaDaFoto && <span className="erro">{falhaDaFoto}</span>}
            <Escolha titulo="Tom de pele" lista={PELES_COM_FOTO} valor={personagem.pele} onEscolher={(v) => muda('pele', v)} />
            <span className="ajuda">Se quiser, escolha o tom: luz e sombra da foto podem enganar o desenho.</span>
          </div>
        ) : (
          <>
            <Escolha titulo="Altura para a idade" lista={ALTURAS} valor={personagem.altura} onEscolher={(v) => muda('altura', v)} />
            <Escolha titulo="Tom de pele" lista={PELES} valor={personagem.pele} onEscolher={(v) => muda('pele', v)} />
          </>
        )}
          </>
        )}

        {atual === 'cabelo' && (
          <>
            <Escolha titulo="Tipo de cabelo" lista={CABELO_TIPOS} valor={personagem.cabeloTipo} onEscolher={(v) => muda('cabeloTipo', v)} />
            {!raspado && (
              <>
                <Escolha titulo="Comprimento" lista={CABELO_COMPRIMENTOS} valor={personagem.cabeloComprimento} onEscolher={(v) => muda('cabeloComprimento', v)} />
                <Escolha titulo="Penteado" lista={PENTEADOS} valor={personagem.penteado} onEscolher={(v) => muda('penteado', v)} />
              </>
            )}
            <Escolha titulo="Cor do cabelo" lista={CABELO_CORES} valor={personagem.cabeloCor} onEscolher={(v) => muda('cabeloCor', v)} />
            <Escolha titulo="Óculos" lista={OCULOS} valor={personagem.oculos} onEscolher={(v) => muda('oculos', v)} />
            <div className="campo">
              <span className="rotulo" id="rotulo-detalhes">
                Detalhes <span className="letra-miuda">(pode marcar mais de um)</span>
              </span>
              <div className="opcoes" role="group" aria-labelledby="rotulo-detalhes">
                {DETALHES.map((d) => {
                  const marcado = personagem.detalhes.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      className="chip"
                      aria-pressed={marcado}
                      onClick={() => muda('detalhes', marcado ? personagem.detalhes.filter((x) => x !== d.id) : [...personagem.detalhes, d.id])}
                    >
                      {d.rotulo}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {atual === 'roupa' && (
          <>
            <Escolha titulo="Roupa favorita (nas primeiras páginas)" lista={ROUPAS} valor={personagem.roupa} onEscolher={(v) => muda('roupa', v)} />
            <Escolha titulo="Cor favorita" lista={CORES} valor={personagem.cor} onEscolher={(v) => muda('cor', v)} />
          </>
        )}

        {atual === 'superpoder' && (
          <>
            <p className="letra-miuda">O superpoder muda o que {quem} faz para ajudar o time no intervalo do jogo.</p>
            <Escolha titulo={`O superpoder de ${quem}`} lista={SUPERPODERES} valor={personagem.superpoder} onEscolher={(v) => muda('superpoder', v as Personagem['superpoder'])} />
          </>
        )}
      </div>
    </section>
  );
}
