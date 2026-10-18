'use client';

// Entrar ou criar a conta (decisão do dono, 18/10/2026): e-mail e senha, link
// por e-mail (também serve de "esqueci a senha") e Google, se estiver ligado.
// Usado no fim do pedido e na página /entrar.

import { useEffect, useState } from 'react';
import { supabaseNoNavegador } from '@/lib/supabase/navegador';

export type ContaNoNavegador = { id: string; email: string };

/** A conta da sessão no navegador, acompanhando entrada e saída em outras abas. */
export function useConta() {
  const [estado, setEstado] = useState<{ carregando: boolean; conta: ContaNoNavegador | null }>({ carregando: true, conta: null });
  useEffect(() => {
    const supabase = supabaseNoNavegador();
    const aplicar = (u: { id: string; email?: string } | null | undefined) =>
      setEstado({ carregando: false, conta: u?.email ? { id: u.id, email: u.email.toLowerCase() } : null });
    supabase.auth.getSession().then(({ data }) => aplicar(data.session?.user));
    const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => aplicar(sessao?.user));
    return () => data.subscription.unsubscribe();
  }, []);
  return estado;
}

export const LIMITE_MINIMO_DA_SENHA = 8;

function emPortugues(mensagem: string): string {
  const m = mensagem.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha não conferem.';
  if (m.includes('email not confirmed')) return 'Falta confirmar o e-mail. Procure a mensagem que mandamos (veja também o spam).';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Esse e-mail já tem conta. Toque em "Já tenho conta".';
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas seguidas. Espere um minuto e tente de novo.';
  if (m.includes('password')) return `A senha precisa ter pelo menos ${LIMITE_MINIMO_DA_SENHA} caracteres.`;
  if (m.includes('email')) return 'Confira o e-mail.';
  return 'Não deu certo agora. Tente de novo em instantes.';
}

type Modo = 'criar' | 'entrar' | 'link';

export function FormularioDeConta({
  destino,
  google,
  modoInicial = 'criar',
  titulo,
  irDepois = false,
}: {
  /** caminho do site para onde a pessoa volta depois do Google ou do link por e-mail */
  destino: string;
  google: boolean;
  modoInicial?: Modo;
  titulo?: string;
  /** na página /entrar: assim que a sessão existir, vai para o destino */
  irDepois?: boolean;
}) {
  const { conta } = useConta();
  useEffect(() => {
    // recarrega a página inteira para o servidor já ler o cookie da sessão nova
    if (irDepois && conta) window.location.assign(destino);
  }, [irDepois, conta, destino]);
  const [modo, setModo] = useState<Modo>(modoInicial);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const volta = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(destino)}`;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    if (!emailOk) return setErro('Confira o e-mail.');
    if (modo !== 'link' && senha.length < LIMITE_MINIMO_DA_SENHA) {
      return setErro(`A senha precisa ter pelo menos ${LIMITE_MINIMO_DA_SENHA} caracteres.`);
    }
    setOcupado(true);
    const supabase = supabaseNoNavegador();
    const endereco = email.trim().toLowerCase();
    try {
      if (modo === 'criar') {
        const { data, error } = await supabase.auth.signUp({ email: endereco, password: senha, options: { emailRedirectTo: volta() } });
        if (error) throw error;
        // sem sessão: o Supabase pede confirmação do e-mail antes de entrar
        if (!data.session) setAviso(`Mandamos um link para ${endereco}. Toque nele e você volta direto para cá; o livrinho fica guardado.`);
      } else if (modo === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email: endereco, password: senha });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({ email: endereco, options: { emailRedirectTo: volta() } });
        if (error) throw error;
        setAviso(`Mandamos um link para ${endereco}. Toque nele e você entra direto, sem senha.`);
      }
    } catch (falha) {
      setErro(emPortugues(falha instanceof Error ? falha.message : String(falha)));
    } finally {
      setOcupado(false);
    }
  }

  async function entrarComGoogle() {
    setErro(null);
    setOcupado(true);
    const { error } = await supabaseNoNavegador().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: volta() } });
    if (error) {
      setErro(emPortugues(error.message));
      setOcupado(false);
    }
  }

  return (
    <div className="conta-caixa">
      {titulo && <h2 className="conta-titulo">{titulo}</h2>}
      <div className="pagamentos" role="group" aria-label="Criar conta ou entrar">
        <button type="button" className="pagamento" aria-pressed={modo === 'criar'} onClick={() => setModo('criar')}>
          <strong>Criar conta</strong>
        </button>
        <button type="button" className="pagamento" aria-pressed={modo !== 'criar'} onClick={() => setModo('entrar')}>
          <strong>Já tenho conta</strong>
        </button>
      </div>

      {google && (
        <button type="button" className="botao botao-secundario botao-google" disabled={ocupado} onClick={entrarComGoogle}>
          <span aria-hidden="true">G</span> {modo === 'criar' ? 'Criar com o Google' : 'Entrar com o Google'}
        </button>
      )}

      <form onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor="conta-email">E-mail</label>
          <input id="conta-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {modo !== 'link' && (
          <div className="campo">
            <label htmlFor="conta-senha">{modo === 'criar' ? 'Crie uma senha' : 'Senha'}</label>
            <input
              id="conta-senha"
              type="password"
              autoComplete={modo === 'criar' ? 'new-password' : 'current-password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            {modo === 'criar' && <span className="ajuda">Pelo menos {LIMITE_MINIMO_DA_SENHA} caracteres.</span>}
          </div>
        )}
        {erro && (
          <div className="aviso-erro" role="alert">
            {erro}
          </div>
        )}
        {aviso && (
          <div className="aviso-ok" role="status">
            {aviso}
          </div>
        )}
        <button type="submit" className="botao" disabled={ocupado} style={{ width: '100%' }}>
          {ocupado ? 'Um instante…' : modo === 'criar' ? 'Criar conta' : modo === 'entrar' ? 'Entrar' : 'Mandar link de entrada'}
        </button>
      </form>

      <p className="letra-miuda" style={{ textAlign: 'center', marginTop: 12 }}>
        {modo === 'link' ? (
          <button type="button" className="link-botao" onClick={() => setModo('entrar')}>
            Entrar com senha
          </button>
        ) : (
          <button type="button" className="link-botao" onClick={() => setModo('link')}>
            Esqueceu a senha ou prefere sem senha? Receba um link por e-mail
          </button>
        )}
      </p>
    </div>
  );
}
