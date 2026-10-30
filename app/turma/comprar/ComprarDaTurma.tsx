'use client';

// Comprar um livro da turma, impresso sob medida ou em PDF (dono, 26/10/2026).
// Precisa de conta, como o livrinho personalizado. O preço mostrado é vitrine:
// a rota recalcula.

import Image from 'next/image';
import { useState } from 'react';
import { FormularioDeConta, useConta } from '@/components/FormularioDeConta';
import { acharEdicao, PRECO_DO_FORMATO, ROTULO_DO_FORMATO, UFS_DO_BRASIL, type ErrosDaTurma, type FormatoDaTurma } from '@/lib/livros-publicados';
import { emReais } from '@/lib/produtos';

const VAZIO = { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' };

export function ComprarDaTurma({ edicaoId, formatoInicial, google }: { edicaoId: string; formatoInicial: FormatoDaTurma; google: boolean }) {
  const { carregando, conta } = useConta();
  const [formato, setFormato] = useState<FormatoDaTurma>(formatoInicial);
  const [responsavel, setResponsavel] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [endereco, setEndereco] = useState(VAZIO);
  const [erros, setErros] = useState<ErrosDaTurma>({});
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);
  const [registrado, setRegistrado] = useState(false);
  const { livro, edicao } = acharEdicao(edicaoId)!;

  const muda = (campo: keyof typeof VAZIO, valor: string) => {
    setEndereco((e) => ({ ...e, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setFalha(null);
    try {
      const r = await fetch('/api/turma/pedido', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          edicao: edicaoId,
          formato,
          responsavel,
          whatsapp,
          endereco: formato === 'impresso' ? endereco : null,
          site: (document.getElementById('site') as HTMLInputElement | null)?.value ?? '',
        }),
      });
      const d = (await r.json().catch(() => ({}))) as { id?: string; pagar?: string | null; erros?: ErrosDaTurma; mensagem?: string };
      if (!r.ok || !d.id) {
        setErros(d.erros ?? {});
        setFalha(d.mensagem ?? 'Não conseguimos registrar o pedido agora.');
        setEnviando(false);
        return;
      }
      if (d.pagar) window.location.href = d.pagar;
      else setRegistrado(true);
    } catch {
      setFalha('Sem conexão agora. Confira a internet e tente de novo.');
    }
    setEnviando(false);
  }

  const campo = (id: keyof typeof VAZIO, rotulo: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="campo">
      <label htmlFor={`end-${id}`}>{rotulo}</label>
      <input id={`end-${id}`} value={endereco[id]} onChange={(ev) => muda(id, ev.target.value)} aria-invalid={Boolean(erros[id])} {...extra} />
      {erros[id] && <span className="erro">{erros[id]}</span>}
    </div>
  );

  return (
    <section className="turma-compra">
      <div className="cartao turma-resumo">
        {edicao.capa && <Image src={edicao.capa.src} alt={`Capa do livro ${livro.titulo}`} width={edicao.capa.largura} height={edicao.capa.altura} />}
        <div>
          <span className="selo-ingles">{livro.idioma === 'pt' ? 'Em português' : 'Em inglês'}</span>
          <h1 lang={livro.idioma === 'en' ? 'en' : undefined}>{livro.titulo}</h1>
          <p className="letra-miuda">{edicao.tipo}</p>
          <p>{livro.historia}</p>
        </div>
      </div>

      {registrado ? (
        <div className="aviso-ok" role="status">
          Pedido registrado! Em breve chamamos você no WhatsApp {whatsapp} para combinar o pagamento
          {formato === 'impresso' ? ', o frete e a entrega' : ' e mandar o PDF'}. O pedido também aparece em Minha conta.
        </div>
      ) : carregando ? (
        <div style={{ minHeight: 200 }} />
      ) : !conta ? (
        <>
          <h2>Entre para comprar</h2>
          <p className="letra-miuda">É na sua conta que o pedido fica guardado.</p>
          <FormularioDeConta destino={`/turma/comprar?edicao=${edicaoId}&formato=${formato}`} google={google} />
        </>
      ) : (
        <form onSubmit={enviar}>
          <div className="campo">
            <span className="rotulo" id="rotulo-formato">
              Como você quer?
            </span>
            <div className="pagamentos" role="group" aria-labelledby="rotulo-formato">
              {(['impresso', 'pdf'] as const).map((f) => (
                <button key={f} type="button" className="pagamento" aria-pressed={formato === f} onClick={() => setFormato(f)}>
                  <strong>{ROTULO_DO_FORMATO[f]}</strong>
                  <div className="letra-miuda">{emReais(PRECO_DO_FORMATO[f])}</div>
                </button>
              ))}
            </div>
            <span className="ajuda">
              {formato === 'impresso'
                ? 'Tiragem sob medida: imprimimos o seu exemplar quando você pede. O frete é à parte, calculado pelo seu CEP.'
                : 'O arquivo para imprimir em casa quantas vezes quiser.'}
            </span>
          </div>

          {falha && (
            <div className="aviso-erro" role="alert">
              {falha}
            </div>
          )}
          <p className="letra-miuda conta-atual">
            Comprando como <strong>{conta.email}</strong>.
          </p>
          <div className="campo">
            <label htmlFor="responsavel">Seu nome</label>
            <input id="responsavel" autoComplete="name" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} aria-invalid={Boolean(erros.responsavel)} />
            {erros.responsavel && <span className="erro">{erros.responsavel}</span>}
          </div>
          <div className="campo">
            <label htmlFor="whatsapp">WhatsApp</label>
            <input id="whatsapp" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(11) 91234-5678" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} aria-invalid={Boolean(erros.whatsapp)} />
            {erros.whatsapp && <span className="erro">{erros.whatsapp}</span>}
          </div>

          {formato === 'impresso' && (
            <fieldset className="endereco">
              <legend>Para onde mandamos</legend>
              {campo('cep', 'CEP', { inputMode: 'numeric', autoComplete: 'postal-code', placeholder: '00000-000' })}
              {campo('rua', 'Rua', { autoComplete: 'address-line1' })}
              <div className="endereco-linha">
                {campo('numero', 'Número')}
                {campo('complemento', 'Complemento', { autoComplete: 'address-line2', placeholder: 'opcional' })}
              </div>
              {campo('bairro', 'Bairro')}
              <div className="endereco-linha">
                {campo('cidade', 'Cidade', { autoComplete: 'address-level2' })}
                <div className="campo">
                  <label htmlFor="end-uf">Estado</label>
                  <select id="end-uf" value={endereco.uf} onChange={(ev) => muda('uf', ev.target.value)} aria-invalid={Boolean(erros.uf)}>
                    <option value="">UF</option>
                    {UFS_DO_BRASIL.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                  {erros.uf && <span className="erro">{erros.uf}</span>}
                </div>
              </div>
            </fieldset>
          )}

          {/* armadilha para robôs: gente de verdade não vê nem preenche */}
          <input id="site" name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1 }} />

          <div className="resumo">
            <span>Total</span>
            <span className="total">
              {emReais(PRECO_DO_FORMATO[formato])}
              {formato === 'impresso' && <span className="letra-miuda"> + frete</span>}
            </span>
          </div>
          <button type="submit" className="botao" disabled={enviando} style={{ width: '100%' }}>
            {enviando ? 'Enviando…' : formato === 'impresso' ? 'Pedir o impresso' : 'Pedir o PDF'}
          </button>
          <p className="letra-miuda">
            Ao continuar, você concorda com os <a href="/termos">termos</a> e a <a href="/privacidade">política de privacidade</a>.
          </p>
        </form>
      )}
    </section>
  );
}
