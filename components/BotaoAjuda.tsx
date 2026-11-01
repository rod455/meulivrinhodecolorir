'use client';

// O "?" flutuante (dono, 01/11/2026), como o "Fale direto com a gente" do app Mentorque:
// abre um formulário curto e a mensagem chega no e-mail de contato. O e-mail de quem
// escreve é obrigatório, porque é por ele que a gente responde.

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LIMITE_DA_MENSAGEM, TIPOS_DE_CONTATO, type ErrosDoContato, type TipoDeContato } from '@/lib/contato';

export function BotaoAjuda() {
  const pagina = usePathname() ?? '/';
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<TipoDeContato>('duvida');
  const [mensagem, setMensagem] = useState('');
  const [email, setEmail] = useState('');
  const [isca, setIsca] = useState('');
  const [erros, setErros] = useState<ErrosDoContato>({});
  const [situacao, setSituacao] = useState<'livre' | 'enviando' | 'enviado' | 'falhou'>('livre');
  const campo = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!aberto) return;
    campo.current?.focus();
    const fechar = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
    window.addEventListener('keydown', fechar);
    return () => window.removeEventListener('keydown', fechar);
  }, [aberto]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setSituacao('enviando');
    const r = await fetch('/api/contato', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tipo, mensagem, email, pagina, site: isca }),
    }).catch(() => null);
    const corpo = (await r?.json().catch(() => null)) as { ok?: boolean; erros?: ErrosDoContato } | null;
    if (r?.ok && corpo?.ok) {
      setSituacao('enviado');
      setMensagem('');
      setErros({});
      return;
    }
    setErros(corpo?.erros ?? {});
    setSituacao(corpo?.erros ? 'livre' : 'falhou');
  }

  return (
    <>
      <button type="button" className="botao-ajuda" aria-label="Fale com a gente" aria-expanded={aberto} onClick={() => setAberto((a) => !a)}>
        ?
      </button>
      {aberto && (
        <div className="ajuda-painel" role="dialog" aria-modal="false" aria-labelledby="ajuda-titulo">
          <div className="ajuda-topo">
            <strong id="ajuda-titulo">Fale direto com a gente</strong>
            <button type="button" className="ajuda-fechar" aria-label="Fechar" onClick={() => setAberto(false)}>
              ×
            </button>
          </div>
          {situacao === 'enviado' ? (
            <div className="ajuda-enviado" role="status">
              <p>
                <strong>Recebemos!</strong> A gente responde no e-mail {email}.
              </p>
              <button type="button" className="botao botao-secundario botao-pequeno" onClick={() => setSituacao('livre')}>
                Mandar outra mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={enviar} noValidate>
              <div className="ajuda-tipos" role="group" aria-label="Tipo de mensagem">
                {TIPOS_DE_CONTATO.map((t) => (
                  <button key={t.id} type="button" className="ajuda-tipo" aria-pressed={tipo === t.id} onClick={() => setTipo(t.id)}>
                    {t.rotulo}
                  </button>
                ))}
              </div>
              <label htmlFor="ajuda-mensagem" className="visualmente-escondido">
                Sua mensagem
              </label>
              <textarea
                id="ajuda-mensagem"
                ref={campo}
                rows={5}
                maxLength={LIMITE_DA_MENSAGEM}
                placeholder="Escreva sua mensagem aqui..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                aria-invalid={Boolean(erros.mensagem)}
                aria-describedby={erros.mensagem ? 'ajuda-erro-mensagem' : undefined}
              />
              {erros.mensagem && (
                <span id="ajuda-erro-mensagem" className="erro">
                  {erros.mensagem}
                </span>
              )}
              <label htmlFor="ajuda-email">Seu e-mail (para a gente responder)</label>
              <input
                id="ajuda-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(erros.email)}
                aria-describedby={erros.email ? 'ajuda-erro-email' : undefined}
              />
              {erros.email && (
                <span id="ajuda-erro-email" className="erro">
                  {erros.email}
                </span>
              )}
              {/* isca para robôs: escondida de quem usa o site */}
              <input className="ajuda-isca" tabIndex={-1} autoComplete="off" aria-hidden="true" name="site" value={isca} onChange={(e) => setIsca(e.target.value)} />
              {situacao === 'falhou' && (
                <span className="erro" role="alert">
                  Não conseguimos enviar agora. Tente de novo em instantes.
                </span>
              )}
              <button type="submit" className="botao" disabled={situacao === 'enviando'}>
                {situacao === 'enviando' ? 'Enviando...' : 'Enviar mensagem'}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
