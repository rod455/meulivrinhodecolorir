import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Cabecalho } from '@/components/Cabecalho';
import { Rodape } from '@/components/Rodape';
import { linkDoWhatsapp } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Pedido recebido | Meu Livrinho de Colorir',
  robots: { index: false },
};

// Passo 8. Duas portas chegam aqui: o retorno do pagamento (status=pago) e o
// pedido feito sem link de pagamento configurado, que a gente fecha pelo WhatsApp.
export default function Obrigado({ searchParams }: { searchParams: { pedido?: string; status?: string } }) {
  const pago = searchParams.status === 'pago';
  const codigo = (searchParams.pedido ?? '').slice(0, 8).toUpperCase();
  const ajuda = linkDoWhatsapp(`Oi! Fiz o pedido ${codigo} do livrinho e tenho uma dúvida.`);
  return (
    <>
      <Cabecalho semMenu />
      <main className="texto-longo obrigado">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <Image src="/marca/rabisco-com-livro.webp" alt="" width={120} height={193} priority />
        </div>
        <h1>{pago ? 'Pagamento confirmado!' : 'Pedido recebido!'}</h1>
        {codigo && <p className="letra-miuda">Código do pedido: {codigo}</p>}
        {pago ? (
          <p style={{ fontSize: '1.15rem' }}>
            Seu livrinho está sendo preparado. Em poucos minutos, o arquivo chega no seu e-mail e no seu WhatsApp.
          </p>
        ) : (
          <p style={{ fontSize: '1.15rem' }}>
            Já anotamos tudo. Assim que o pagamento for confirmado, o livrinho chega no seu e-mail e no seu WhatsApp. Se faltar o link de
            pagamento, a gente te manda por lá.
          </p>
        )}
        <div className="cartao" style={{ textAlign: 'left', margin: '28px 0' }}>
          <h2 style={{ fontSize: '1.3rem', marginTop: 0 }}>O que você vai receber</h2>
          <ul>
            <li>
              <strong>Livreto:</strong> imprima frente e verso em folha A4, dobre ao meio e grampeie.
            </li>
            <li>
              <strong>Página a página:</strong> para imprimir uma por folha ou levar à gráfica.
            </li>
            <li>
              <strong>Guia de impressão:</strong> papel, configuração da impressora e como montar.
            </li>
          </ul>
          <p className="letra-miuda" style={{ marginBottom: 0 }}>
            O link para baixar fica ativo por 30 dias. Errou o nome? Uma correção é grátis em até 48 horas.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {ajuda && (
            <a href={ajuda} className="botao botao-secundario" target="_blank" rel="noopener noreferrer">
              Falar no WhatsApp
            </a>
          )}
          <Link href="/" className="botao botao-secundario">
            Voltar ao início
          </Link>
        </div>
      </main>
      <Rodape />
    </>
  );
}
