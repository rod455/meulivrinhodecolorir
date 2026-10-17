import type { Metadata } from 'next';
import { Cabecalho } from '@/components/Cabecalho';
import { Rodape } from '@/components/Rodape';

export const metadata: Metadata = {
  title: 'Termos de uso e trocas | Meu Livrinho de Colorir',
  alternates: { canonical: '/termos' },
};

// Regras de negócio da seção 4.3. Texto de partida: o dono revisa antes de vender.
export default function Termos() {
  return (
    <>
      <Cabecalho semMenu />
      <main className="texto-longo">
        <h1>Termos de uso e trocas</h1>
        <p className="letra-miuda">Versão de outubro de 2026.</p>

        <h2>O que você compra</h2>
        <p>
          Um arquivo digital (PDF) do livrinho de colorir, personalizado com o nome e a idade da criança, pronto para imprimir. Não enviamos
          nada impresso por enquanto.
        </p>

        <h2>Quantas cópias</h2>
        <p>
          Você pode imprimir quantas cópias quiser para uso pessoal e para distribuir na sua festa ou evento. Não é permitido revender o
          arquivo ou as cópias, nem publicar os desenhos.
        </p>

        <h2>Entrega</h2>
        <p>
          O arquivo chega por e-mail e WhatsApp em poucos minutos depois da confirmação do pagamento. O link para baixar fica ativo por 30
          dias; guarde o arquivo no seu celular ou computador.
        </p>

        <h2>Correção do nome</h2>
        <p>Digitou errado? Fazemos uma correção grátis em até 48 horas depois da compra.</p>

        <h2>Arrependimento e reembolso</h2>
        <p>
          Se não gostar, devolvemos o seu dinheiro em até 7 dias depois da compra, sem perguntas, como prevê o Código de Defesa do
          Consumidor para compras pela internet.
        </p>

        <h2>Personagens</h2>
        <p>Todos os personagens, desenhos e histórias são criação nossa. Não usamos personagens licenciados de terceiros.</p>
      </main>
      <Rodape />
    </>
  );
}
