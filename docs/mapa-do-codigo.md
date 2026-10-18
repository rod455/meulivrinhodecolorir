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
| para onde vai o pedido (Supabase, n8n, link de pagamento) | `lib/servidor/pedidos.ts` e `app/api/pedido/route.ts` |
| a tabela de pedidos | `supabase/migrations/0001_pedidos.sql`; personagem, plano, fotos e consentimentos em `0002_personagem_e_fotos.sql` |
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
2. `POST /api/pedido` valida de novo, recalcula o preço, confere que a foto existe
   e não venceu, monta o plano do livro (`lib/geracao.ts`) e grava no Supabase e/ou
   avisa o n8n (`N8N_WEBHOOK_PEDIDO`). O plano vai no campo `plano` da linha. Sem nenhum dos dois ligado, a rota recusa
   o pedido e manda a pessoa para o WhatsApp: pedido que não fica guardado é perdido.
3. Se existe `PAGAMENTO_LINK_<PRODUTO>_<PIX|CARTAO>`, a pessoa vai para o
   pagamento; senão, cai em `/obrigado` e o link segue pelo WhatsApp.
4. Todo dia às 06:17 UTC, a Vercel Cron chama `/api/limpeza-fotos` (com
   `CRON_SECRET`), que apaga do bucket as fotos vencidas e marca a hora.
5. Do pagamento em diante (gerar a ficha e as páginas pelo plano, montar o PDF, enviar por e-mail e
   WhatsApp, lembretes D+1, pós-festa e aniversário) é do n8n. O link de
   pagamento deve voltar para `/obrigado?status=pago`.

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
