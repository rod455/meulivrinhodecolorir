'use client';

// Seção 5 da LP: a vitrine de cada tema com as artes do kit; cada uma abre as amostras que já têm arte.

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LISTA_DE_TEMAS, TEMAS, TEMAS_EM_BREVE, type TemaId } from '@/lib/temas';
import { PaginaAmostra } from './PaginaAmostra';

const EXEMPLOS: Record<TemaId, { nome: string; idade: number }> = {
  futebol: { nome: 'Theo', idade: 4 },
  natal: { nome: 'Helena', idade: 6 },
  'fundo-do-mar': { nome: 'Laura', idade: 3 },
};

export function GaleriaDeTemas() {
  const [aberto, setAberto] = useState<TemaId | null>(null);
  const fechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    fechar.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(null);
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [aberto]);

  return (
    <>
      <div className="galeria">
        {LISTA_DE_TEMAS.map((t) => (
          <button key={t.id} type="button" className="cartao tema-cartao" onClick={() => setAberto(t.id)}>
            <span className="tema-vitrine">
              <Image src={t.vitrine.src} alt="" width={t.vitrine.largura} height={t.vitrine.altura} sizes="(min-width: 760px) 340px, 78vw" />
            </span>
            <span>
              <strong style={{ fontSize: '1.15rem' }}>
                {t.emoji} {t.nome}
              </strong>
              <br />
              <span className="letra-miuda">{t.descricao}</span>
              <br />
              <span style={{ fontWeight: 800, textDecoration: 'underline' }}>Ver páginas</span>
            </span>
          </button>
        ))}
      </div>
      <div className="em-breve" aria-label="Temas que chegam em breve">
        <strong style={{ width: '100%', textAlign: 'center' }}>Chegando em breve:</strong>
        {TEMAS_EM_BREVE.map((t) => (
          <span key={t.nome}>
            {t.emoji} {t.nome}
          </span>
        ))}
      </div>

      {aberto && (
        <div className="janela-fundo" onClick={() => setAberto(null)}>
          <div className="janela" role="dialog" aria-modal="true" aria-labelledby="janela-titulo" onClick={(e) => e.stopPropagation()}>
            <div className="janela-topo">
              <h3 id="janela-titulo" style={{ margin: 0 }}>
                {TEMAS[aberto].emoji} {TEMAS[aberto].nome}
              </h3>
              <button ref={fechar} type="button" className="fechar" onClick={() => setAberto(null)} aria-label="Fechar">
                ×
              </button>
            </div>
            {TEMAS[aberto].artes ? (
              <div className="janela-paginas">
                <PaginaAmostra tema={aberto} nome={EXEMPLOS[aberto].nome} pagina={1} />
                <PaginaAmostra tema={aberto} nome={EXEMPLOS[aberto].nome} pagina={2} />
              </div>
            ) : (
              <div className="janela-vitrine">
                <Image src={TEMAS[aberto].vitrine.src} alt={`Exemplo de livrinho do tema ${TEMAS[aberto].nome}`} width={TEMAS[aberto].vitrine.largura} height={TEMAS[aberto].vitrine.altura} />
              </div>
            )}
            <p className="letra-miuda">O nome da criança aparece na capa e nas frases das páginas. A criançada pinta o resto!</p>
            <Link href={`/criar?tema=${aberto}`} className="botao botao-largo">
              Criar com este tema
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
