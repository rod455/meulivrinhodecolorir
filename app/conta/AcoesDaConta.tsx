'use client';

// Cuidar da conta: trocar a senha, apagar as fotos antes dos 7 dias, sair e
// excluir tudo (spec, seção 3; LGPD). Em linhas, como a seção "Conta" do
// perfil do Mentorque; senha e exclusão abrem ali mesmo.

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LIMITE_MINIMO_DA_SENHA } from '@/components/FormularioDeConta';
import { Icone } from '@/components/Icone';
import { PALAVRA_DE_CONFIRMACAO } from '@/lib/conta';
import { supabaseNoNavegador } from '@/lib/supabase/navegador';

export function AcoesDaConta({ fotosGuardadas, entrouCom }: { fotosGuardadas: number; entrouCom: 'google' | 'email' }) {
  const router = useRouter();
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < LIMITE_MINIMO_DA_SENHA) return setAviso({ tipo: 'erro', texto: `A senha precisa ter pelo menos ${LIMITE_MINIMO_DA_SENHA} caracteres.` });
    setOcupado(true);
    const { error } = await supabaseNoNavegador().auth.updateUser({ password: senha });
    setOcupado(false);
    setSenha('');
    setAviso(error ? { tipo: 'erro', texto: 'Não conseguimos trocar a senha agora.' } : { tipo: 'ok', texto: 'Senha nova salva.' });
  }

  async function chamar(caminho: string, corpo?: object) {
    setOcupado(true);
    setAviso(null);
    try {
      const r = await fetch(caminho, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo ?? {}) });
      const dados = (await r.json().catch(() => ({}))) as { mensagem?: string; apagadas?: number };
      if (!r.ok) throw new Error(dados.mensagem ?? 'Não deu certo agora.');
      return dados;
    } catch (e) {
      setAviso({ tipo: 'erro', texto: e instanceof Error ? e.message : 'Não deu certo agora.' });
      return null;
    } finally {
      setOcupado(false);
    }
  }

  async function apagarFotos() {
    const dados = await chamar('/api/conta/fotos');
    if (dados) {
      setAviso({ tipo: 'ok', texto: dados.apagadas ? 'Fotos apagadas.' : 'Não havia foto guardada.' });
      router.refresh();
    }
  }

  async function sair() {
    await supabaseNoNavegador().auth.signOut();
    router.push('/');
    router.refresh();
  }

  async function excluir() {
    const dados = await chamar('/api/conta/excluir', { confirmar: confirmacao.trim().toUpperCase() });
    if (dados) {
      await supabaseNoNavegador().auth.signOut().catch(() => undefined);
      router.push('/?conta=excluida');
      router.refresh();
    }
  }

  return (
    <section>
      <h2 className="grupo-rotulo">Conta</h2>
      {aviso && (
        <div className={aviso.tipo === 'ok' ? 'aviso-ok' : 'aviso-erro'} role={aviso.tipo === 'ok' ? 'status' : 'alert'}>
          {aviso.texto}
        </div>
      )}
      <ul className="grupo">
        <li className="linha">
          {entrouCom === 'google' ? (
            <span className="linha-icone tom-branco letra-google" aria-hidden="true">
              G
            </span>
          ) : (
            <span className="linha-icone tom-azul">
              <Icone nome="envelope" />
            </span>
          )}
          <span className="linha-texto">
            <strong>{entrouCom === 'google' ? 'Conectado com Google' : 'Entrou com e-mail e senha'}</strong>
          </span>
        </li>

        <li>
          <details className="linha-abre">
            <summary className="linha linha-link">
              <span className="linha-icone tom-amarelo">
                <Icone nome="cadeado" />
              </span>
              <span className="linha-texto">
                <strong>{entrouCom === 'google' ? 'Criar uma senha' : 'Trocar a senha'}</strong>
              </span>
              <Seta />
            </summary>
            <form onSubmit={trocarSenha} className="linha-conteudo campo">
              <label htmlFor="senha-nova">Senha nova</label>
              <input id="senha-nova" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
              <button type="submit" className="botao botao-secundario botao-pequeno" disabled={ocupado}>
                Salvar senha
              </button>
            </form>
          </details>
        </li>

        <li className="linha">
          <span className="linha-icone tom-rosa">
            <Icone nome="foto" />
          </span>
          <span className="linha-texto">
            <strong>Fotos da criança</strong>
            <small>
              {fotosGuardadas > 0
                ? `${fotosGuardadas === 1 ? 'Uma foto guardada' : `${fotosGuardadas} fotos guardadas`}. Somem sozinhas em até 7 dias.`
                : 'Nenhuma foto guardada.'}
            </small>
          </span>
          {fotosGuardadas > 0 && (
            <button type="button" className="botao botao-secundario botao-pequeno" disabled={ocupado} onClick={apagarFotos}>
              Apagar fotos agora
            </button>
          )}
        </li>

        <li>
          <button type="button" className="linha linha-link" onClick={sair}>
            <span className="linha-icone tom-nuvem">
              <Icone nome="sair" />
            </span>
            <span className="linha-texto">
              <strong>Sair da conta</strong>
            </span>
            <Seta />
          </button>
        </li>

        <li>
          <details className="linha-abre">
            <summary className="linha linha-link linha-perigo">
              <span className="linha-icone tom-erro">
                <Icone nome="alerta" />
              </span>
              <span className="linha-texto">
                <strong>Excluir conta</strong>
              </span>
              <Seta />
            </summary>
            <div className="linha-conteudo">
              <p className="letra-miuda">
                Apaga o login, as fotos, os personagens, os livrinhos e os dados da criança e de contato. Fica só o registro da venda (produto, valor
                e data), para a contabilidade. Não dá para desfazer.
              </p>
              <div className="campo">
                <label htmlFor="confirmar-exclusao">Para confirmar, digite {PALAVRA_DE_CONFIRMACAO}</label>
                <input id="confirmar-exclusao" value={confirmacao} autoComplete="off" onChange={(e) => setConfirmacao(e.target.value)} />
              </div>
              <button
                type="button"
                className="botao botao-perigo botao-pequeno"
                disabled={ocupado || confirmacao.trim().toUpperCase() !== PALAVRA_DE_CONFIRMACAO}
                onClick={excluir}
              >
                Excluir minha conta e todos os dados
              </button>
            </div>
          </details>
        </li>
      </ul>
    </section>
  );
}

function Seta() {
  return (
    <span className="linha-fim">
      <Icone nome="seta" tamanho={18} />
    </span>
  );
}
