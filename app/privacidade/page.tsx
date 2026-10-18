import type { Metadata } from 'next';
import { Cabecalho } from '@/components/Cabecalho';
import { Rodape } from '@/components/Rodape';
import { SITE } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Política de privacidade | Meu Livrinho de Colorir',
  alternates: { canonical: '/privacidade' },
};

// Seção 4.4 (LGPD). Texto de partida: o dono revisa antes de vender.
export default function Privacidade() {
  return (
    <>
      <Cabecalho semMenu />
      <main className="texto-longo">
        <h1>Política de privacidade</h1>
        <p className="letra-miuda">Versão de outubro de 2026.</p>
        <p>
          A gente pede o mínimo para fazer o seu livrinho e entregar. Aqui está o que guardamos, para quê e por quanto tempo, de acordo com a
          Lei Geral de Proteção de Dados (Lei 13.709/2018).
        </p>

        <h2>Dados da criança</h2>
        <ul>
          <li>Guardamos só o <strong>primeiro nome</strong> (ou apelido) e a <strong>idade</strong>, para colocar no livrinho.</li>
          <li>
            Nos temas em que a criança vira personagem da história, guardamos também as escolhas do personagem (cabelo, tom de pele,
            óculos, roupa, superpoder) e o personagem desenhado, só para o seu pedido.
          </li>
          <li>
            A <strong>foto</strong> é opcional e só entra com a sua autorização, marcada no pedido. Ela serve apenas para desenhar o personagem:
            tiramos dela os dados de localização e do aparelho, guardamos num arquivo privado e <strong>apagamos em 7 dias</strong>. As
            páginas do livro são desenhadas a partir do personagem, nunca da foto.
          </li>
          <li>Não pedimos sobrenome nem escola.</li>
          <li>A data da festa é opcional e serve só para o lembrete do ano seguinte, se você quiser.</li>
          <li>
            Apagamos os dados de personalização em <strong>12 meses</strong>, a não ser que você tenha aceitado o lembrete de aniversário.
          </li>
        </ul>

        <h2>Seus dados</h2>
        <ul>
          <li>Nome, e-mail e WhatsApp: para entregar o arquivo, tirar dúvidas e mandar o recado de pós-venda.</li>
          <li>
            Para comprar e baixar, você cria uma conta com e-mail e senha, link por e-mail ou Google. A senha fica guardada cifrada pelo
            nosso provedor de login; nem a gente consegue ler. Do Google, recebemos só o seu e-mail.
          </li>
          <li>
            Em <strong>Meus livrinhos</strong> você vê os pedidos, baixa os arquivos, apaga as fotos na hora e pode excluir a conta. Ao
            excluir, apagamos o login, as fotos, os livrinhos e os dados da criança e de contato; fica só o registro da venda (produto,
            valor e data), para a contabilidade.
          </li>
          <li>Ideias de festa e cupons só chegam se você marcar a caixa no pedido. Dá para sair a qualquer momento.</li>
          <li>Os dados de pagamento ficam com a empresa de pagamento; a gente não vê nem guarda o número do cartão.</li>
        </ul>

        <h2>Medição do site</h2>
        <p>
          Usamos ferramentas de medição (Google Analytics e Meta) para saber quantas pessoas visitam o site e quantas fazem o pedido. Elas não
          recebem o nome da criança.
        </p>

        <h2>Com quem compartilhamos</h2>
        <p>
          Só com os serviços que fazem o pedido funcionar: hospedagem do site, banco de dados, envio de e-mail e WhatsApp, a empresa de
          pagamento e o serviço de inteligência artificial que desenha o personagem (OpenAI), que recebe as escolhas do personagem e, se
          você enviar, a foto. O nome da criança não vai para esse serviço. Nunca vendemos dados.
        </p>

        <h2>Seus direitos</h2>
        <p>
          Você pode pedir para ver, corrigir ou apagar os seus dados e os da criança quando quiser
          {SITE.email ? (
            <>
              , pelo e-mail <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </>
          ) : (
            ', pelos nossos canais de contato'
          )}
          .
        </p>
        {(SITE.razaoSocial || SITE.cnpj) && (
          <p className="letra-miuda">
            Responsável: {SITE.razaoSocial} {SITE.cnpj && `(CNPJ ${SITE.cnpj})`}
          </p>
        )}
      </main>
      <Rodape />
    </>
  );
}
