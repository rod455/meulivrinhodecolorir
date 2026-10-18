'use client';

// Cuidar da conta: trocar a senha, apagar as fotos antes dos 7 dias, sair e
// excluir tudo (spec, seção 3; LGPD).

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LIMITE_MINIMO_DA_SENHA } from '@/components/FormularioDeConta';
import { PALAVRA_DE_CONFIRMACAO } from '@/lib/conta';
import { supabaseNoNavegador } from '@/lib/supabase/navegador';

export function AcoesDaConta({ fotosGuardadas }: { fotosGuardadas: number }) {
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
    <section className="conta-acoes">
      {aviso && (
        <div className={aviso.tipo === 'ok' ? 'aviso-ok' : 'aviso-erro'} role={aviso.tipo === 'ok' ? 'status' : 'alert'}>
          {aviso.texto}
        </div>
      )}

      <h2>Senha</h2>
      <form onSubmit={trocarSenha} className="campo">
        <label htmlFor="senha-nova">Senha nova</label>
        <input id="senha-nova" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <button type="submit" className="botao botao-secundario" disabled={ocupado}>
          Salvar senha
        </button>
      </form>

      <h2>Fotos</h2>
      <p className="letra-miuda">
        {fotosGuardadas > 0
          ? `${fotosGuardadas === 1 ? 'Uma foto guardada' : `${fotosGuardadas} fotos guardadas`}. Elas somem sozinhas em até 7 dias depois do envio, mas você pode apagar agora.`
          : 'Nenhuma foto guardada.'}
      </p>
      {fotosGuardadas > 0 && (
        <button type="button" className="botao botao-secundario" disabled={ocupado} onClick={apagarFotos}>
          Apagar fotos agora
        </button>
      )}

      <h2>Sair</h2>
      <button type="button" className="botao botao-secundario" onClick={sair}>
        Sair da conta
      </button>

      <h2>Excluir conta</h2>
      <p className="letra-miuda">
        Apaga o login, as fotos, os personagens, os livrinhos e os dados da criança e de contato. Fica só o registro da venda (produto, valor e
        data), para a contabilidade. Não dá para desfazer.
      </p>
      <div className="campo">
        <label htmlFor="confirmar-exclusao">Para confirmar, digite {PALAVRA_DE_CONFIRMACAO}</label>
        <input id="confirmar-exclusao" value={confirmacao} autoComplete="off" onChange={(e) => setConfirmacao(e.target.value)} />
      </div>
      <button
        type="button"
        className="botao botao-perigo"
        disabled={ocupado || confirmacao.trim().toUpperCase() !== PALAVRA_DE_CONFIRMACAO}
        onClick={excluir}
      >
        Excluir minha conta e todos os dados
      </button>
    </section>
  );
}
