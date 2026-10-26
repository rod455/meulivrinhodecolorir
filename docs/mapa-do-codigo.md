# Mapa do código

| Quero mudar… | Vá em |
| --- | --- |
| preço, nome ou descrição de um produto | `lib/produtos.ts` (só com o dono; confira com `npm run conferir:pedido`) |
| um tema (nome, frases das páginas, começo da história) | `lib/temas.ts` |
| o personagem da criança (opções do formulário, validação, prompt da ficha) | `lib/personagem.ts` (confira com `npm run conferir:personagem`) |
| a história personalizada de futebol (16 páginas, ações, superpoder) | `lib/historias/futebol.ts`, fonte em `livros-fonte/10-personalizados/` |
| o plano do livro que vai para o n8n gerar as imagens e o PDF | `lib/geracao.ts` |
| a arte colorida de um tema (capa e páginas de amostra) | arquivo em `public/artes/` + campo `artes` do tema em `lib/temas.ts`; originais em `docs/artes/referencias/` |
| o desenho de um tema sem arte | `components/desenho/temas.tsx`, lista de formas num quadro de 240 x 200 |
| o efeito "do contorno à cor" | `components/desenho/formas.tsx` |
| a capa do livrinho | `components/CapaLivrinho.tsx` (A5, viewBox 296 x 420) |
| as páginas de amostra | `components/PaginaAmostra.tsx` |
| regras do nome (limite, palavrão, maiúsculas, fonte da capa) | `lib/nome.ts` (confira com `npm run conferir:nome`) |
| validação do pedido | `lib/pedido.ts`, a mesma no navegador e na rota |
| textos e seções da LP | `app/page.tsx`; perguntas frequentes em `lib/faq.ts` |
| o fluxo de criação (produto, tema, nome, pagamento) | `app/criar/Criar.tsx` |
| a etapa "Crie o personagem" (só nos temas com `comPersonagem`) | `app/criar/EtapaPersonagem.tsx` |
| o tratamento da foto (formato, tamanho, tirar metadados) | `lib/foto.ts` (confira com `npm run conferir:foto`) |
| onde a foto mora e quando some (bucket privado, 7 dias) | `lib/servidor/fotos.ts`, `app/api/foto/route.ts`, `app/api/limpeza-fotos/route.ts` e o cron em `vercel.json` |
| a ficha do personagem antes de pagar (limite, prévia com marca d'água, bilhete do n8n); o personagem em telinhas curtas (`partesDoPersonagem` em `app/criar/EtapaPersonagem.tsx`) | regras em `lib/ficha.ts` (confira com `npm run conferir:ficha`), marca d'água desenhada em traços em `lib/marca.ts` (nunca `<text>`: a Vercel não tem fonte), banco em `lib/servidor/fichas.ts`, estilo vem da arte da turma em `public/artes/referencia-little-paws.png` (sempre a 1ª imagem para a OpenAI), rotas em `app/api/ficha/`, tela em `app/criar/EtapaFicha.tsx` |
| login e conta (e-mail e senha, link por e-mail, Google) | `components/FormularioDeConta.tsx`, "Entrar" do cabeçalho em `components/LinkDaConta.tsx` (a sessão no navegador em `lib/supabase/conta.ts`), `lib/servidor/sessao.ts`, `middleware.ts`, volta em `app/auth/callback/route.ts` |
| os livros publicados da turma, em inglês, na LP (capas e links da Amazon) | `lib/livros-publicados.ts`, seção `#little-paws` em `app/page.tsx` |
| a área "Minha conta", em formato de perfil (pedidos, baixar, senha, apagar fotos, sair, excluir conta) | `app/conta/` (ícones em `components/Icone.tsx`), `app/api/conta/`, `app/api/livro/[id]/route.ts` |
| endereço e chave pública do Supabase | `SUPABASE_PUBLICO` em `lib/config.ts` (públicos por natureza; a chave de serviço fica só na Vercel) |
| para onde vai o pedido (Supabase, n8n, link de pagamento) | `lib/servidor/pedidos.ts` e `app/api/pedido/route.ts` |
| a tabela de pedidos | `supabase/migrations/0001_pedidos.sql`; personagem, plano, fotos e consentimentos em `0002_personagem_e_fotos.sql`; contas, RLS de leitura e bucket `livros` em `0004_contas.sql`; fichas em `0005_fichas.sql`; todas aplicadas no projeto `meulivrinhodecolorir` (ref nkqxydwnarxjfypbeqji) em 18/10/2026 |
| eventos de medição (GA4, Meta Pixel) | `lib/analytics.ts` |
| UTM e QR code que acompanham o pedido | `components/GuardaOrigem.tsx` |
| WhatsApp, e-mail, CNPJ do rodapé | variáveis `NEXT_PUBLIC_*` (veja `.env.example`) |
| cores, fontes, botões | `app/globals.css` e `app/layout.tsx`, seguindo `docs/identidade-visual.md` |

## Como o pedido anda

1. A pessoa escolhe produto, tema e nome em `/criar`, vê a capa ao vivo e preenche contato.
   No futebol, antes do contato, cria o personagem: pelas características ou por foto.
   A foto só aparece com o Supabase ligado; sobe por `POST /api/foto`, que exige o
   aceite da versão atual do consentimento, redesenha a imagem sem metadados e
   registra a foto (apaga em 7 dias) e o aceite (só o prefixo da rede, sem o IP inteiro).
   Para pagar, precisa de conta (decisão do dono, 18/10/2026): a etapa final mostra
   o cadastro ou a entrada; o rascunho fica no localStorage para sobreviver à volta
   do Google e do link por e-mail (`/criar?etapa=pagar`).
   No futebol, depois do personagem vem "Conheça {nome}" (decisão do dono, 25/10/2026):
   com conta, o site pede a ficha (`POST /api/ficha`, até 3 por 24 horas; falha e ficha
   que virou pedido não contam) e avisa o n8n só com o id e um bilhete de uso único.
   O fluxo "Meu Livrinho: gerar ficha" busca o prompt em `/api/ficha/trabalho` com o
   bilhete, chama a OpenAI e devolve a imagem em `/api/ficha/pronta`; aí o bilhete
   morre. A família vê só `/api/ficha/<id>/previa` (640 px, marca d'água) e aprova ou
   ajusta. O livro nunca aparece antes do pagamento.
2. `POST /api/pedido` exige a sessão (401 sem ela) e, no futebol, a ficha aprovada
   da própria conta: o personagem do livro é o da ficha (do navegador só vale o
   superpoder) e a ficha fica presa ao pedido (`plano.ficha.aprovada`), usa o e-mail da conta, grava o
   `user_id` e valida de novo, recalcula o preço, confere que a foto existe
   e não venceu, monta o plano do livro (`lib/geracao.ts`) e grava no Supabase e/ou
   avisa o n8n (`N8N_WEBHOOK_PEDIDO`). O plano vai no campo `plano` da linha. Sem nenhum dos dois ligado, a rota recusa
   o pedido e manda a pessoa para o WhatsApp: pedido que não fica guardado é perdido.
3. Se existe `PAGAMENTO_LINK_<PRODUTO>_<PIX|CARTAO>`, a pessoa vai para o
   pagamento; senão, cai em `/obrigado` e o link segue pelo WhatsApp.
4. Todo dia às 06:17 UTC, a Vercel Cron chama `/api/limpeza-fotos` (com
   `CRON_SECRET`), que apaga do bucket as fotos vencidas e marca a hora.
5. O n8n grava o PDF no bucket privado `livros` como `<id do pedido>.pdf`, põe esse
   caminho em `link_pdf` e o status `entregue`. A família baixa em "Meus livrinhos"
   por link assinado de 60 segundos; o e-mail de entrega leva para `/conta`.
6. Do pagamento em diante (gerar a ficha e as páginas pelo plano, montar o PDF, enviar por e-mail e
   WhatsApp, lembretes D+1, pós-festa e aniversário) é do n8n. O link de
   pagamento deve voltar para `/obrigado?status=pago`.

## A suíte de navegador

Roda contra `scripts/supabase-falso.mjs` (Auth, REST com a regra de RLS, Storage
e o webhook do n8n), porque o ambiente de teste não alcança o Supabase de verdade.
O passo a passo está no topo de `scripts/navegador.mjs`. O falso imita a RLS; a
RLS de verdade foi conferida no banco com duas contas numa transação desfeita.

## Os livros Little Team Tales

`livros-fonte/` guarda os pacotes dos livros já publicados na KDP (história, ficha de
personagens, prompt mestre e prompts página a página), como o dono mandou em 18/10/2026.
É a base para as versões personalizadas e para manter a turma igual em toda arte nova:
Pip (coelho), Bo (urso), Luna (raposa), Milo (guaxinim), Dot (tartaruga). Fica fora de
`docs/` de propósito: os textos estão em inglês e com travessão, como foram publicados,
e não são texto do site.

## O que ainda NÃO está aqui

- Geração do PDF: o script Python dos livros Little Paws mora fora deste repositório.
- Confirmação automática de pagamento (webhook do Mercado Pago ou Stripe).
- Artes de Natal e Fundo do mar: só o Futebol usa as artes da turma Little Paws;
  os outros dois ainda mostram o desenho em SVG. A arte do livrinho de verdade vem do script.
- Fotos de clientes, prova social e order bump das etiquetas (entram depois das primeiras vendas).
